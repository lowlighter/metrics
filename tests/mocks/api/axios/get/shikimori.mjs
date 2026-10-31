/**Mocked data */
export default function({faker, url}) {
  //User search
  if (/^https:\/\/shikimori\.io\/api\/users\?search=.*&limit=10$/.test(url)) {
    const nickname = decodeURIComponent(url.match(/search=(?<nickname>[^&]*)/)?.groups?.nickname ?? faker.internet.userName())
    console.debug(`metrics/compute/mocks > mocking shikimori api result > user search > ${nickname}`)
    return ({
      status: 200,
      data: [{id: faker.number.int({min: 100000, max: 9999999}), nickname}],
    })
  }
  //User favorites
  if (/^https:\/\/shikimori\.io\/api\/users\/\d+\/favourites$/.test(url)) {
    console.debug("metrics/compute/mocks > mocking shikimori api result > favourites")
    const entry = (_, index) => ({id: 10000 + index, name: faker.lorem.words(), russian: faker.lorem.words(), image: null, url: null})
    return ({
      status: 200,
      data: {
        animes: new Array(16).fill(null).map(entry),
        mangas: new Array(16).fill(null).map(entry),
        ranobe: new Array(8).fill(null).map(entry),
        characters: new Array(24).fill(null).map(entry),
        people: new Array(5).fill(null).map(entry),
        mangakas: new Array(7).fill(null).map(entry),
        seyu: new Array(5).fill(null).map(entry),
        producers: new Array(4).fill(null).map(entry),
      },
    })
  }
  //Achievements
  if (/^https:\/\/shikimori\.io\/api\/achievements\?user_id=\d+$/.test(url)) {
    console.debug("metrics/compute/mocks > mocking shikimori api result > achievements")
    return ({
      status: 200,
      data: new Array(30).fill(null).map(_ => ({
        id: faker.number.int(1000000000),
        user_id: Number(url.match(/user_id=(?<user_id>\d+)/)?.groups?.user_id ?? 0),
        neko_id: faker.helpers.slugify(faker.lorem.words()).toLowerCase(),
        level: faker.number.int(3),
        progress: faker.number.int(100),
        created_at: faker.date.past().toISOString(),
        updated_at: faker.date.recent().toISOString(),
      })),
    })
  }
  //User profile (statistics)
  if (/^https:\/\/shikimori\.io\/api\/users\/\d+$/.test(url)) {
    console.debug("metrics/compute/mocks > mocking shikimori api result > profile")
    const statuses = type => ["planned", "watching", "rewatching", "completed", "on_hold", "dropped"].map((name, index) => ({id: index, grouped_id: name, name, size: faker.number.int(500), type}))
    const histogram = _ => new Array(faker.number.int(10)).fill(null).map(_ => ({name: `${faker.number.int(10)}`, value: faker.number.int(100)}))
    return ({
      status: 200,
      data: {
        id: Number(url.match(/users\/(?<id>\d+)/)?.groups?.id ?? 0),
        nickname: faker.internet.userName(),
        avatar: null,
        image: null,
        name: null,
        sex: null,
        full_years: faker.number.int(40),
        last_online_at: faker.date.recent().toISOString(),
        url: null,
        website: null,
        location: null,
        banned: false,
        about: null,
        about_html: null,
        stats: {
          statuses: {anime: statuses("Anime"), manga: statuses("Manga")},
          full_statuses: {anime: statuses("Anime"), manga: statuses("Manga")},
          scores: {anime: histogram(), manga: histogram()},
          types: {anime: histogram(), manga: histogram()},
          ratings: {anime: histogram()},
          "has_anime?": true,
          "has_manga?": true,
          genres: new Array(10).fill(null).map(_ => ({name: faker.lorem.word(), value: faker.number.int(100)})),
          studios: [],
          publishers: [],
          activity: new Array(10).fill(null).map((_, index) => ({name: [1763672400 + index * 1143137, 1764815537 + index * 1143137], value: faker.number.int(100)})),
        },
        style_id: null,
      },
    })
  }
}
