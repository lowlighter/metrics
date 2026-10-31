//Imports
import fs from "fs"

//Setup
export default async function({login, data, queries, imports, q, account}, {enabled = false, extras = false} = {}) {
  //Plugin execution
  try {
    //Check if plugin is enabled and requirements are met
    if ((!q.shikimori) || (!imports.metadata.plugins.shikimori.enabled(enabled, {extras})))
      return null

    //Load inputs
    const {
      user,
      medias,
      sections,
      statuses,
      people,
      sort,
      "title.language": title_language,
      score: score_display,
      limit,
      "limit.characters": limit_characters,
      "limit.people": limit_people,
      shuffle,
      "display.stats": display_stats,
      "achievements.filter": achievements_filter,
      "limit.achievements": limit_achievements,
      "display.achievements": display_achievements,
      "display.favorites": display_favorites,
      "display.lists": display_lists,
      "display.characters": display_characters,
      "display.people": display_people,
    } = imports.metadata.plugins.shikimori.inputs({data, account, q})

    //Initialization
    const result = {user: null, sections, lists: Object.fromEntries(medias.map(media => [media, {}])), favorites: Object.fromEntries(medias.map(media => [media, []])), characters: [], people: {}, stats: {}, achievements: [], genres: []}

    //User resolution
    console.debug(`metrics/compute/${login}/plugins > shikimori > resolving user ${user}`)
    //The search is fuzzy and may rank a different account above the exact nickname, so inspect a small candidate window instead of a single top hit; only an exact (case-insensitive) match is accepted.
    const found = await request({login, imports, url: `https://shikimori.io/api/users?search=${encodeURIComponent(user)}&limit=10`})
    const resolved = Array.isArray(found) ? found.find(({nickname}) => `${nickname}`.toLowerCase() === `${user}`.toLowerCase()) : null
    if (!resolved?.id)
      throw failure(`Could not resolve Shikimori user ${user}: no nickname exactly matching "${user}" was found`)
    result.user = {id: resolved.id, nickname: resolved.nickname}

    //Medias lists
    if (sections.includes("lists")) {
      //Manga and ranobe share the Manga target type: query it once and split the rates client-side.
      const targets = [...new Set(medias.map(media => media === "anime" ? "Anime" : "Manga"))]
      //Site order only needs enough pages to fill the displayed lists; score/release sorting needs the whole collection, a disabled limit shows everything, and any shuffle samples the whole collection before cutting it (AniList parity: shuffle then cut). The Task 2 stats summary keeps its own full pagination.
      const paginate_all = (sort !== "site") || (limit === 0) || shuffle
      for (const targetType of targets) {
        //Ranobe are exactly the light novel rates; light novels are therefore excluded from the general manga list. They are disjoint partitions of the shared Manga pool, so each displayed list must be filled, not merely their combined length.
        const displayed = medias.filter(media => (media === "anime" ? "Anime" : "Manga") === targetType)
        const partition = (media, rates) => media === "manga" ? rates.filter(({manga}) => manga?.kind !== "light_novel") : media === "ranobe" ? rates.filter(({manga}) => manga?.kind === "light_novel") : rates
        const satisfied = rates => displayed.every(media => partition(media, rates).length >= limit)
        for (const status of statuses) {
          //Query API (pagination through userRates pages, the API clamps limit to 50 per page, capped at 10 pages)
          const rates = []
          let page = 1
          let entries
          do {
            console.debug(`metrics/compute/${login}/plugins > shikimori > querying api (lists ${targetType} ${status} - page ${page})`)
            const variables = {page, limit: 50, userId: result.user.id, targetType, status, order: sort === "updated" ? {field: "updated_at", order: "desc"} : {field: "id", order: "asc"}}
            const query = queries.shikimori.lists({media: targetType === "Anime" ? "anime" : "manga", details: targetType === "Anime" ? "episodes\n      studios { name }" : "chapters\n      volumes"})
            const response = await request({login, imports, url: "https://shikimori.io/api/graphql", body: {query, variables}})
            entries = response.data?.userRates
            if (!Array.isArray(entries))
              throw failure(`Invalid Shikimori ${targetType} ${status} list response`)
            rates.push(...entries)
            page++
          }
          while ((entries.length === 50) && (page <= 10) && (paginate_all || (!satisfied(rates))))
          for (const media of displayed) {
            //Format and save results
            const list = partition(media, rates).map(rate => format({media, entity: targetType === "Anime" ? rate.anime : rate.manga, rate, title_language}))
            result.lists[media][status] = await encode({list: mask({list: ordering({list, sort, shuffle, limit, imports}), score_display}), imports, cover: display_lists.includes("cover")})
          }
        }
      }
    }

    //Favorites (v1 API, shared by favorites, characters and people sections)
    let favorites = null
    if ((sections.includes("favorites")) || (sections.includes("characters")) || (sections.includes("people"))) {
      console.debug(`metrics/compute/${login}/plugins > shikimori > querying api (favorites)`)
      favorites = await request({login, imports, url: `https://shikimori.io/api/users/${result.user.id}/favourites`})
      if (!["animes", "mangas", "ranobe", "characters", "people", "seyu", "mangakas", "producers"].every(kind => Array.isArray(favorites?.[kind])))
        throw failure("Invalid Shikimori favorites response")
    }

    //Favorites anime/manga/ranobe
    if (sections.includes("favorites")) {
      for (const media of medias) {
        //Favorites entries in Shikimori website order
        const entries = favorites[{anime: "animes", manga: "mangas", ranobe: "ranobe"}[media]]
        if (!entries.length)
          continue
        //Catalog roots also clamp to 50 per alias. Resolve at most 100 ids per POST so heavy collections stay below the live GraphQL complexity cap, looping and merging into one map.
        const root = media === "anime" ? "animes" : "mangas"
        const resolved = {}
        let alias = 0
        for (let offset = 0; offset < entries.length; offset += 100) {
          const slice = entries.slice(offset, offset + 100)
          const batches = [], variables = {}
          for (let inner = 0; inner < slice.length; inner += 50) {
            const key = `ids${batches.length}`
            variables[key] = slice.slice(inner, inner + 50).map(({id}) => id).join(",")
            batches.push(`media${alias}: ${root}(ids: $${key}, limit: 50) { ...FavoriteMedia }`)
            alias++
          }
          const base = alias - batches.length
          const query = queries.shikimori["favorites-medias"]({variables: Object.keys(variables).map(key => `$${key}: String!`).join(", "), medias: batches.join("\n  "), type: media === "anime" ? "Anime" : "Manga", details: media === "anime" ? "episodes\n  studios { name }" : "chapters\n  volumes"})
          console.debug(`metrics/compute/${login}/plugins > shikimori > querying api (favorites ${media}s - ${slice.length}/${entries.length} entries)`)
          const {data: batch} = await request({login, imports, url: "https://shikimori.io/api/graphql", body: {query, variables}})
          if (!batches.every((_, index) => Array.isArray(batch?.[`media${base + index}`])))
            throw failure(`Invalid Shikimori ${media} favorites response`)
          Object.assign(resolved, batch)
        }
        //Format and save results, preserving the favorites response order
        const medias_data = new Map(Object.values(resolved).flat().map(entity => [`${entity.id}`, entity]))
        const list = entries.map(({id, image}) => format({media, id, image, entity: medias_data.get(`${id}`), rate: null, title_language}))
        result.favorites[media] = await encode({list: mask({list: ordering({list, sort, shuffle, limit, imports}), score_display}), imports, cover: display_favorites.includes("cover")})
      }
    }

    //Favorites characters
    if (sections.includes("characters"))
      result.characters = await strips({entries: favorites.characters, imports, shuffle: sort === "site" && shuffle, limit: limit_characters, artwork: display_characters.includes("artwork")})

    //Favorites people (one strip per selected key, in configuration order)
    if (sections.includes("people")) {
      for (const kind of people)
        result.people[kind] = await strips({entries: favorites[kind], imports, shuffle: sort === "site" && shuffle, limit: limit_people, artwork: display_people.includes("artwork")})
    }

    //Profile statistics (v1 API, shared by stats and genres sections)
    if ((sections.includes("stats")) || (sections.includes("genres"))) {
      console.debug(`metrics/compute/${login}/plugins > shikimori > querying api (profile statistics)`)
      const profile = await request({login, imports, url: `https://shikimori.io/api/users/${result.user.id}`})
      if ((!profile?.stats) || (typeof profile.stats !== "object") || (Array.isArray(profile.stats)))
        throw failure("Invalid Shikimori profile statistics response")
      const {stats} = profile
      if (sections.includes("stats")) {
        if (![stats.full_statuses?.anime, stats.full_statuses?.manga, stats.scores?.anime, stats.scores?.manga, stats.activity].every(Array.isArray))
          throw failure("Invalid Shikimori profile statistics response")
        //Full statuses retain rewatching; size is a title count, summed by name rather than array position.
        const counts = new Map()
        for (const {name, size} of [...stats.full_statuses.anime, ...stats.full_statuses.manga]) {
          if ((typeof name !== "string") || (!Number.isFinite(size)))
            throw failure("Invalid Shikimori status statistics response")
          counts.set(name, (counts.get(name) ?? 0) + size)
        }
        result.stats = {
          summary: display_stats.includes("summary") ? await summarize({login, imports, queries, userId: result.user.id}) : null,
          statuses: [...counts].map(([name, value]) => ({name, value})),
          scores: stats.scores,
          activity: stats.activity.map(({name: [from, to], value}) => ({from, to, value})),
        }
      }
      if (sections.includes("genres"))
        result.genres = [...(stats.genres ?? [])].sort((a, b) => b.value - a.value).slice(0, 8).map(({name}) => name)
    }

    //Achievements (v1 API; image-less responses use exact per-level metadata from the MIT rules source)
    if (sections.includes("achievements")) {
      console.debug(`metrics/compute/${login}/plugins > shikimori > querying api (achievements)`)
      const entries = await request({login, imports, url: `https://shikimori.io/api/achievements?user_id=${result.user.id}`})
      if ((!Array.isArray(entries)) || (!entries.every(entry => (typeof entry?.neko_id === "string") && (Number.isInteger(entry.level)) && (Number.isFinite(entry.progress)))))
        throw failure("Invalid Shikimori achievements response")
      const selected = entries.filter(({level}) => achievements_filter === "all" || level >= 1).sort((a, b) => b.level - a.level || b.progress - a.progress)
      if (limit_achievements > 0)
        selected.splice(limit_achievements)
      //Extracted from shikimori/neko-achievements@848daf99ba7c9663d48077e81cf3d1efbb568aa9; see neko-achievements.LICENSE.
      const titles = JSON.parse(fs.readFileSync(new URL("./neko-titles.json", import.meta.url), "utf8"))
      const icons = display_achievements.includes("icons") ? JSON.parse(fs.readFileSync(new URL("./neko-icons.json", import.meta.url), "utf8")) : null
      const language = title_language === "russian" ? "title_ru" : "title_en"
      result.achievements = await Promise.all(selected.map(async ({neko_id, level, progress}) => ({
        neko_id,
        level,
        progress,
        name: titles[neko_id]?.[String(level)]?.[language] || neko_id,
        icon: await achievementIcon({path: icons?.[neko_id]?.[String(level)], imports}),
      })))
    }

    //Results
    return result
  }
  //Handle errors
  catch (error) {
    throw imports.format.error(error)
  }
}

