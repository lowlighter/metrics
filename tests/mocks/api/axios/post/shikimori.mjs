/**Mocked data */
export default function({faker, url, body}) {
  if (/^https:\/\/shikimori\.io\/api\/graphql(?:\?.*)?$/.test(url)) {
    //Initialization and entity generators
    const {query, variables} = body
    const entity = ({type, index = 0}) => ({
      id: `${faker.number.int(100000)}`,
      name: faker.lorem.words(),
      russian: faker.lorem.words(),
      english: faker.lorem.words(),
      japanese: faker.lorem.words(),
      kind: type === "anime" ? faker.helpers.arrayElement(["tv", "movie", "ova", "ona", "special"]) : index % 2 ? "manga" : "light_novel",
      status: faker.helpers.arrayElement(["anons", "ongoing", "released"]),
      airedOn: {year: faker.date.past({years: 20}).getFullYear()},
      releasedOn: {year: faker.date.past({years: 10}).getFullYear()},
      episodes: type === "anime" ? faker.number.int(100) : null,
      chapters: type === "manga" ? faker.number.int(1000) : null,
      volumes: type === "manga" ? faker.number.int(20) : null,
      score: Math.round(faker.number.float({min: 0, max: 10}) * 100) / 100,
      description: `${faker.lorem.paragraph()}<br>${faker.lorem.paragraph()}`,
      genres: new Array(4).fill(null).map(_ => ({name: faker.lorem.word()})),
      studios: type === "anime" ? new Array(1).fill(null).map(_ => ({name: faker.company.name()})) : undefined,
      poster: {originalUrl: null},
    })
    //Summary query (scalar counters, full first page followed by a terminating short page)
    if (/^query Summary /.test(query)) {
      console.debug("metrics/compute/mocks > mocking shikimori api result > Summary")
      const {page = 1, limit = 50, targetType = "Anime"} = variables
      const count = page === 1 ? Math.min(limit, 50) : page === 2 ? Math.min(limit, 3) : 0
      return ({
        status: 200,
        data: {
          data: {
            userRates: new Array(count).fill(null).map(_ => ({episodes: targetType === "Anime" ? 2 : 0, chapters: targetType === "Manga" ? 5 : 0})),
          },
        },
      })
    }
    //Lists query (userRates)
    if (/^query Lists /.test(query)) {
      console.debug("metrics/compute/mocks > mocking shikimori api result > Lists")
      const {page = 1, limit = 50, targetType = "Anime", status = "watching"} = variables
      //First page returns a full page to exercise pagination, next pages return a partial one
      const count = page < 2 ? Math.min(limit, 50) : 3
      return ({
        status: 200,
        data: {
          data: {
            userRates: new Array(count).fill(null).map((_, index) => ({
              id: `${page * 100000 + index}`,
              score: faker.number.int(10),
              status,
              episodes: targetType === "Anime" ? faker.number.int(100) : 0,
              chapters: targetType === "Manga" ? faker.number.int(1000) : 0,
              volumes: targetType === "Manga" ? faker.number.int(20) : 0,
              anime: targetType === "Anime" ? entity({type: "anime", index}) : null,
              manga: targetType === "Manga" ? entity({type: "manga", index}) : null,
            })),
          },
        },
      })
    }
    //Favorites medias query
    if (/^query FavoritesMedias /.test(query)) {
      console.debug("metrics/compute/mocks > mocking shikimori api result > Favorites medias")
      const data = {}
      for (const [, alias, root, variable] of query.matchAll(/(\w+): (animes|mangas)\(ids: \$(\w+), limit: 50\)/g)) {
        const ids = variables[variable].split(",").slice(0, 50)
        //Catalog ordering is not favorites ordering; the plugin restores it by ID.
        data[alias] = ids.map((id, index) => ({...entity({type: root === "animes" ? "anime" : "manga", index}), id})).reverse()
      }
      return ({
        status: 200,
        data: {
          data,
        },
      })
    }
  }
}
