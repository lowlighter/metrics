/**Mocked data */
export default function({faker, url, options, login = faker.internet.userName()}) {
  if (/^https:..music.youtube.com.youtubei.v1.*$/.test(url)) {
    //Get recently played tracks
    if (/browse/.test(url)) {
      console.debug(`metrics/compute/mocks > mocking yt music api result > ${url}`)
      const artist = faker.random.word()
      const track = faker.random.words(5)
      const artwork = faker.image.imageUrl()
      return ({
        contents: {
          singleColumnBrowseResultsRenderer: {
            tabs: [{
              tabRenderer: {
                content: {
                  sectionListRenderer: {
                    contents: [{
                      contents: [{
                        musicResponsiveListItemRenderer: {
                          thumbnail: {
                            musicThumbnailRenderer: {
                              thumbnail: {
                                thumbnails: [{
                                  url: artwork,
                                }],
                              },
                            },
                          },
                          flexColumns: [{
                            musicResponsiveListItemFlexColumnRenderer: {
                              text: {
                                runs: [{
                                  text: track,
                                }],
                              },
                            },
                          }, {
                            musicResponsiveListItemFlexColumnRenderer: {
                              text: {
                                runs: [{
                                  text: artist,
                                }],
                              },
                            },
                          }],
                        },
                      }],
                    }],
                  },
                },
              },
            }],
          },
        },
      })
    }
  }
}