/**An unknown icon or failed download retains the achievement's chip data */
async function achievementIcon({path, imports}) {
  if (!path)
    return null
  try {
    return await imports.imgb64(imageUrl(path), {fallback: false})
  }
  catch (error) {
    console.debug(`metrics/imgb64 > shikimori > achievement icon failed for ${path}: ${error}`)
    return null
  }
}

/**Sum all rate counters independently of card media, status, sort and display limits */
async function summarize({login, imports, queries, userId}) {
  const summary = {episodes: 0, chapters: 0}
  const query = queries.shikimori.summary()
  const max_pages = 100
  for (const targetType of ["Anime", "Manga"]) {
    const field = targetType === "Anime" ? "episodes" : "chapters"
    for (let page = 1; page <= max_pages; page++) {
      console.debug(`metrics/compute/${login}/plugins > shikimori > querying api (summary ${targetType} - page ${page})`)
      //Status is optional: one sweep per target covers every status, including Manga-kind ranobe rates.
      const variables = {page, limit: 50, userId, targetType, order: {field: "id", order: "asc"}}
      const response = await request({login, imports, url: "https://shikimori.io/api/graphql", body: {query, variables}})
      const entries = response?.data?.userRates
      if (!Array.isArray(entries))
        throw failure(`Invalid Shikimori ${targetType} summary response`)
      for (const rate of entries) {
        if (!Number.isFinite(rate?.[field]))
          throw failure(`Invalid Shikimori ${targetType} summary count`)
        summary[field] += rate[field]
      }
      if (entries.length < 50)
        break
      if (page === max_pages)
        throw failure(`Shikimori summary exceeded ${max_pages} pages for ${targetType}`)
    }
  }
  return summary
}

