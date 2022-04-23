/**Mocked data */
export default function({faker, url, options, login = faker.internet.userName()}) {
  //Last.fm api
  if (/^https:..ws.audioscrobbler.com.*$/.test(url)) {
    //Get recently played tracks
    if (/user.getrecenttracks/.test(url)) {
      console.debug(`metrics/compute/mocks > mocking lastfm api result > ${url}`)
      const artist = faker.random.word()
      const album = faker.random.words(3)
      const track = faker.random.words(5)
      const date = faker.date.recent()
      return ({
        status: 200,
        data: {
          recenttracks: {
            "@attr": {
              page: "1",
              perPage: "1",
              user: "RJ",
              total: "100",
              pages: "100",
            },
            track: [
              {
                artist: {
                  mbid: "",
                  "#text": artist,
                },
                album: {
                  mbid: "",
                  "#text": album,
                },
                image: [
                  {
                    size: "small",
                    "#text": faker.image.abstract(),
                  },
                  {
                    size: "medium",
                    "#text": faker.image.abstract(),
                  },
                  {
                    size: "large",
                    "#text": faker.image.abstract(),
                  },
                  {
                    size: "extralarge",
                    "#text": faker.image.abstract(),
                  },
                ],
                streamable: "0",
                date: {
                  uts: Math.floor(date.getTime() / 1000),
                  "#text": date.toUTCString().slice(5, 22),
                },
                url: faker.internet.url(),
                name: track,
                mbid: "",
              },
            ],
          },
        },
      })
    }
    else if (/user.gettoptracks/.test(url)) {
      console.debug(`metrics/compute/mocks > mocking lastfm api result > ${url}`)
      const artist = faker.random.word()
      const track = faker.random.words(5)
      return ({
        status: 200,
        data: {
          toptracks: {
            "@attr": {
              page: "1",
              perPage: "1",
              user: "RJ",
              total: "100",
              pages: "100",
            },
            track: [
              {
                artist: {
                  mbid: "",
                  name: artist,
                },
                image: [
                  {
                    size: "small",
                    "#text": faker.image.abstract(),
                  },
                  {
                    size: "medium",
                    "#text": faker.image.abstract(),
                  },
                  {
                    size: "large",
                    "#text": faker.image.abstract(),
                  },
                  {
                    size: "extralarge",
                    "#text": faker.image.abstract(),
                  },
                ],
                url: faker.internet.url(),
                name: track,
                mbid: "",
              },
            ],
          },
        },
      })
    }
    else if (/user.gettopartists/.test(url)) {
      console.debug(`metrics/compute/mocks > mocking lastfm api result > ${url}`)
      const artist = faker.random.word()
      const playcount = faker.random.number()
      return ({
        status: 200,
        data: {
          topartists: {
            "@attr": {
              page: "1",
              perPage: "1",
              user: "RJ",
              total: "100",
              pages: "100",
            },
            artist: [
              {
                image: [
                  {
                    size: "small",
                    "#text": faker.image.abstract(),
                  },
                  {
                    size: "medium",
                    "#text": faker.image.abstract(),
                  },
                  {
                    size: "large",
                    "#text": faker.image.abstract(),
                  },
                  {
                    size: "extralarge",
                    "#text": faker.image.abstract(),
                  },
                ],
                streamable: "0",
                playcount,
                url: faker.internet.url(),
                name: artist,
                mbid: "",
              },
            ],
          },
        },
      })
    }
  }
}
