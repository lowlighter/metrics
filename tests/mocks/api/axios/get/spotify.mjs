/**Mocked data */
export default function({faker, url, options, login = faker.internet.userName()}) {
  //Spotify api
  if (/^https:..api.spotify.com.*$/.test(url)) {
    //Get recently played tracks
    if (/me.player.recently-played/.test(url) && (options?.headers?.Authorization === "Bearer MOCKED_TOKEN_ACCESS")) {
      console.debug(`metrics/compute/mocks > mocking spotify api result > ${url}`)
      const artist = faker.random.words()
      const track = faker.random.words(5)
      return ({
        status: 200,
        data: {
          items: [
            {
              track: {
                album: {
                  album_type: "single",
                  artists: [
                    {
                      name: artist,
                      type: "artist",
                    },
                  ],
                  images: [
                    {
                      height: 640,
                      url: faker.image.abstract(),
                      width: 640,
                    },
                    {
                      height: 300,
                      url: faker.image.abstract(),
                      width: 300,
                    },
                    {
                      height: 64,
                      url: faker.image.abstract(),
                      width: 64,
                    },
                  ],
                  name: track,
                  release_date: `${faker.date.past()}`.substring(0, 10),
                  type: "album",
                },
                artists: [
                  {
                    name: artist,
                    type: "artist",
                  },
                ],
                name: track,
                preview_url: faker.internet.url(),
                type: "track",
              },
              played_at: `${faker.date.recent()}`,
              context: {
                type: "album",
              },
            },
          ],
        },
      })
    }
    else if (/me.top.tracks/.test(url) && (options?.headers?.Authorization === "Bearer MOCKED_TOKEN_ACCESS")) {
      console.debug(`metrics/compute/mocks > mocking spotify api result > ${url}`)
      const artist = faker.random.words()
      const track = faker.random.words(5)
      return ({
        status: 200,
        data: {
          items: [
            {
              album: {
                album_type: "single",
                artists: [
                  {
                    name: artist,
                    type: "artist",
                  },
                ],
                images: [
                  {
                    height: 640,
                    url: faker.image.abstract(),
                    width: 640,
                  },
                  {
                    height: 300,
                    url: faker.image.abstract(),
                    width: 300,
                  },
                  {
                    height: 64,
                    url: faker.image.abstract(),
                    width: 64,
                  },
                ],
                name: track,
                release_date: `${faker.date.past()}`.substring(0, 10),
                type: "album",
              },
              artists: [
                {
                  name: artist,
                  type: "artist",
                },
              ],
              name: track,
              preview_url: faker.internet.url(),
              type: "track",
            },
          ],
        },
      })
    }
    else if (/me.top.artists/.test(url) && (options?.headers?.Authorization === "Bearer MOCKED_TOKEN_ACCESS")) {
      console.debug(`metrics/compute/mocks > mocking spotify api result > ${url}`)
      const genre = faker.random.words()
      const track = faker.random.words(5)
      return ({
        status: 200,
        data: {
          items: [
            {
              genres: [genre],
              images: [
                {
                  height: 640,
                  url: faker.image.abstract(),
                  width: 640,
                },
                {
                  height: 300,
                  url: faker.image.abstract(),
                  width: 300,
                },
                {
                  height: 64,
                  url: faker.image.abstract(),
                  width: 64,
                },
              ],
              name: track,
              type: "artist",
            },
          ],
        },
      })
    }
  }
}