/**Media formatter (raw scores; the display mask is applied after ordering) */
function format({media, entity, rate, id, image, title_language}) {
  if (!entity)
    throw failure(`Could not resolve Shikimori ${media} ${id ?? rate?.id} card`)
  const type = media === "anime" ? "ANIME" : "MANGA"
  return {
    name: entity[title_language] ?? entity.name,
    type,
    status: entity.status,
    release: entity.airedOn?.year ?? entity.releasedOn?.year ?? null,
    genres: (entity.genres ?? []).map(({name}) => name),
    studio: type === "ANIME" ? entity.studios?.[0]?.name ?? null : null,
    progress: rate ? (media === "anime" ? rate.episodes : rate.chapters) : null,
    volumes: (rate) && (media !== "anime") ? rate.volumes : null,
    description: entity.description?.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() ?? "",
    scores: {user: rate?.score ?? null, community: entity.score ?? null},
    released: type === "ANIME" ? entity.episodes ?? null : entity.chapters ?? null,
    artwork: imageUrl(entity.poster?.originalUrl ?? image),
  }
}

/**Apply the configured score display mask; it never affects sorting */
function mask({list, score_display}) {
  return list.map(card => ({
    ...card,
    scores: {
      user: ["user", "both"].includes(score_display) ? card.scores.user : null,
      community: ["community", "both"].includes(score_display) ? card.scores.community : null,
    },
  }))
}

