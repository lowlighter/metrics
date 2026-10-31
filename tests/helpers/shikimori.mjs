//Run the real ESM plugin, input parser and query loader below Jest's CommonJS boundary.
//Only network, artwork retrieval, waiting and random shuffling are test doubles.
import setup from "../../source/app/metrics/setup.mjs"
import { formatters } from "../../source/app/metrics/utils.mjs"

async function run() {
  console.debug = () => null
  const {Plugins, conf} = await setup({sandbox: true, log: false})
  const {format} = formatters()

  const entity = (id, type = "anime") => ({
    id: `${id}`,
    name: `Name ${id}`,
    english: id === 3 ? null : `English ${id}`,
    russian: `Russian ${id}`,
    japanese: `Japanese ${id}`,
    kind: id === 9 ? "light_novel" : type === "anime" ? "tv" : "manga",
    status: "released",
    airedOn: {year: {"1": 2021, "2": 2019, "3": 2020}[id] ?? 2022},
    releasedOn: {year: 2023},
    score: {"1": 2, "2": 9, "3": 5}[id] ?? 8.25,
    description: "First<br><b>second</b>",
    genres: [{name: "Drama"}, {name: "Adventure"}],
    ...(type === "anime" ? {episodes: 12, studios: [{name: "Studio"}]} : {chapters: 40, volumes: 4}),
    poster: {originalUrl: id === 3 ? null : `https://shikimori.io/uploads/poster/${type}/${id}.jpg`},
  })
  const favorite = id => ({id, name: `Name ${id}`, russian: `Russian ${id}`, image: `/system/animes/x64/${id}.jpg`, url: null})
  const person = name => ({id: 1, name, russian: name, image: "/system/people/x64/1.jpg", url: null})
  const favorites = {
    animes: [3, 1, 2].map(favorite),
    mangas: [7, 8].map(favorite),
    ranobe: [9].map(favorite),
    characters: [person("Character A"), person("Character B")],
    people: [person("Person A")],
    seyu: [person("Voice A"), person("Voice B")],
    mangakas: [person("Author A"), person("Author B")],
    producers: [],
  }
  const statusNames = ["planned", "watching", "rewatching", "completed", "on_hold", "dropped"]
  const statusCounts = (type, sizes) => statusNames.map((name, id) => ({id, grouped_id: name === "rewatching" ? "watching" : name, name, size: sizes[id], type}))
  const profile = {
    id: 123,
    nickname: "whynothacked",
    stats: {
      //Grouped statuses deliberately disagree: full_statuses is the six-status source of truth.
      statuses: {anime: [{name: "watching", size: 999}], manga: [{name: "watching", size: 999}]},
      full_statuses: {anime: statusCounts("Anime", [10, 2, 3, 20, 4, 5]), manga: statusCounts("Manga", [7, 8, 9, 11, 12, 13]).reverse()},
      scores: {anime: [{name: "10", value: 4}, {name: "7", value: 2}, {name: "0", value: 5}], manga: []},
      activity: [{name: [1763672400, 1764815537], value: 8}, {name: [1764815537, 1765958674], value: 0}, {name: [1765958674, 1765958847], value: 3}],
      genres: [{name: "Drama", value: 20}, {name: "Comedy", value: 12}, {name: "Adventure", value: 40}, {name: "Mystery", value: 3}, {name: "Fantasy", value: 35}, {name: "Slice of Life", value: 8}, {name: "Action", value: 50}, {name: "Romance", value: 27}, {name: "Sci-Fi", value: 11}, {name: "Sports", value: 4}],
    },
  }
  const achievements = [
    {neko_id: "comedy", level: 2, progress: 40},
    {neko_id: "drama", level: 2, progress: 90},
    {neko_id: "fantasy", level: 3, progress: 60},
    {neko_id: "unknown_achievement", level: 1, progress: 80},
    {neko_id: "tetsurou_araki", level: 0, progress: 55},
    {neko_id: "code_geass", level: 1, progress: 100},
    {neko_id: "mecha", level: 0, progress: 30},
  ].map((achievement, index) => ({id: 1000 + index, user_id: 123, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-10-01T00:00:00Z", ...achievement}))
  const inputs = overrides => ({shikimori: true, "shikimori.user": "whynothacked", "shikimori.shuffle": "no", ...overrides})
  const scenarios = {
    defaults: {q: {shikimori: true}},
    favoriteOrder: {q: inputs({"shikimori.medias": "anime", "shikimori.limit": 0})},
    favoritesNoCover: {q: inputs({"shikimori.medias": "anime", "shikimori.display.favorites": "title, score"})},
    listsNoCover: {q: inputs({"shikimori.sections": "lists", "shikimori.medias": "anime", "shikimori.statuses": "watching, completed", "shikimori.display.lists": "title, progress"})},
    independentCovers: {q: inputs({"shikimori.sections": "favorites, lists", "shikimori.medias": "anime", "shikimori.display.favorites": "title", "shikimori.display.lists": "cover, title"})},
    favoriteLarge: {q: inputs({"shikimori.medias": "anime", "shikimori.limit": 0}), large: true},
    favoriteScore: {q: inputs({"shikimori.medias": "anime", "shikimori.sort": "score", "shikimori.shuffle": "yes"})},
    favoriteScoreUser: {q: inputs({"shikimori.medias": "anime", "shikimori.sort": "score", "shikimori.score": "user"})},
    favoriteHuge: {q: inputs({"shikimori.medias": "anime", "shikimori.limit": 0}), huge: true},
    listScoreOff: {q: inputs({"shikimori.sections": "lists", "shikimori.medias": "anime", "shikimori.sort": "score", "shikimori.score": "off"})},
    siteMinimal: {q: inputs({"shikimori.sections": "lists", "shikimori.medias": "anime", "shikimori.limit": 2}), paginate: true},
    listScore: {q: inputs({"shikimori.sections": "lists", "shikimori.medias": "anime", "shikimori.sort": "score", "shikimori.limit": 2}), paginate: true},
    //Default sort+shuffle combination (site + yes): the shuffle pool must span more than one page.
    siteShufflePages: {q: inputs({"shikimori.sections": "lists", "shikimori.medias": "anime", "shikimori.shuffle": "yes", "shikimori.limit": 2}), paginate: true},
    //Manga and ranobe are disjoint partitions of one Manga pool: both displayed lists must fill from it.
    mixedRanobe: {q: inputs({"shikimori.sections": "lists", "shikimori.medias": "manga, ranobe", "shikimori.limit": 2}), mixedRanobe: true},
    favoriteRelease: {q: inputs({"shikimori.medias": "anime", "shikimori.sort": "release", "shikimori.shuffle": "yes"})},
    favoriteUpdated: {q: inputs({"shikimori.medias": "anime", "shikimori.sort": "updated", "shikimori.shuffle": "yes"})},
    favoriteShuffle: {q: inputs({"shikimori.medias": "anime", "shikimori.shuffle": "yes"})},
    favoriteManga: {q: inputs({"shikimori.medias": "manga, ranobe", "shikimori.score": "both"})},
    russian: {q: inputs({"shikimori.medias": "anime", "shikimori.title.language": "russian"})},
    japanese: {q: inputs({"shikimori.medias": "anime", "shikimori.title.language": "japanese"})},
    lists: {q: inputs({"shikimori.sections": "lists", "shikimori.statuses": "watching, completed", "shikimori.medias": "anime, manga, ranobe", "shikimori.score": "both", "shikimori.limit": 0})},
    pagination: {q: inputs({"shikimori.sections": "lists", "shikimori.medias": "anime", "shikimori.limit": 0}), paginate: true},
    cap: {q: inputs({"shikimori.sections": "lists", "shikimori.medias": "anime", "shikimori.limit": 0}), fullPages: true},
    updated: {q: inputs({"shikimori.sections": "lists", "shikimori.medias": "anime", "shikimori.sort": "updated", "shikimori.shuffle": "yes"})},
    strips: {q: inputs({"shikimori.sections": "characters, people", "shikimori.people": "seyu, mangakas", "shikimori.limit.characters": 1, "shikimori.limit.people": 1})},
    stripsShuffle: {q: inputs({"shikimori.sections": "characters, people", "shikimori.people": "seyu", "shikimori.limit.characters": 1, "shikimori.limit.people": 1, "shikimori.shuffle": "yes"})},
    stripsNoShuffle: {q: inputs({"shikimori.sections": "characters, people", "shikimori.people": "seyu", "shikimori.sort": "release", "shikimori.shuffle": "yes"})},
    stripFields: {q: inputs({"shikimori.sections": "characters, people", "shikimori.people": "seyu", "shikimori.display.characters": "name", "shikimori.display.people": "name"})},
    stripCharactersNoArtwork: {q: inputs({"shikimori.sections": "characters, people", "shikimori.people": "seyu", "shikimori.display.characters": "name"})},
    stripPeopleNoArtwork: {q: inputs({"shikimori.sections": "characters, people", "shikimori.people": "seyu", "shikimori.display.people": "name"})},
    stripNoDisplay: {q: inputs({"shikimori.sections": "characters, people", "shikimori.people": "seyu", "shikimori.display.characters": "", "shikimori.display.people": ""})},
    statsGeneric: {q: inputs({"shikimori.sections": "stats", "shikimori.display.stats": "statuses, distribution, activity"})},
    statsNoSummary: {q: inputs({"shikimori.sections": "stats", "shikimori.display.stats": "statuses"})},
    statsNoSummaryWithLists: {q: inputs({"shikimori.sections": "stats, lists", "shikimori.medias": "anime", "shikimori.display.stats": "statuses"})},
    statsSummary: {q: inputs({"shikimori.sections": "stats, lists", "shikimori.medias": "anime", "shikimori.limit": 2, "shikimori.statuses": "watching"})},
    statsSummaryRanobe: {q: inputs({"shikimori.sections": "stats", "shikimori.medias": "ranobe", "shikimori.statuses": "dropped", "shikimori.limit": 0})},
    statsSummaryEmpty: {q: inputs({"shikimori.sections": "stats", "shikimori.display.stats": "summary"}), emptySummary: true},
    summaryCap: {q: inputs({"shikimori.sections": "stats"}), summaryCap: true},
    summaryMangaCap: {q: inputs({"shikimori.sections": "stats"}), summaryMangaCap: true},
    summaryLastPageShort: {q: inputs({"shikimori.sections": "stats"}), summaryLastPageShort: true},
    summaryMalformed: {q: inputs({"shikimori.sections": "stats"}), malformedSummary: true},
    summaryMalformedCount: {q: inputs({"shikimori.sections": "stats"}), malformedSummaryCount: true},
    summaryGraphqlError: {q: inputs({"shikimori.sections": "stats"}), summaryGraphqlError: true},
    summaryFailure: {q: inputs({"shikimori.sections": "stats"}), summaryFailure: true},
    summaryRetry: {q: inputs({"shikimori.sections": "stats"}), summaryRetry: true},
    statsAndGenres: {q: inputs({"shikimori.sections": "stats, genres", "shikimori.display.stats": "statuses, distribution, activity"})},
    statsEmptyAggregates: {q: inputs({"shikimori.sections": "stats", "shikimori.display.stats": "distribution, activity"}), emptyAggregates: true},
    genres: {q: inputs({"shikimori.sections": "genres"})},
    genresEmpty: {q: inputs({"shikimori.sections": "genres"}), emptyGenres: true},
    genresMissing: {q: inputs({"shikimori.sections": "genres"}), missingGenres: true},
    missingProfile: {q: inputs({"shikimori.sections": "stats"}), missingProfile: true},
    missingStats: {q: inputs({"shikimori.sections": "genres"}), missingStats: true},
    malformedStats: {q: inputs({"shikimori.sections": "stats"}), malformedStats: true},
    profileFailure: {q: inputs({"shikimori.sections": "stats"}), profileFailure: true},
    achievementsEarned: {q: inputs({"shikimori.sections": "achievements", "shikimori.limit.achievements": 0, "shikimori.display.achievements": "chips"})},
    achievementsAll: {q: inputs({"shikimori.sections": "achievements", "shikimori.achievements.filter": "all", "shikimori.limit.achievements": 0, "shikimori.display.achievements": "chips"})},
    achievementsLimited: {q: inputs({"shikimori.sections": "achievements", "shikimori.limit.achievements": 3, "shikimori.display.achievements": "icons"})},
    achievementsAllLimited: {q: inputs({"shikimori.sections": "achievements", "shikimori.achievements.filter": "all", "shikimori.limit.achievements": 6, "shikimori.display.achievements": "chips"})},
    achievementsChips: {q: inputs({"shikimori.sections": "achievements", "shikimori.achievements.filter": "all", "shikimori.limit.achievements": 0, "shikimori.display.achievements": "chips"})},
    achievementsIcons: {q: inputs({"shikimori.sections": "achievements", "shikimori.achievements.filter": "all", "shikimori.limit.achievements": 0}), comedyGif: true},
    achievementsRussian: {q: inputs({"shikimori.sections": "achievements", "shikimori.limit.achievements": 0, "shikimori.display.achievements": "chips", "shikimori.title.language": "russian"})},
    achievementsJapanese: {q: inputs({"shikimori.sections": "achievements", "shikimori.limit.achievements": 0, "shikimori.display.achievements": "chips", "shikimori.title.language": "japanese"})},
    achievementsUnknownLevel: {q: inputs({"shikimori.sections": "achievements", "shikimori.limit.achievements": 0}), unknownLevel: true},
    achievementsIconNull: {q: inputs({"shikimori.sections": "achievements", "shikimori.limit.achievements": 0}), iconNull: "https://shikimori.io/assets/achievements/anime/drama_2.jpg"},
    achievementsIconReject: {q: inputs({"shikimori.sections": "achievements", "shikimori.limit.achievements": 0}), iconReject: "https://shikimori.io/assets/achievements/anime/drama_2.jpg"},
    achievementsEmpty: {q: inputs({"shikimori.sections": "achievements"}), emptyAchievements: true},
    achievementsMissing: {q: inputs({"shikimori.sections": "achievements"}), missingAchievements: true},
    achievementsMalformed: {q: inputs({"shikimori.sections": "achievements"}), malformedAchievements: true},
    achievementsFailure: {q: inputs({"shikimori.sections": "achievements"}), achievementsFailure: true},
    achievementsRetry: {q: inputs({"shikimori.sections": "achievements", "shikimori.limit.achievements": 0, "shikimori.display.achievements": "chips"}), retryAchievements: true},
    achievementsNoDisplay: {q: inputs({"shikimori.sections": "achievements", "shikimori.limit.achievements": 0, "shikimori.display.achievements": ""})},
    empty: {q: inputs({"shikimori.sections": "favorites, characters, people"}), empty: true},
    unknown: {q: inputs({"shikimori.sections": "favorites, unknown", "shikimori.display.favorites": "title, unknown, cover", "shikimori.display.lists": "", "shikimori.display.characters": "unknown, name", "shikimori.display.people": ""})},
    missingUser: {q: inputs({"shikimori.user": "missing nickname"}), missingUser: true},
    nicknameMismatch: {q: inputs({"shikimori.user": "missing nickname"}), nicknameMismatch: true},
    nicknameNotFirst: {q: inputs({"shikimori.user": "whynothacked"}), nicknameNotFirst: true},
    missingFavorite: {q: inputs({"shikimori.medias": "anime"}), missingFavorite: true},
    graphqlError: {q: inputs({"shikimori.sections": "lists", "shikimori.medias": "anime"}), graphqlError: true},
    malformedFavorites: {q: inputs({"shikimori.medias": "anime"}), malformedFavorites: true},
    transportError: {q: inputs({}), transportError: true},
    searchRetry: {q: inputs({"shikimori.sections": ""}), retryGet: true},
    listRetry: {q: inputs({"shikimori.sections": "lists", "shikimori.medias": "anime"}), retryPost: true},
    retryMissingHeader: {q: inputs({"shikimori.sections": ""}), retryGet: true, missingHeader: true},
    disabled: {q: {shikimori: false}},
    disabledServer: {q: inputs({}), enabled: false},
    disabledExtras: {q: inputs({}), extras: false},
  }
  for (const score of ["community", "user", "both", "off"])
    scenarios[`score-${score}`] = {q: inputs({"shikimori.sections": "lists", "shikimori.medias": "anime", "shikimori.score": score})}

  const reports = {}
  for (const [name, scenario] of Object.entries(scenarios)) {
    const calls = [], imageCalls = [], images = [], waits = []
    let shuffleCalls = 0
    let getAttempts = 0, postAttempts = 0
    const error = status => Object.assign(new Error(`HTTP ${status}`), {isAxiosError: true, response: {status, headers: scenario.missingHeader ? {} : {"retry-after": "2"}, data: {message: "Transport failure"}}})
    const imports = {
      metadata: conf.metadata,
      format,
      shuffle(list) {
        shuffleCalls++
        return [...list].reverse()
      },
      async wait(seconds) {
        waits.push(Number.isFinite(seconds) ? seconds : "non-finite")
      },
      async imgb64(image, options) {
        images.push(image)
        imageCalls.push({image, options})
        if (image?.includes("/assets/achievements/")) {
          if (image === scenario.iconReject)
            throw new Error("Achievement image fetch failed")
          if (image === scenario.iconNull)
            return null
          //A real one-pixel PNG is a deterministic image-retrieval double, not a production fallback.
          return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mOcOnfpfwAGfgLYttYINwAAAABJRU5ErkJggg=="
        }
        return image ? `encoded:${image}` : null
      },
      axios: {
        async get(url, options) {
          calls.push({method: "get", url, options})
          if (scenario.transportError)
            throw error(500)
          if (scenario.retryGet && !getAttempts++)
            throw error(429)
          if (url.includes("?search=")) {
            //The live search returns only the first `limit` fuzzy candidates, so the fixture slices them the same way.
            const requested = decodeURIComponent(url.match(/search=([^&]*)/)[1])
            const limit = Number(url.match(/[?&]limit=(\d+)/)?.[1] ?? 1)
            const candidates = scenario.missingUser
              ? []
              : scenario.nicknameMismatch
              ? [{id: 999, nickname: "a different account"}]
              : scenario.nicknameNotFirst
              ? [{id: 999, nickname: "a different account"}, {id: 123, nickname: requested}]
              : [{id: 123, nickname: requested}]
            return {data: candidates.slice(0, limit)}
          }
          if (/\/api\/users\/\d+$/.test(url)) {
            if (scenario.profileFailure)
              throw error(503)
            if (scenario.missingProfile)
              return {data: null}
            if (scenario.missingStats)
              return {data: {id: 123}}
            if (scenario.malformedStats)
              return {data: {id: 123, stats: {}}}
            const stats = structuredClone(profile.stats)
            if (scenario.emptyAggregates)
              Object.assign(stats, {scores: {anime: [], manga: []}, activity: [], genres: []})
            if (scenario.emptyGenres)
              stats.genres = []
            if (scenario.missingGenres)
              delete stats.genres
            return {data: {...profile, stats}}
          }
          if (/\/api\/achievements\?user_id=\d+$/.test(url)) {
            if (scenario.achievementsFailure)
              throw error(503)
            if (scenario.retryAchievements && !getAttempts++)
              throw error(429)
            if (scenario.emptyAchievements)
              return {data: []}
            if (scenario.missingAchievements)
              return {data: null}
            if (scenario.malformedAchievements)
              return {data: {}}
            return {data: achievements.map(achievement => ({...achievement, ...(scenario.comedyGif && achievement.neko_id === "comedy" ? {level: 4} : {}), ...(scenario.unknownLevel && achievement.neko_id === "drama" ? {level: 99} : {})}))}
          }
          if (!url.endsWith("/favourites"))
            throw new Error(`Unexpected fixture request: ${url}`)
          if (scenario.malformedFavorites)
            return {data: {}}
          return {data: scenario.empty ? Object.fromEntries(Object.keys(favorites).map(key => [key, []])) : {...favorites, ...(scenario.large ? {animes: Array.from({length: 75}, (_, index) => favorite(index + 1))} : {}), ...(scenario.huge ? {animes: Array.from({length: 250}, (_, index) => favorite(index + 1))} : {})}}
        },
        async post(url, body, options) {
          calls.push({method: "post", url, body, options})
          if (scenario.retryPost && !postAttempts++)
            throw error(429)
          if (scenario.graphqlError)
            return {data: {data: null, errors: [{message: "Upstream schema failure"}]}}
          const {query, variables} = body
          if (query.startsWith("query Summary ")) {
            if (scenario.summaryFailure)
              throw error(503)
            if (scenario.summaryRetry && !postAttempts++)
              throw error(429)
            if (scenario.summaryGraphqlError)
              return {data: {data: null, errors: [{message: "Summary schema failure"}]}}
            if (scenario.malformedSummary)
              return {data: {data: {userRates: null}}}
            if (scenario.malformedSummaryCount)
              return {data: {data: {userRates: [{episodes: "10", chapters: 0}]}}}
            const {targetType, page} = variables
            if (scenario.emptySummary || (scenario.summaryLastPageShort && targetType === "Manga"))
              return {data: {data: {userRates: []}}}
            if (scenario.summaryCap || (scenario.summaryMangaCap && targetType === "Manga") || (scenario.summaryLastPageShort && page < 100))
              return {data: {data: {userRates: Array.from({length: 50}, () => ({episodes: 2, chapters: 5}))}}}
            if (scenario.summaryLastPageShort && page === 100)
              return {data: {data: {userRates: [{episodes: 1, chapters: 999}]}}}
            if (page > 2)
              throw new Error("Summary queried beyond its short page")
            //Both scalars can be present; only the requested target's counter contributes to its total.
            const userRates = targetType === "Anime"
              ? page === 1 ? Array.from({length: 50}, () => ({episodes: 2, chapters: 1000})) : [{episodes: 3, chapters: 2000}, {episodes: 4, chapters: 2000}, {episodes: 0, chapters: 2000}]
              : page === 1
              ? Array.from({length: 50}, () => ({episodes: 100, chapters: 5}))
              : [{episodes: 200, chapters: 7}, {episodes: 300, chapters: 11}]
            return {data: {data: {userRates}}}
          }
          if (query.startsWith("query Lists ")) {
            const {targetType, page, status} = variables
            if (scenario.mixedRanobe) {
              //First Manga page carries a single light novel; the second carries two more, so a page-1-only bound under-fills ranobe.
              const rate = (id, kind) => ({id: `${1000 + id}`, score: 7, status, episodes: 0, chapters: 20, volumes: 2, anime: entity(id), manga: {...entity(id, "manga"), kind}})
              const userRates = page === 1
                ? [rate(1, "light_novel"), ...Array.from({length: 49}, (_, index) => rate(2 + index, "manga"))]
                : page === 2
                ? [rate(60, "light_novel"), rate(61, "light_novel"), rate(62, "manga")]
                : []
              return {data: {data: {userRates}}}
            }
            const ids = scenario.paginate || scenario.fullPages ? Array.from({length: scenario.fullPages || page === 1 ? 50 : 3}, (_, index) => 100 + (page - 1) * 50 + index) : targetType === "Anime" ? [1, 2, 3] : [7, 8, 9]
            const rates = ids.map(id => ({id: `${1000 + id}`, score: 7, status, episodes: targetType === "Anime" ? 6 : 0, chapters: targetType === "Manga" ? 20 : 0, volumes: targetType === "Manga" ? 2 : 0, anime: entity(id), manga: entity(id, "manga")}))
            return {data: {data: {userRates: rates}}}
          }
          if (!query.startsWith("query FavoritesMedias "))
            throw new Error("Unexpected fixture GraphQL query")
          const data = {}
          //Mirror the live catalog's 50-entry clamp and non-favorites ordering.
          for (const [, alias, root, variable] of query.matchAll(/(\w+): (animes|mangas)\(ids: \$(\w+), limit: 50\)/g)) {
            const ids = `${variables[variable]}`.split(",").map(Number)
            data[alias] = scenario.missingFavorite ? [] : ids.slice(0, 50).reverse().map(id => entity(id, root === "animes" ? "anime" : "manga"))
          }
          if (!Object.keys(data).length)
            throw new Error("Unexpected favorites batch query")
          return {data: {data}}
        },
      },
    }
    const data = {user: {login: "default-nickname"}}
    const parsed = conf.metadata.plugins.shikimori.inputs({q: scenario.q, data, account: "user"})
    try {
      const result = await Plugins.shikimori({login: "test", data, q: scenario.q, queries: conf.queries, imports, account: "user"}, {enabled: scenario.enabled ?? true, extras: scenario.extras ?? true})
      reports[name] = {result, calls, images, imageCalls, waits, shuffleCalls, parsed}
    }
    catch (error) {
      reports[name] = {error: {message: error.error?.message, cause: error.error?.instance?.message}, calls, images, imageCalls, waits, shuffleCalls, parsed}
    }
  }
  //Integration with the repository's auto-discovered axios mocks (no live API).
  const {default: mocks} = await import("../mocks/index.mjs")
  const utils = await import("../../source/app/metrics/utils.mjs")
  await mocks({
    graphql: () => {
      throw new Error("Unexpected GitHub fixture request")
    },
    rest: {},
  })
  //Any unmatched repository mock must fail before axios can make a live request.
  const {adapter} = utils.axios.defaults
  const liveRequests = []
  utils.axios.defaults.adapter = async config => {
    liveRequests.push(config.url)
    throw new Error(`Unexpected live axios request: ${config.url}`)
  }
  try {
    for (
      const [name, overrides] of Object.entries({
        repoMocks: {"shikimori.sections": "favorites, lists, characters, people, stats, achievements, genres", "shikimori.medias": "anime, manga, ranobe", "shikimori.statuses": "watching, completed", "shikimori.people": "seyu, mangakas", "shikimori.display.stats": "statuses, distribution, activity", "shikimori.display.achievements": "chips"},
        repoSummaryMocks: {"shikimori.sections": "stats, genres", "shikimori.medias": "ranobe", "shikimori.display.stats": "summary, statuses, distribution, activity"},
      })
    ) {
      const calls = []
      const q = inputs(overrides)
      try {
        const result = await Plugins.shikimori({
          login: "test",
          data: {user: {login: "default-nickname"}},
          q,
          account: "user",
          queries: conf.queries,
          imports: {
            ...utils,
            metadata: conf.metadata,
            format,
            axios: {
              get(url, options) {
                calls.push({method: "get", url, options})
                return utils.axios.get(url, options)
              },
              post(url, body, options) {
                calls.push({method: "post", url, body, options})
                return utils.axios.post(url, body, options)
              },
            },
          },
        }, {enabled: true, extras: true})
        reports[name] = {result, calls, liveRequests: [...liveRequests]}
      }
      catch (error) {
        reports[name] = {error: {message: error.error?.message, cause: error.error?.instance?.message}, calls, liveRequests: [...liveRequests]}
      }
    }
  }
  finally {
    utils.axios.defaults.adapter = adapter
  }
  return reports
}

run().then(reports => process.stdout.write(JSON.stringify(reports))).catch(error => {
  console.error(error)
  process.exitCode = 1
})
