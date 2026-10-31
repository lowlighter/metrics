//Imports
const {spawnSync} = require("child_process")
const path = require("path")
const fs = require("fs")
const ejs = require("ejs")
const {JSDOM} = require("jsdom")

let scenarios
beforeAll(() => {
  const probe = spawnSync("node", ["tests/helpers/shikimori.mjs"], {cwd: path.join(__dirname, ".."), encoding: "utf8", timeout: 60000, maxBuffer: 16 * 1024 * 1024})
  if (probe.error || probe.status !== 0)
    throw new Error(`${probe.error ?? ""}\n${probe.stderr}\n${probe.stdout}`)
  scenarios = JSON.parse(probe.stdout)
})

describe("Shikimori data layer", () => {
  test("the auto-discovered repository mocks produce media modules and v1 statistics", () => {
    const {result, error, calls} = scenarios.repoMocks
    expect(error).toBeUndefined()
    expect(Object.fromEntries(Object.entries(result.favorites).map(([media, cards]) => [media, cards.length]))).toEqual({anime: 2, manga: 2, ranobe: 2})
    expect(result.characters).toHaveLength(22)
    expect(Object.keys(result.people)).toEqual(["seyu", "mangakas"])
    for (const media of ["anime", "manga", "ranobe"]) {
      for (const status of ["watching", "completed"])
        expect(result.lists[media][status]).toHaveLength(2)
    }
    expect(calls.filter(({body}) => body?.query?.startsWith("query Lists ")).map(({body}) => body.variables.page)).toEqual([1, 1, 1, 1])
    expect(result.stats.statuses?.map(({name}) => name)).toEqual(["planned", "watching", "rewatching", "completed", "on_hold", "dropped"])
    expect(result.stats.summary).toBeNull()
    expect(result.stats.scores.anime).toBeInstanceOf(Array)
    expect(result.stats.activity).toHaveLength(10)
    expect(result.genres).toHaveLength(8)
    expect(result.achievements.every(({level}) => level >= 1)).toBe(true)
    expect(result.achievements.length).toBeLessThanOrEqual(22)
    expect(calls.filter(({url}) => url.includes("/api/achievements?user_id="))).toHaveLength(1)
  })
  test("the summary-enabled repository case sums both paginated targets without live axios", () => {
    const {result, error, calls, liveRequests} = scenarios.repoSummaryMocks
    expect(error).toBeUndefined()
    expect(result?.stats.summary).toEqual({episodes: 106, chapters: 265})
    expect(result?.stats.statuses).toHaveLength(6)
    expect(result?.stats.activity).toHaveLength(10)
    expect(result?.genres).toHaveLength(8)
    const summary = calls.filter(({body}) => body?.query?.startsWith("query Summary "))
    expect(summary.map(({body}) => [body.variables.targetType, body.variables.page])).toEqual([["Anime", 1], ["Anime", 2], ["Manga", 1], ["Manga", 2]])
    expect(summary.every(({body}) => body.variables.limit === 50 && !("status" in body.variables))).toBe(true)
    expect(liveRequests).toEqual([])
  })
  test("defaults resolve the GitHub login and leave disabled module slots empty", () => {
    const {result, parsed} = scenarios.defaults
    expect(result?.user).toEqual({id: 123, nickname: "default-nickname"})
    expect(result?.sections).toEqual(["favorites"])
    expect(Object.keys(result?.favorites ?? {})).toEqual(["anime", "manga"])
    expect(result?.stats).toEqual({})
    expect(result?.achievements).toEqual([])
    expect(result?.genres).toEqual([])
    expect(parsed).toMatchObject({medias: ["anime", "manga"], statuses: ["watching"], people: ["people", "seyu"], "achievements.filter": "earned", sort: "site", "title.language": "english", score: "community", limit: 2, "limit.characters": 22, "limit.people": 22, "limit.achievements": 22, shuffle: true})
    expect(parsed["display.characters"]).toEqual(["name", "artwork"])
    expect(parsed["display.people"]).toEqual(["name", "artwork"])
  })
  test("profile statistics sum full_statuses size by name and preserve all six statuses", () => {
    expect(scenarios.statsGeneric.result?.stats.statuses).toEqual([
      {name: "planned", value: 17},
      {name: "watching", value: 10},
      {name: "rewatching", value: 12},
      {name: "completed", value: 31},
      {name: "on_hold", value: 16},
      {name: "dropped", value: 18},
    ])
  })
  test("score histograms pass through and activity retains native variable bounds without cutting", () => {
    expect(scenarios.statsGeneric.result?.stats.scores).toEqual({anime: [{name: "10", value: 4}, {name: "7", value: 2}, {name: "0", value: 5}], manga: []})
    expect(scenarios.statsGeneric.result?.stats.activity).toEqual([{from: 1763672400, to: 1764815537, value: 8}, {from: 1764815537, to: 1765958674, value: 0}, {from: 1765958674, to: 1765958847, value: 3}])
    expect(scenarios.statsEmptyAggregates.result?.stats.scores).toEqual({anime: [], manga: []})
    expect(scenarios.statsEmptyAggregates.result?.stats.activity).toEqual([])
  })
  test("stats and genres share one profile request without fetching favorites", () => {
    const {calls, result, images, error} = scenarios.statsAndGenres
    expect(error).toBeUndefined()
    expect(calls.filter(({url}) => /\/api\/users\/\d+$/.test(url))).toHaveLength(1)
    expect(calls.filter(({url}) => url.endsWith("/favourites"))).toEqual([])
    expect(images).toEqual([])
    expect(result?.stats.statuses).toHaveLength(6)
    expect(result?.genres).toHaveLength(8)
  })
  test("disabling the summary produces null and makes no GraphQL sweep", () => {
    expect(scenarios.statsNoSummary.result?.stats.summary).toBeNull()
    expect(scenarios.statsNoSummary.calls.filter(({method}) => method === "post")).toEqual([])
  })
  test("top genres are eight name strings sorted by descending profile value", () => {
    expect(scenarios.genres.result?.genres).toEqual(["Action", "Adventure", "Fantasy", "Romance", "Drama", "Comedy", "Sci-Fi", "Slice of Life"])
    expect(scenarios.genres.result?.stats).toEqual({})
    expect(scenarios.genres.calls.filter(({method}) => method === "post")).toEqual([])
  })
  test.each(["genresEmpty", "genresMissing"])("%s returns no invented genres", name => {
    expect(scenarios[name].error).toBeUndefined()
    expect(scenarios[name].result?.genres).toEqual([])
    expect(scenarios[name].calls.filter(({url}) => /\/api\/users\/\d+$/.test(url))).toHaveLength(1)
  })
  test("disabled stats and genres never fetch a profile", () => {
    expect(scenarios.defaults.calls.filter(({url}) => /\/api\/users\/\d+$/.test(url))).toEqual([])
  })
  test.each(["missingProfile", "missingStats", "malformedStats"])("%s throws a formatted statistics error instead of empty success", name => {
    expect(scenarios[name].result).toBeUndefined()
    expect(scenarios[name].error?.message).toMatch(/Invalid Shikimori.*statistic/i)
    expect(scenarios[name].error?.cause).toMatch(/Invalid Shikimori.*statistic/i)
  })
  test("profile transport failures stay loud and non-429 responses are not retried", () => {
    expect(scenarios.profileFailure.result).toBeUndefined()
    expect(scenarios.profileFailure.error?.message).toMatch(/API error: 503/)
    expect(scenarios.profileFailure.calls.filter(({url}) => /\/api\/users\/\d+$/.test(url))).toHaveLength(1)
    expect(scenarios.profileFailure.waits).toEqual([])
  })
  test("summary sweeps both target types to their short pages independently of card limits", () => {
    const {result, calls, error} = scenarios.statsSummary
    expect(error).toBeUndefined()
    expect(result?.stats.summary).toEqual({episodes: 107, chapters: 268})
    const summary = calls.filter(({body}) => body?.query?.startsWith("query Summary "))
    expect(summary.map(({body}) => [body.variables.targetType, body.variables.page])).toEqual([["Anime", 1], ["Anime", 2], ["Manga", 1], ["Manga", 2]])
    expect(calls.filter(({body}) => body?.query?.startsWith("query Lists ")).map(({body}) => body.variables.page)).toEqual([1])
    expect(result?.lists.anime.watching).toHaveLength(2)
  })
  test("summary emits typed variables without a status filter and selects only scalar counters", () => {
    const posts = scenarios.statsSummary.calls.filter(({body}) => body?.query?.startsWith("query Summary "))
    expect(posts).toHaveLength(4)
    for (const {body} of posts) {
      expect(body.variables).toEqual({page: body.variables.page, limit: 50, userId: 123, targetType: body.variables.targetType, order: {field: "id", order: "asc"}})
      expect(body.query).not.toMatch(/\b(?:status|anime|manga|kind)\b/)
      expect(body.query).toMatch(/\{\s*userRates\([^)]*\)\s*\{\s*episodes\s+chapters\s*\}\s*\}\s*$/)
    }
  })
  test("summary includes all Manga-kind rates and still fetches Anime when only ranobe cards are configured", () => {
    expect(scenarios.statsSummaryRanobe.result?.stats.summary).toEqual({episodes: 107, chapters: 268})
    expect(scenarios.statsSummaryRanobe.calls.filter(({body}) => body?.query?.startsWith("query Summary "))).toHaveLength(4)
  })
  test("empty summary sweeps return true zero totals after one page per target", () => {
    expect(scenarios.statsSummaryEmpty.error).toBeUndefined()
    expect(scenarios.statsSummaryEmpty.result?.stats.summary).toEqual({episodes: 0, chapters: 0})
    expect(scenarios.statsSummaryEmpty.calls.filter(({method}) => method === "post").map(({body}) => body.variables.targetType)).toEqual(["Anime", "Manga"])
  })
  test.each([["summaryCap", "Anime", 100], ["summaryMangaCap", "Manga", 102]])("%s fails loudly at 100 full pages without exposing a partial sum", (name, target, count) => {
    const {result, error, calls} = scenarios[name]
    expect(result).toBeUndefined()
    expect(error?.message).toContain(`Shikimori summary exceeded 100 pages for ${target}`)
    expect(error?.cause).toContain(`Shikimori summary exceeded 100 pages for ${target}`)
    const posts = calls.filter(({body}) => body?.query?.startsWith("query Summary "))
    expect(posts).toHaveLength(count)
    const pages = posts.filter(({body}) => body.variables.targetType === target).map(({body}) => body.variables.page)
    expect(pages).toHaveLength(100)
    expect(pages[0]).toBe(1)
    expect(pages[99]).toBe(100)
  })
  test("a short hundredth summary page terminates successfully rather than tripping the cap", () => {
    expect(scenarios.summaryLastPageShort.error).toBeUndefined()
    expect(scenarios.summaryLastPageShort.result?.stats.summary).toEqual({episodes: 9901, chapters: 0})
    expect(scenarios.summaryLastPageShort.calls.filter(({method}) => method === "post")).toHaveLength(101)
  })
  test("summary elision permits list requests but never issues a Summary POST", () => {
    const {result, calls} = scenarios.statsNoSummaryWithLists
    expect(result?.stats.summary).toBeNull()
    expect(calls.filter(({body}) => body?.query?.startsWith("query Summary "))).toEqual([])
    expect(calls.filter(({body}) => body?.query?.startsWith("query Lists "))).toHaveLength(1)
  })
  test.each([["summaryMalformed", /Invalid Shikimori Anime summary response/], ["summaryMalformedCount", /Invalid Shikimori Anime summary count/], ["summaryGraphqlError", /Summary schema failure/], ["summaryFailure", /API error: 503/]])("%s surfaces a formatted error instead of zero totals", (name, message) => {
    expect(scenarios[name].result).toBeUndefined()
    expect(scenarios[name].error?.message).toMatch(message)
  })
  test("summary retries only its 429 page and keeps the same typed variables", () => {
    const {result, error, calls, waits} = scenarios.summaryRetry
    expect(error).toBeUndefined()
    expect(result?.stats.summary).toEqual({episodes: 107, chapters: 268})
    expect(waits).toEqual([7])
    const posts = calls.filter(({body}) => body?.query?.startsWith("query Summary "))
    expect(posts).toHaveLength(5)
    expect(posts[1].body).toEqual(posts[0].body)
  })
  test("earned achievements exclude level zero and sort by descending level then progress", () => {
    const {result, error, calls} = scenarios.achievementsEarned
    expect(error).toBeUndefined()
    expect(result?.achievements.map(({neko_id}) => neko_id)).toEqual(["fantasy", "drama", "comedy", "code_geass", "unknown_achievement"])
    expect(result?.achievements.map(({level, progress}) => [level, progress])).toEqual([[3, 60], [2, 90], [2, 40], [1, 100], [1, 80]])
    expect(calls.filter(({url}) => url.includes("/api/achievements?user_id="))).toHaveLength(1)
    expect(result?.stats).toEqual({})
    expect(calls.filter(({url}) => /\/api\/users\/\d+$/.test(url))).toEqual([])
  })
  test("all achievements retain level zero and a zero limit keeps the full sorted list", () => {
    expect(scenarios.achievementsAll.result?.achievements.map(({neko_id}) => neko_id)).toEqual(["fantasy", "drama", "comedy", "code_geass", "unknown_achievement", "tetsurou_araki", "mecha"])
    expect(scenarios.achievementsAll.result?.achievements.slice(-2).map(({progress}) => progress)).toEqual([55, 30])
  })
  test("achievement limits cut after filtering and sorting but before icon downloads", () => {
    expect(scenarios.achievementsLimited.result?.achievements.map(({neko_id}) => neko_id)).toEqual(["fantasy", "drama", "comedy"])
    expect(scenarios.achievementsLimited.images).toEqual(["https://shikimori.io/assets/achievements/anime/fantasy_3.jpg", "https://shikimori.io/assets/achievements/anime/drama_2.jpg", "https://shikimori.io/assets/achievements/anime/comedy_2.jpg"])
    expect(scenarios.achievementsAllLimited.result?.achievements).toHaveLength(6)
    expect(scenarios.achievementsAllLimited.result?.achievements[5]).toMatchObject({neko_id: "tetsurou_araki", level: 0})
  })
  test("chips-only achievements keep labels with null icons and make zero image requests", () => {
    const {result, images, calls} = scenarios.achievementsChips
    expect(result?.achievements).toHaveLength(7)
    expect(result?.achievements.every(({icon}) => icon === null)).toBe(true)
    expect(result?.achievements[0].name).toBe("The Hero")
    expect(images).toEqual([])
    expect(calls.filter(({method}) => method === "post")).toEqual([])
  })
  test("icons use exact per-level JPG, GIF, PNG and shared author paths with null unknown-id fallback", () => {
    const {result, error, images, imageCalls} = scenarios.achievementsIcons
    expect(error).toBeUndefined()
    expect(result?.achievements).toHaveLength(7)
    expect(images).toEqual([
      "https://shikimori.io/assets/achievements/anime/comedy_4.gif",
      "https://shikimori.io/assets/achievements/anime/fantasy_3.jpg",
      "https://shikimori.io/assets/achievements/anime/drama_2.jpg",
      "https://shikimori.io/assets/achievements/anime/franchise/code_geass.png",
      "https://shikimori.io/assets/achievements/anime/author/tetsurou_araki.jpg",
    ])
    expect(imageCalls.every(({options}) => options?.fallback === false)).toBe(true)
    for (const achievement of result.achievements.filter(({neko_id}) => !["unknown_achievement", "mecha"].includes(neko_id)))
      expect(achievement.icon).toMatch(/^data:image\/png;base64,/)
    expect(result.achievements.find(({neko_id}) => neko_id === "unknown_achievement")).toEqual({neko_id: "unknown_achievement", level: 1, progress: 80, name: "unknown_achievement", icon: null})
    expect(result.achievements.find(({neko_id}) => neko_id === "mecha").icon).toBeNull()
  })
  test("a known achievement with an unmapped level falls back to its identifier and null chip icon", () => {
    const {result, images} = scenarios.achievementsUnknownLevel
    expect(result?.achievements[0]).toEqual({neko_id: "drama", level: 99, progress: 90, name: "drama", icon: null})
    expect(images.some(image => image?.includes("drama"))).toBe(false)
  })
  test.each(["achievementsIconNull", "achievementsIconReject"])("%s preserves achievement chips when the resolved image fails", name => {
    expect(scenarios[name].error).toBeUndefined()
    expect(scenarios[name].result?.achievements).toHaveLength(5)
    expect(scenarios[name].result?.achievements.find(({neko_id}) => neko_id === "drama")).toMatchObject({level: 2, progress: 90, name: "Mid-level empathy", icon: null})
    expect(scenarios[name].images).toContain("https://shikimori.io/assets/achievements/anime/drama_2.jpg")
  })
  test.each([["achievementsEarned", ["The Hero", "Mid-level empathy", "Comedian"]], ["achievementsRussian", ["Герой", "Эмпатия среднего уровня", "Комедиант"]], ["achievementsJapanese", ["The Hero", "Mid-level empathy", "Comedian"]]])("%s uses upstream English or Russian achievement titles with identifier fallback", (name, titles) => {
    expect(scenarios[name].result?.achievements.slice(0, 3).map(({name}) => name)).toEqual(titles)
    expect(scenarios[name].result?.achievements.find(({neko_id}) => neko_id === "unknown_achievement").name).toBe("unknown_achievement")
  })
  test("an empty achievement response is honest data after one fetch", () => {
    expect(scenarios.achievementsEmpty.error).toBeUndefined()
    expect(scenarios.achievementsEmpty.result?.achievements).toEqual([])
    expect(scenarios.achievementsEmpty.calls.filter(({url}) => url.includes("/api/achievements?user_id="))).toHaveLength(1)
    expect(scenarios.achievementsEmpty.images).toEqual([])
  })
  test.each(["achievementsMissing", "achievementsMalformed"])("%s throws a formatted error rather than empty achievements", name => {
    expect(scenarios[name].result).toBeUndefined()
    expect(scenarios[name].error?.message).toMatch(/Invalid Shikimori achievements response/)
    expect(scenarios[name].error?.cause).toMatch(/Invalid Shikimori achievements response/)
  })
  test("achievement API errors stay loud and only 429 retries the same request", () => {
    expect(scenarios.achievementsFailure.result).toBeUndefined()
    expect(scenarios.achievementsFailure.error?.message).toMatch(/API error: 503/)
    expect(scenarios.achievementsFailure.calls.filter(({url}) => url.includes("/api/achievements?user_id="))).toHaveLength(1)
    expect(scenarios.achievementsFailure.waits).toEqual([])
    expect(scenarios.achievementsRetry.error).toBeUndefined()
    expect(scenarios.achievementsRetry.result?.achievements).toHaveLength(5)
    expect(scenarios.achievementsRetry.waits).toEqual([7])
    expect(scenarios.achievementsRetry.calls.filter(({url}) => url.includes("/api/achievements?user_id="))).toHaveLength(2)
  })
  test("empty achievement display fields elide only images and disabled sections elide the API", () => {
    expect(scenarios.achievementsNoDisplay.result?.achievements).toHaveLength(5)
    expect(scenarios.achievementsNoDisplay.result?.achievements.every(({icon}) => icon === null)).toBe(true)
    expect(scenarios.achievementsNoDisplay.images).toEqual([])
    expect(scenarios.defaults.calls.filter(({url}) => url.includes("/api/achievements?user_id="))).toEqual([])
  })
  test("favorites restore REST order and use the relative image when no poster exists", () => {
    const {result} = scenarios.favoriteOrder
    expect(result?.favorites.anime.map(card => card.name)).toEqual(["Name 3", "English 1", "English 2"])
    expect(result?.favorites.anime[0]).toEqual({name: "Name 3", type: "ANIME", status: "released", release: 2020, genres: ["Drama", "Adventure"], studio: "Studio", progress: null, volumes: null, description: "First second", scores: {user: null, community: 5}, released: 12, artwork: "encoded:https://shikimori.io/system/animes/x64/3.jpg"})
    expect(result?.favorites.anime[1].artwork).toBe("encoded:https://shikimori.io/uploads/poster/anime/1.jpg")
  })
  test.each(["favoritesNoCover", "listsNoCover"])("%s leaves card artwork null without image downloads", name => {
    const {result, error, images} = scenarios[name]
    expect(error).toBeUndefined()
    const cards = name === "favoritesNoCover" ? result.favorites.anime : Object.values(result.lists.anime).flat()
    expect(cards.length).toBeGreaterThan(0)
    expect(cards.every(({artwork}) => artwork === null)).toBe(true)
    expect(images).toEqual([])
  })
  test("favorites and list cover switches are independent", () => {
    const {result, images} = scenarios.independentCovers
    expect(result?.favorites.anime.every(({artwork}) => artwork === null)).toBe(true)
    expect(result?.lists.anime.watching.every(({artwork}) => artwork?.startsWith("encoded:"))).toBe(true)
    expect(images).toEqual(["https://shikimori.io/uploads/poster/anime/1.jpg", "https://shikimori.io/uploads/poster/anime/2.jpg"])
  })
  test("more than 50 favorites resolve in one GraphQL request without losing IDs", () => {
    const {result, calls} = scenarios.favoriteLarge
    expect(result?.favorites.anime).toHaveLength(75)
    expect(result?.favorites.anime[0].name).toBe("English 1")
    expect(result?.favorites.anime[74].name).toBe("English 75")
    expect(calls.filter(({method}) => method === "post")).toHaveLength(1)
  })
  test("media limits apply before downloading artwork", () => {
    expect(scenarios.favoriteScore.images).toHaveLength(2)
    expect(scenarios.updated.images).toHaveLength(2)
  })
  test.each([
    ["favoriteScore", ["English 2", "Name 3"]],
    ["favoriteRelease", ["English 1", "Name 3"]],
    ["favoriteUpdated", ["Name 3", "English 1"]],
    ["favoriteShuffle", ["English 2", "English 1"]],
  ])("%s sorts or shuffles before the limit", (name, expected) => {
    expect(scenarios[name].result?.favorites.anime.map(card => card.name)).toEqual(expected)
    expect(scenarios[name].shuffleCalls).toBe(name === "favoriteShuffle" ? 1 : 0)
  })
  test("heavy favorites resolve in batches of at most 100 ids while keeping site order", () => {
    const {result, calls} = scenarios.favoriteHuge
    expect(result?.favorites.anime).toHaveLength(250)
    expect(result?.favorites.anime[0].name).toBe("English 1")
    expect(result?.favorites.anime[249].name).toBe("English 250")
    //250 ids are resolved in three POSTs (100 + 100 + 50), never one oversized alias query.
    const posts = calls.filter(({method}) => method === "post")
    expect(posts).toHaveLength(3)
    expect(posts.flatMap(({body}) => Object.values(body.variables).flatMap(value => `${value}`.split(",")))).toHaveLength(250)
  })
  test("score sorting reads the raw values and ignores the display mask", () => {
    //Favorites have no user score: with score=user the display mask nulls community, so a masked sort would fall back to -1 and keep site order.
    expect(scenarios.favoriteScoreUser.result?.favorites.anime.map(card => card.name)).toEqual(["English 2", "Name 3"])
    expect(scenarios.favoriteScoreUser.result?.favorites.anime[0].scores).toEqual({user: null, community: null})
    //score=off nulls both display scores, but sort=score must still order by the raw community score.
    expect(scenarios.listScoreOff.result?.lists.anime.watching.map(card => card.name)).toEqual(["English 2", "Name 3"])
    expect(scenarios.listScoreOff.result?.lists.anime.watching[0].scores).toEqual({user: null, community: null})
  })
  test("manga and ranobe favorites have no user progress or user score", () => {
    const {result} = scenarios.favoriteManga
    expect(result?.favorites.manga.map(card => card.name)).toEqual(["English 7", "English 8"])
    expect(result?.favorites.ranobe[0]).toMatchObject({name: "English 9", type: "MANGA", progress: null, volumes: null, studio: null, released: 40, scores: {user: null, community: 8.25}})
  })
  test.each([["russian", "Russian 3"], ["japanese", "Japanese 3"]])("%s selects the requested localized title", (name, title) => {
    expect(scenarios[name].result?.favorites.anime[0].name).toBe(title)
  })
  test("lists select the requested entity even when both nested entities exist", () => {
    const {result} = scenarios.lists
    expect(result?.lists.manga.watching.map(card => card.name)).toEqual(["English 7", "English 8"])
    expect(result?.lists.ranobe.watching.map(card => card.name)).toEqual(["English 9"])
    expect(result?.lists.manga.completed[0]).toMatchObject({type: "MANGA", progress: 20, volumes: 2, released: 40, studio: null})
    expect(result?.lists.anime.watching[0]).toMatchObject({progress: 6, volumes: null, released: 12, studio: "Studio", scores: {user: 7, community: 2}})
  })
  test("light novels are excluded from manga lists and appear only in ranobe", () => {
    const {result, calls} = scenarios.lists
    for (const status of ["watching", "completed"]) {
      const manga = result.lists.manga[status].map(card => card.name)
      const ranobe = result.lists.ranobe[status].map(card => card.name)
      //English 9 is the light novel; it must not be reachable through the manga media type.
      expect(manga).not.toContain("English 9")
      expect(ranobe).toEqual(["English 9"])
      expect(manga.filter(name => ranobe.includes(name))).toEqual([])
    }
    //Manga rates are fetched once per status and split into manga/ranobe client-side (no duplicate Manga requests).
    const lists = calls.filter(({body}) => body?.query?.startsWith("query Lists "))
    expect(lists.filter(({body}) => body.variables.targetType === "Manga")).toHaveLength(2)
  })
  test("site-ordered lists fetch only enough pages for the display, while score sorting paginates fully", () => {
    const pages = scenario => scenario.calls.filter(({method}) => method === "post").map(({body}) => body.variables.page)
    //sort=site with a small limit: a single page already satisfies the display.
    expect(pages(scenarios.siteMinimal)).toEqual([1])
    expect(scenarios.siteMinimal.result?.lists.anime.watching).toHaveLength(2)
    //sort=score needs the whole collection before sorting and cutting.
    expect(pages(scenarios.listScore)).toEqual([1, 2])
    expect(scenarios.listScore.result?.lists.anime.watching).toHaveLength(2)
  })
  test("the default sort+shuffle combination shuffles the whole collection while shuffle off stays bounded", () => {
    const pages = scenario => scenario.calls.filter(({method}) => method === "post").map(({body}) => body.variables.page)
    //Default sort=site + shuffle=yes: the shuffle pool must span more than the first page (AniList parity: shuffle then cut).
    expect(pages(scenarios.siteShufflePages)).toEqual([1, 2])
    expect(scenarios.siteShufflePages.result?.lists.anime.watching).toHaveLength(2)
    expect(scenarios.siteShufflePages.shuffleCalls).toBe(1)
    //shuffle off with a definite limit keeps the bounded single-page fetch.
    expect(pages(scenarios.siteMinimal)).toEqual([1])
  })
  test("manga and ranobe lists both fill from the shared Manga pool", () => {
    const {result, calls} = scenarios.mixedRanobe
    expect(result?.lists.manga.watching).toHaveLength(2)
    expect(result?.lists.ranobe.watching).toHaveLength(2)
    //Paged past the first page to satisfy the ranobe partition, not just the shared pool length.
    expect(calls.filter(({method}) => method === "post").map(({body}) => body.variables.page)).toEqual([1, 2])
  })
  test("list requests select only the requested nested entity to fit the live complexity limit", () => {
    for (const {body} of scenarios.lists.calls.filter(({method}) => method === "post")) {
      const anime = body.variables.targetType === "Anime"
      expect(body.query).toMatch(anime ? /anime\s*\{/ : /manga\s*\{/)
      expect(body.query).not.toMatch(anime ? /manga\s*\{/ : /anime\s*\{/)
    }
  })
  test("userRates continue at page 2 after a full 50-entry page", () => {
    const {result, calls} = scenarios.pagination
    expect(result?.lists.anime.watching).toHaveLength(53)
    expect(calls.filter(({method}) => method === "post").map(({body}) => body.variables?.page)).toEqual([1, 2])
  })
  test("userRates stop at the ten-page cap", () => {
    const {result, calls} = scenarios.cap
    expect(result?.lists.anime.watching).toHaveLength(500)
    expect(calls.filter(({method}) => method === "post")).toHaveLength(10)
  })
  test("updated lists send the API input-object order and are not shuffled", () => {
    const {calls, shuffleCalls, result} = scenarios.updated
    expect(result?.lists.anime.watching).toHaveLength(2)
    expect(calls.find(({method}) => method === "post").body.variables?.order).toEqual({field: "updated_at", order: "desc"})
    expect(shuffleCalls).toBe(0)
  })
  test.each([["community", {user: null, community: 2}], ["user", {user: 7, community: null}], ["both", {user: 7, community: 2}], ["off", {user: null, community: null}]])("%s filters the scores", (mode, scores) => {
    expect(scenarios[`score-${mode}`].result?.lists.anime.watching[0].scores).toEqual(scores)
  })
  test("strips preserve configuration order and cut each strip independently", () => {
    const {result, calls, images} = scenarios.strips
    expect(result?.characters.map(({name}) => name)).toEqual(["Character A"])
    expect(Object.keys(result?.people ?? {})).toEqual(["seyu", "mangakas"])
    expect(result?.people.seyu.map(({name}) => name)).toEqual(["Voice A"])
    expect(result?.people.mangakas.map(({name}) => name)).toEqual(["Author A"])
    expect(calls.filter(({url}) => url.endsWith("/favourites"))).toHaveLength(1)
    expect(images).toHaveLength(3)
    expect(images.every(image => image === "https://shikimori.io/system/people/x64/1.jpg")).toBe(true)
  })
  test("name-only strip fields retain entries with null artwork and skip image downloads", () => {
    const {result, parsed, images} = scenarios.stripFields
    expect(parsed["display.characters"]).toEqual(["name"])
    expect(parsed["display.people"]).toEqual(["name"])
    expect(result?.characters).toHaveLength(2)
    expect(result?.people.seyu).toHaveLength(2)
    expect([...result.characters, ...result.people.seyu].every(({name, artwork}) => name && artwork === null)).toBe(true)
    expect(images).toEqual([])
  })
  test.each([["stripCharactersNoArtwork", "characters"], ["stripPeopleNoArtwork", "people"]])("%s elides only the corresponding strip artwork", (name, hidden) => {
    const {result, error, images} = scenarios[name]
    expect(error).toBeUndefined()
    const {characters, people: {seyu: people}} = result
    expect(characters).toHaveLength(2)
    expect(people).toHaveLength(2)
    expect((hidden === "characters" ? characters : people).every(({artwork}) => artwork === null)).toBe(true)
    expect((hidden === "characters" ? people : characters).every(({artwork}) => artwork?.startsWith("encoded:"))).toBe(true)
    expect(images).toHaveLength(2)
  })
  test("empty strip display inputs keep ordered entries but never fetch artwork", () => {
    const {result, error, images} = scenarios.stripNoDisplay
    expect(error).toBeUndefined()
    expect(result.characters.map(({name, artwork}) => [name, artwork])).toEqual([["Character A", null], ["Character B", null]])
    expect(result.people.seyu.map(({name, artwork}) => [name, artwork])).toEqual([["Voice A", null], ["Voice B", null]])
    expect(images).toEqual([])
  })
  test("strips shuffle before being cut", () => {
    expect(scenarios.stripsShuffle.result?.characters[0].name).toBe("Character B")
    expect(scenarios.stripsShuffle.result?.people.seyu[0].name).toBe("Voice B")
  })
  test("the non-site sort disables shuffling", () => {
    expect(scenarios.stripsNoShuffle.shuffleCalls).toBe(0)
  })
  test("empty favorites make no catalog requests", () => {
    expect(scenarios.empty.result?.favorites).toEqual({anime: [], manga: []})
    expect(scenarios.empty.calls.filter(({method}) => method === "post")).toEqual([])
  })
  test("display allowlists drop unknown fields and keep the empty allowlist", () => {
    expect(scenarios.unknown.parsed["display.favorites"]).toEqual(["title", "cover"])
    expect(scenarios.unknown.parsed["display.lists"]).toEqual([])
    expect(scenarios.unknown.parsed["display.characters"]).toEqual(["name"])
    expect(scenarios.unknown.parsed["display.people"]).toEqual([])
    expect(scenarios.unknown.result?.sections).toEqual(["favorites"])
  })
  test.each([["missingUser", /missing nickname/], ["missingFavorite", /Shikimori.*3/], ["graphqlError", /Upstream schema failure/], ["malformedFavorites", /Shikimori/]])("%s produces a meaningful formatted error, not empty success", (name, error) => {
    expect(scenarios[name].error?.message).toMatch(error)
    expect(scenarios[name].result).toBeUndefined()
  })
  test("a fuzzy search result for another nickname is rejected instead of being rendered", () => {
    const {error, result, calls} = scenarios.nicknameMismatch
    expect(result).toBeUndefined()
    expect(error?.message).toMatch(/missing nickname/)
    //The nickname mismatch is caught before any other endpoint is queried.
    expect(calls.filter(({url}) => url.endsWith("/favourites"))).toEqual([])
    expect(calls.filter(({method}) => method === "post")).toEqual([])
  })
  test("an exact nickname that the fuzzy search does not rank first still resolves", () => {
    const {result, error, calls} = scenarios.nicknameNotFirst
    expect(error).toBeUndefined()
    //Only the exact (case-insensitive) match is accepted, never the higher-ranked other account.
    expect(result?.user).toEqual({id: 123, nickname: "whynothacked"})
    //The search inspects a small candidate window rather than a single top hit.
    expect(calls.find(({method}) => method === "get").url).toMatch(/\?search=.*&limit=10$/)
  })
  test("a non-429 transport failure is not retried", () => {
    expect(scenarios.transportError.error?.message).toMatch(/API error: 500/)
    expect(scenarios.transportError.calls).toHaveLength(1)
    expect(scenarios.transportError.waits).toEqual([])
  })
  test.each([["searchRetry", 7], ["listRetry", 7], ["retryMissingHeader", 5]])("%s retries only the limited request after retry-after plus five seconds", (name, delay) => {
    expect(scenarios[name].error).toBeUndefined()
    expect(scenarios[name].waits).toEqual([delay])
    if (name === "listRetry")
      expect(scenarios[name].result?.lists.anime.watching).toHaveLength(2)
  })
  test("every GET and POST uses the canonical origin and anonymous User-Agent", () => {
    for (const scenario of Object.values(scenarios)) {
      for (const call of scenario.calls) {
        expect(call.url).toMatch(/^https:\/\/shikimori\.io\/api\//)
        expect(call.options.headers).toEqual({"User-Agent": "metrics"})
        expect(call.options.timeout).toBe(30000)
        if (call.method === "post")
          expect(call.body.variables).toBeDefined()
      }
    }
  })
  test.each(["disabled", "disabledServer", "disabledExtras"])("%s never calls the API", name => {
    expect(scenarios[name].calls).toEqual([])
    if (name === "disabled")
      expect(scenarios[name].result).toBeNull()
    else
      expect(scenarios[name].error?.message).toMatch(/disabled/)
  })
})

describe("Shikimori classic partial", () => {
  let partial
  const image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mOcOnfpfwAGfgLYttYINwAAAABJRU5ErkJggg=="
  const card = {
    name: "Anime title",
    type: "ANIME",
    status: "ongoing",
    release: 2024,
    genres: ["Adventure", "Fantasy"],
    studio: "Example studio",
    progress: 6,
    volumes: null,
    description: "A plain description",
    scores: {user: 7.5, community: 8.24},
    released: 12,
    artwork: image,
  }
  const manga = {...card, name: "Manga title", type: "MANGA", progress: 3, volumes: 2, released: 15, studio: null}
  const defaults = {
    sections: ["achievements", "people", "characters", "favorites", "lists", "stats", "genres"],
    lists: {anime: {watching: [card]}, manga: {completed: [manga]}, ranobe: {planned: [{...manga, name: "Ranobe title"}]}},
    favorites: {anime: [{...card, name: "Favorite anime", progress: null, scores: {user: null, community: 8.24}}], manga: [{...manga, name: "Favorite manga", progress: null, volumes: null}], ranobe: [{...manga, name: "Favorite ranobe", progress: null, volumes: null}]},
    genres: ["Fantasy", "Adventure"],
    characters: [{name: "Character A", artwork: image}, {name: "Character B", artwork: null}],
    people: {producers: [{name: "Producer A", artwork: image}], mangakas: [{name: "Author A", artwork: null}], seyu: [{name: "Voice A", artwork: image}]},
    stats: {
      summary: {episodes: 106, chapters: 265},
      statuses: [{name: "watching", value: 12}, {name: "on_hold", value: 3}, {name: "rewatching", value: 1}],
      scores: {anime: [{name: "10", value: 1000}, {name: "8", value: 500}, {name: "1", value: 1}], manga: []},
      activity: [{from: 1, to: 8, value: 1000}, {from: 8, to: 25, value: 500}, {from: 25, to: 26, value: 1}, {from: 26, to: 80, value: 0}],
    },
    achievements: [{neko_id: "known", name: "Known achievement", level: 3, progress: 75, icon: image}, {neko_id: "unknown", level: 1, progress: 30, icon: null}],
  }
  const fields = ["cover", "title", "description", "score", "user_score", "progress", "year", "status", "genres", "studio", "type"]
  const render = async (data = defaults, q = {}) => JSDOM.fragment(await ejs.render(partial, {plugins: {shikimori: data}, q, f: value => String(value), s: value => value === 1 ? "" : "s"}, {async: true}))
  const text = node => node.textContent.replace(/\s+/g, " ").trim()
  beforeAll(() => {
    partial = fs.readFileSync(path.join(__dirname, "../source/templates/classic/partials/shikimori.ejs"), "utf8")
  })
  test("renders the configured sections in canonical order rather than input order", async () => {
    const root = await render()
    expect([...root.querySelectorAll("h2")].map(text)).toEqual(["Shikimori", "Statistics", "Currently watching", "Completed", "Planned", "Favorites animes", "Favorites mangas", "Favorites ranobes", "Favorites characters", "Favorites producers", "Favorites mangakas", "Favorites seyu", "Statistics", "Achievements"])
    const content = text(root)
    expect(content.indexOf("Favorites genres: Fantasy, Adventure")).toBeLessThan(content.indexOf("106 episodes watched"))
    expect(root.querySelector(".summary").compareDocumentPosition(root.querySelector(".statuses"))).toBe(4)
    expect(content.indexOf("Activity")).toBeLessThan(content.indexOf("Achievements"))
    expect(root.querySelectorAll(".media")).toHaveLength(6)
  })
  test("disabled sections do not render even when their data slots contain entries", async () => {
    const root = await render({...defaults, sections: []})
    expect(text(root)).toBe("Shikimori")
    expect(root.querySelector(".shikimori")).toBeNull()
  })
  test("empty media blocks and an empty genres row are omitted", async () => {
    const root = await render({...defaults, sections: ["lists", "favorites", "genres"], lists: {anime: {watching: []}}, favorites: {anime: []}, genres: []})
    expect(text(root)).toBe("Shikimori")
    expect(root.querySelector(".media")).toBeNull()
  })
  test("an error message is escaped and does not attempt to render module data", async () => {
    const root = await render({error: {message: 'Failure <script>alert("x")</script> & retry'}})
    expect(text(root.querySelector(".field.error"))).toBe('Failure <script>alert("x")</script> & retry')
    expect(root.querySelector("script")).toBeNull()
    expect(root.querySelector(".shikimori")).toBeNull()
  })
  test.each(["lists", "favorites"])("%s fields are independently controlled by the display allowlist", async module => {
    const selectors = {cover: "img", title: ".name", description: ".description", score: ".score", user_score: ".user-score", progress: ".progress", year: ".release", status: ".release", genres: ".genres", studio: ".studio", type: ".type"}
    for (const field of fields) {
      const data = {...defaults, sections: [module], lists: {anime: {watching: [card]}}, favorites: {anime: [card]}}
      const root = await render(data, {[`shikimori.display.${module}`]: field})
      const row = root.querySelector(".media")
      expect(row.querySelector(selectors[field])).not.toBeNull()
      for (const hidden of fields.filter(hidden => hidden !== field && selectors[hidden] !== selectors[field]))
        expect(row.querySelector(selectors[hidden])).toBeNull()
      if (field === "year")
        expect(text(row.querySelector(".release"))).toBe("2024")
      if (field === "status")
        expect(text(row.querySelector(".release"))).toBe("(releasing)")
    }
  })
  test("empty or unknown-only display fields retain a media header but no body", async () => {
    for (const value of ["", "unknown"]) {
      const root = await render({...defaults, sections: ["favorites"], favorites: {anime: [card]}}, {"shikimori.display.favorites": value})
      expect([...root.querySelectorAll("h2")].map(text)).toEqual(["Shikimori", "Favorites animes"])
      expect(root.querySelector(".media")).toBeNull()
    }
  })
  test("display inputs accept both parsed action arrays and encoded web comma lists", async () => {
    const data = {...defaults, sections: ["lists"], lists: {anime: {watching: [card]}}}
    for (const value of [["title", "score"], "title%2C%20score%2C%20bogus"]) {
      const root = await render(data, {"shikimori.display.lists": value})
      expect(text(root.querySelector(".media"))).toBe("Anime title 8.24")
    }
  })
  test("score fields render raw decimals and include zero without a percent suffix", async () => {
    const root = await render({...defaults, sections: ["lists"], lists: {anime: {watching: [{...card, scores: {community: 0, user: "7.50"}}]}}}, {"shikimori.display.lists": "score, user_score"})
    expect(text(root.querySelector(".score"))).toBe("0")
    expect(text(root.querySelector(".user-score"))).toBe("User 7.50")
    expect(text(root)).not.toContain("%")
  })
  test.each([["anons", "Not yet released"], ["ongoing", "(releasing)"], ["released", ""]])("%s uses the exact release-status label", async (status, label) => {
    const root = await render({...defaults, sections: ["lists"], lists: {anime: {watching: [{...card, status}]}}}, {"shikimori.display.lists": "year, status"})
    expect(text(root.querySelector(".release"))).toBe(`2024 ${label}`.trim())
  })
  test("manga and ranobe cards take the book branch and show chapters and volumes", async () => {
    const root = await render({...defaults, sections: ["lists"], lists: {manga: {watching: [manga]}, ranobe: {watching: [manga]}}}, {"shikimori.display.lists": "type, progress"})
    expect([...root.querySelectorAll(".type")].map(text)).toEqual(["Manga", "Manga"])
    expect([...root.querySelectorAll(".progress")].map(text)).toEqual(["Chapter 3/15", "Chapter 3/15"])
    expect([...root.querySelectorAll(".volumes")].map(text)).toEqual(["2 volumes", "2 volumes"])
  })
  test("completed list progress uses the AniList completion icon", async () => {
    const root = await render({...defaults, sections: ["lists"], lists: {anime: {completed: [{...card, progress: 12}]}}}, {"shikimori.display.lists": "progress"})
    expect(root.querySelector(".progress svg path").getAttribute("d")).toBe("M1.5 8a6.5 6.5 0 1113 0 6.5 6.5 0 01-13 0zM0 8a8 8 0 1116 0A8 8 0 010 8zm11.78-1.72a.75.75 0 00-1.06-1.06L6.75 9.19 5.28 7.72a.75.75 0 00-1.06 1.06l2 2a.75.75 0 001.06 0l4.5-4.5z")
  })
  test("null covers and null favorite progress do not emit broken images or invented user counters", async () => {
    const root = await render({...defaults, sections: ["favorites"], favorites: {anime: [{...card, artwork: null, progress: null, scores: {community: 8.24, user: null}}]}}, {"shikimori.display.favorites": "cover, progress, user_score"})
    expect(root.querySelector("img")).toBeNull()
    expect(text(root.querySelector(".progress"))).toBe("12 episodes")
    expect(root.querySelector(".user-score")).toBeNull()
  })
  test("strip names label visible artwork and remain visible when artwork is omitted", async () => {
    const root = await render({...defaults, sections: ["characters", "people"]})
    const image = root.querySelector(".characters img")
    expect(image.getAttribute("width")).toBe("36")
    expect(image.getAttribute("height")).toBe("54")
    expect(image.getAttribute("alt")).toBe("Character A")
    expect(image.getAttribute("title")).toBe("Character A")
    expect(text(root)).toContain("Character B")
    const names = await render({...defaults, sections: ["characters", "people"]}, {"shikimori.display.characters": "name", "shikimori.display.people": "name"})
    expect(names.querySelector("img")).toBeNull()
    expect(text(names)).toContain("Character A")
    expect(text(names)).toContain("Producer A")
    expect(text(names)).toContain("Voice A")
  })
  test("text-only strips render separated entries with scoped name classes in characters and people strips", async () => {
    const data = {
      ...defaults,
      sections: ["characters", "people"],
      characters: [{name: "Character A", artwork: null}, {name: "Character B", artwork: null}],
      people: {seyu: [{name: "Voice A", artwork: null}, {name: "Voice B", artwork: null}]},
    }
    const root = await render(data, {"shikimori.display.characters": "name", "shikimori.display.people": "name"})
    const charNames = [...root.querySelectorAll(".shikimori .characters")][0].querySelectorAll(".name")
    expect(charNames).toHaveLength(2)
    expect([...charNames].map(el => el.textContent.trim())).toEqual(["Character A", "Character B"])
    expect([...charNames].every(el => el.classList.contains("field") && el.classList.contains("name"))).toBe(true)

    const seyuNames = [...root.querySelectorAll(".shikimori .characters")][1].querySelectorAll(".name")
    expect(seyuNames).toHaveLength(2)
    expect([...seyuNames].map(el => el.textContent.trim())).toEqual(["Voice A", "Voice B"])
    expect([...seyuNames].every(el => el.classList.contains("field") && el.classList.contains("name"))).toBe(true)
  })
  test("artwork-only and empty strip display inputs hide names without changing the configured strip order", async () => {
    const data = {...defaults, sections: ["characters", "people"]}
    const artwork = await render(data, {"shikimori.display.characters": "artwork", "shikimori.display.people": "artwork"})
    expect(text(artwork)).not.toMatch(/Character A|Character B|Producer A|Voice A|Author A/)
    expect([...artwork.querySelectorAll("img")].every(image => image.getAttribute("alt") === "" && !image.getAttribute("title"))).toBe(true)
    const empty = await render(data, {"shikimori.display.characters": "", "shikimori.display.people": ""})
    expect([...empty.querySelectorAll("h2")].map(text)).toEqual(["Shikimori", "Favorites characters", "Favorites producers", "Favorites mangakas", "Favorites seyu"])
    expect(empty.querySelector(".characters img, .characters span")).toBeNull()
  })
  test("statistics display fields are independently gated and status chips retain enum names", async () => {
    const data = {...defaults, sections: ["stats"]}
    for (const field of ["summary", "statuses", "distribution", "activity"]) {
      const root = await render(data, {"shikimori.display.stats": field})
      expect(text(root).includes("106 episodes watched")).toBe(field === "summary")
      expect(!!root.querySelector(".statuses")).toBe(field === "statuses")
      expect(!!root.querySelector(".histograms")).toBe(field === "distribution")
      expect(!!root.querySelector(".stats-block .activity")).toBe(field === "activity")
      if (field === "statuses") {
        expect([...root.querySelectorAll(".chip .name")].map(text)).toEqual(["watching", "on_hold", "rewatching"])
        expect([...root.querySelectorAll(".chip .value")].map(text)).toEqual(["12", "3", "1"])
        expect([...root.querySelectorAll(".chip")].every(chip => [...chip.children].every(child => child.tagName === "SPAN"))).toBe(true)
      }
    }
    const empty = await render(data, {"shikimori.display.stats": ""})
    expect([...empty.querySelectorAll("h2")].map(text)).toEqual(["Shikimori", "Statistics"])
    expect(empty.querySelector(".statuses, .stats-block")).toBeNull()
  })
  test("ten histogram buckets use integer heights, a nonzero floor and no NaN for empty data", async () => {
    const root = await render({...defaults, sections: ["stats"]}, {"shikimori.display.stats": "distribution"})
    const histograms = [...root.querySelectorAll(".histogram")]
    expect(histograms).toHaveLength(2)
    expect([...histograms[0].querySelectorAll(".bar")].map(bar => bar.style.height)).toEqual(["1px", "0px", "0px", "0px", "0px", "0px", "0px", "12px", "0px", "24px"])
    expect([...histograms[1].querySelectorAll(".bar")].map(bar => bar.style.height)).toEqual(new Array(10).fill("0px"))
    expect([...histograms[0].querySelectorAll(".bucket-labels span")].map(text)).toEqual(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"])
    expect([...root.querySelectorAll(".series-label")].map(text)).toEqual(["Anime", "Manga"])
    expect(root.querySelector(".stats-block .label")).toBeNull()
  })
  test("activity keeps every native bucket and rounds heights without calendar relabeling", async () => {
    const root = await render({...defaults, sections: ["stats"]}, {"shikimori.display.stats": "activity"})
    const bars = [...root.querySelectorAll(".activity .bar")]
    expect(bars.map(bar => bar.style.height)).toEqual(["16px", "8px", "1px", "0px"])
    expect(bars.map(bar => bar.getAttribute("title"))).toEqual(["1–8: 1000", "8–25: 500", "25–26: 1", "26–80: 0"])
    expect(text(root)).not.toMatch(/week|178\.6/i)
  })
  test.each([["icons", 1, 1], ["chips", 0, 2], ["icons, chips", 1, 2], ["chips, icons", 1, 2], ["", 0, 0]])("achievement display '%s' controls icons and chips with a null-icon fallback", async (display, icons, chips) => {
    const root = await render({...defaults, sections: ["achievements"]}, {"shikimori.display.achievements": display})
    expect(root.querySelectorAll("img.badge")).toHaveLength(icons)
    expect(root.querySelectorAll(".badge.chip-only")).toHaveLength(chips)
    for (const chip of root.querySelectorAll(".badge.chip-only")) {
      expect(chip.children).toHaveLength(5)
      expect([...chip.children].every(child => child.tagName === "SPAN")).toBe(true)
    }
    const labels = [...root.querySelectorAll(".badge.chip-only")].map(chip => [...chip.children].map(text))
    if (chips)
      expect(labels).toContainEqual(["unknown", "·", "Lv 1", "·", "30%"])
    if (display.includes("chips"))
      expect(labels).toContainEqual(["Known achievement", "·", "Lv 3", "·", "75%"])
    if (display.includes("icons") && display.includes("chips"))
      expect(root.querySelector(".achievements img.badge")).toBe(root.querySelector(".achievements").querySelector("img.badge"))
    if (icons) {
      const image = root.querySelector("img.badge")
      expect(image.getAttribute("width")).toBe("26")
      expect(image.getAttribute("height")).toBe("26")
      expect(image.getAttribute("title")).toBe("Known achievement · Lv 3 · 75%")
      expect([...root.querySelectorAll(".achievements .level")].filter(level => !level.closest(".chip-only"))).toEqual([])
    }
  })
})