/**Encode only retained cards with visible covers after sorting, shuffling and limiting */
async function encode({list, imports, cover}) {
  return Promise.all(list.map(async card => ({...card, artwork: cover ? await imports.imgb64(card.artwork) : null})))
}

/**Favorites strip formatter (characters and people) */
async function strips({entries, imports, shuffle, limit, artwork}) {
  let selected = shuffle ? imports.shuffle([...entries]) : entries
  if (limit > 0)
    selected = selected.slice(0, limit)
  return Promise.all(selected.map(async ({name, image}) => ({
    name,
    artwork: artwork ? await imports.imgb64(imageUrl(image)) : null,
  })))
}

/**Ordering helper (sort on raw scores, shuffle then cut) */
function ordering({list, sort, shuffle, limit, imports}) {
  let ordered = [...list]
  if (sort === "score")
    ordered.sort((a, b) => (b.scores.community ?? b.scores.user ?? -1) - (a.scores.community ?? a.scores.user ?? -1))
  if (sort === "release")
    ordered.sort((a, b) => (b.release ?? -1) - (a.release ?? -1))
  if ((sort === "site") && (shuffle))
    ordered = imports.shuffle(ordered)
  if (limit > 0)
    ordered.splice(limit)
  return ordered
}

/**Canonical absolute artwork URL */
function imageUrl(image) {
  return image ? new URL(image, "https://shikimori.io").href : null
}

/**Preserve actionable messages through the shared error formatter */
function failure(message) {
  return {error: {message, instance: new Error(message)}}
}

/**Anonymous request with rate-limit-only retries */
async function request({login, imports, url, body}) {
  for (let attempt = 1; ; attempt++) {
    try {
      const options = {headers: {"User-Agent": "metrics"}, timeout: 30000}
      const {data} = body ? await imports.axios.post(url, body, options) : await imports.axios.get(url, options)
      if (data?.errors?.length)
        throw failure(`Shikimori GraphQL error: ${data.errors.map(({message}) => message).join("; ")}`)
      return data
    }
    catch (error) {
      if ((!error.isAxiosError) || (error.response?.status !== 429))
        throw error
      if (attempt >= 5)
        throw failure(`Shikimori requests limit reached after ${attempt} attempts`)
      const retry_header = error.response.headers?.["retry-after"]
      const retry_seconds = Number(retry_header)
      const retry_date = Date.parse(retry_header)
      const retry_after = Number.isFinite(retry_seconds) ? retry_seconds : Number.isFinite(retry_date) ? Math.ceil((retry_date - Date.now()) / 1000) : 0
      const delay = Math.max(0, retry_after) + 5
      console.debug(`metrics/compute/${login}/plugins > shikimori > reached requests limit, retrying in ${delay}s`)
      await imports.wait(delay)
    }
  }
}
