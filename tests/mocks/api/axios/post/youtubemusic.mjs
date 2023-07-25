/**Mocked data */
export default function({faker, url, options, login = faker.internet.userName()}) {
  if (/^https:..music.youtube.com.youtubei.v1.*$/.test(url)) {
    //Get recently played tracks
    if (/browse/.test(url)) {
      console.debug(`metrics/compute/mocks > mocking yt music api result > ${url}`)
      const artist = faker.lorem.word()
      const track = faker.lorem.words(5)
      const artwork = faker.image.url()
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
