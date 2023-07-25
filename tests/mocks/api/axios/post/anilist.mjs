/**Mocked data */
export default function({faker, url, body, login = faker.internet.userName()}) {
  if (/^https:..graphql.anilist.co.*$/.test(url)) {
    //Initialization and media generator
    const {query} = body
    const media = ({type}) => ({
      title: {romaji: faker.lorem.words(), english: faker.lorem.words(), native: faker.lorem.words()},
      description: faker.lorem.paragraphs(),
      type,
      status: faker.helpers.arrayElement(["FINISHED", "RELEASING", "NOT_YET_RELEASED", "CANCELLED", "HIATUS"]),
      episodes: 100 + faker.number.int(100),
      volumes: faker.number.int(100),
      chapters: 100 + faker.number.int(1000),
      averageScore: faker.number.int(100),
      countryOfOrigin: "JP",
      genres: new Array(6).fill(null).map(_ => faker.lorem.word()),
      coverImage: {medium: null},
      startDate: {year: faker.date.past({years:20}).getFullYear()},
    })
    //User statistics query
    if (/^query Statistics /.test(query)) {
      console.debug("metrics/compute/mocks > mocking anilist api result > Statistics")
      return ({
        status: 200,
        data: {
          data: {
            User: {
              id: faker.number.int(100000),
              name: faker.internet.userName(),
              about: null,
              statistics: {
                anime: {
                  count: faker.number.int(1000),
                  minutesWatched: faker.number.int(100000),
                  episodesWatched: faker.number.int(10000),
                  genres: new Array(4).fill(null).map(_ => ({genre: faker.lorem.word()})),
                },
                manga: {
                  count: faker.number.int(1000),
                  chaptersRead: faker.number.int(100000),
                  volumesRead: faker.number.int(10000),
                  genres: new Array(4).fill(null).map(_ => ({genre: faker.lorem.word()})),
                },
              },
            },
          },
        },
      })
    }
    //Favorites characters
    if (/^query FavoritesCharacters /.test(query)) {
      console.debug("metrics/compute/mocks > mocking anilist api result > Favorites characters")
      return ({
        status: 200,
        data: {
          data: {
            User: {
              favourites: {
                characters: {
                  nodes: new Array(2 + faker.number.int(16)).fill(null).map(_ => ({
                    name: {full: faker.person.fullName(), native: faker.person.fullName()},
                    image: {medium: null},
                  })),
                  pageInfo: {currentPage: 1, hasNextPage: false},
                },
              },
            },
          },
        },
      })
    }
    //Favorites anime/manga query
    if (/^query Favorites /.test(query)) {
      console.debug("metrics/compute/mocks > mocking anilist api result > Favorites")
      const type = /anime[(]/.test(query) ? "ANIME" : /manga[(]/.test(query) ? "MANGA" : "OTHER"
      return ({
        status: 200,
        data: {
          data: {
            User: {
              favourites: {
                [type.toLocaleLowerCase()]: {
                  nodes: new Array(16).fill(null).map(_ => media({type})),
                  pageInfo: {currentPage: 1, hasNextPage: false},
                },
              },
            },
          },
        },
      })
    }
    //Medias query
    if (/^query Medias /.test(query)) {
      console.debug("metrics/compute/mocks > mocking anilist api result > Medias")
      const {type} = body.variables
      return ({
        status: 200,
        data: {
          data: {
            MediaListCollection: {
              lists: [
                {
                  name: {ANIME: "Watching", MANGA: "Reading", OTHER: "Completed"}[type],
                  isCustomList: false,
                  entries: new Array(16).fill(null).map(_ => ({
                    status: faker.helpers.arrayElement(["CURRENT", "PLANNING", "COMPLETED", "DROPPED", "PAUSED", "REPEATING"]),
                    progress: faker.number.int(100),
                    progressVolumes: null,
                    score: 0,
                    startedAt: {year: null, month: null, day: null},
                    completedAt: {year: null, month: null, day: null},
                    media: media({type}),
                  })),
                },
              ],
            },
          },
        },
      })
    }
  }
}
