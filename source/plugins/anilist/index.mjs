//Setup
export default async function({login, data, queries, imports, q, account}, {enabled = false, extras = false} = {}) {
  //Plugin execution
  try {
    //Check if plugin is enabled and requirements are met
    if ((!enabled) || (!q.anilist) || (!imports.metadata.plugins.anilist.extras("enabled", {extras})))
      return null

    //Load inputs
    let {limit, "limit.characters": limit_characters, medias, sections, shuffle, user} = imports.metadata.plugins.anilist.inputs({data, account, q})

    //Initialization
    const result = {user: {name: user, stats: null, genres: []}, lists: Object.fromEntries(medias.map(type => [type, {}])), characters: [], sections}

    //User statistics
    for (let retried = false; !retried; retried = true) {
      try {
        //Query API
        console.debug(`metrics/compute/${login}/plugins > anilist > querying api (user statistics)`)
        const {data: {data: {User: {statistics: stats}}}} = await imports.axios.post("https://graphql.anilist.co", {variables: {name: user}, query: queries.anilist.statistics()})
        //Format and save results
        result.user.stats = stats
        result.user.genres = [...new Set([...stats.anime.genres.map(({genre}) => genre), ...stats.manga.genres.map(({genre}) => genre)])]
      }
      catch (error) {
        await retry({login, imports, error})
      }
    }

    //Medias lists
    if ((sections.includes("watching")) || (sections.includes("reading"))) {
      for (const type of medias) {
        for (let retried = false; !retried; retried = true) {
          try {
            //Query API
            console.debug(`metrics/compute/${login}/plugins > anilist > querying api (medias lists - ${type})`)
            const {data: {data: {MediaListCollection: {lists}}}} = await imports.axios.post("https://graphql.anilist.co", {variables: {name: user, type: type.toLocaleUpperCase()}, query: queries.anilist.medias()})
            //Format and save results
            for (const {name, entries} of lists) {
              //Format results
              const list = await Promise.all(entries.map(media => format({media, imports})))
              result.lists[type][name.toLocaleLowerCase()] = shuffle ? imports.shuffle(list) : list
              //Limit results
              if (limit > 0) {
                console.debug(`metrics/compute/${login}/plugins > anilist > keeping only ${limit} medias`)
                result.lists[type][name.toLocaleLowerCase()].splice(limit)
              }
            }
          }
          catch (error) {
            await retry({login, imports, error})
          }
        }
      }
    }

    //Favorites anime/manga
    if (sections.includes("favorites")) {
      for (const type of medias) {
        //Query API
        console.debug(`metrics/compute/${login}/plugins > anilist > querying api (favorites ${type}s)`)
        const list = []
        let page = 1
        let next = false
        do {
          try {
            console.debug(`metrics/compute/${login}/plugins > anilist > querying api (favorites ${type}s - page ${page})`)
            const {data: {data: {User: {favourites: {[type]: {nodes, pageInfo: cursor}}}}}} = await imports.axios.post("https://graphql.anilist.co", {variables: {name: user, page}, query: queries.anilist.favorites({type})})
            page++
            next = cursor.hasNextPage
            list.push(...await Promise.all(nodes.map(media => format({media: {progess: null, score: null, media}, imports}))))
          }
          catch (error) {
            if (await retry({login, imports, error}))
              continue
          }
        } while (next)
        //Format and save results
        result.lists[type].favorites = shuffle ? imports.shuffle(list) : list
        //Limit results
        if (limit > 0) {
          console.debug(`metrics/compute/${login}/plugins > anilist > keeping only ${limit} medias`)
          result.lists[type].favorites.splice(limit)
        }
      }
    }

    //Favorites characters
    if (sections.includes("characters")) {
      //Query API
      console.debug(`metrics/compute/${login}/plugins > anilist > querying api (favorites characters)`)
      const characters = []
      let page = 1
      let next = false
      do {
        try {
          console.debug(`metrics/compute/${login}/plugins > anilist > querying api (favorites characters - page ${page})`)
          const {data: {data: {User: {favourites: {characters: {nodes, pageInfo: cursor}}}}}} = await imports.axios.post("https://graphql.anilist.co", {variables: {name: user, page}, query: queries.anilist.characters()})
          page++
          next = cursor.hasNextPage
          for (const {name: {full: name}, image: {medium: artwork}} of nodes) {
            console.debug(`metrics/compute/${login}/plugins > anilist > processing ${name}`)
            characters.push({name, artwork: await imports.imgb64(artwork)})
          }
        }
        catch (error) {
          if (await retry({login, imports, error}))
            continue
        }
      } while (next)
      //Format and save results
      result.characters = shuffle ? imports.shuffle(characters) : characters
      //Limit results
      if (limit_characters > 0) {
        console.debug(`metrics/compute/${login}/plugins > anilist > keeping only ${limit_characters} characters`)
        result.characters.splice(limit_characters)
      }
    }

    //Results
    return result
  }
  //Handle errors
  catch (error) {
    throw imports.format.error(error)
  }
}

/**Media formatter */
async function format({media, imports}) {
  const {progress, score: userScore, media: {title, description, status, startDate: {year: release}, genres, averageScore, episodes, chapters, type, coverImage: {medium: artwork}}} = media
  return {
    name: title.romaji,
    type,
    status,
    release,
    genres,
    progress,
    description: description?.replace(/<br\s*\\?>/g, " ") ?? "",
    scores: {user: userScore, community: averageScore},
    released: type === "ANIME" ? episodes : chapters,
    artwork: await imports.imgb64(artwork),
  }
}

/**Rate-limiter handler */
async function retry({login, imports, error}) {
  if ((error.isAxiosError) && (error.response.status === 429)) {
    const delay = Number(error.response.headers["retry-after"]) + 5
    console.debug(`metrics/compute/${login}/plugins > anilist > reached requests limit, retrying in ${delay}s`)
    await imports.wait(delay)
    return true
  }
  throw error
}
