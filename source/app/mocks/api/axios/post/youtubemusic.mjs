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
            "contents": {
              "singleColumnBrowseResultsRenderer": {
                "tabs": [
                  {
                    "tabRenderer": {
                      "content": {
                        "sectionListRenderer": {
                          "contents": [
                            {
                                "contents": [
                                    {
                                    "musicResponsiveListItemRenderer": {
                                      "thumbnail": {
                                        "musicThumbnailRenderer": {
                                          "thumbnail": {
                                            "thumbnails": [
                                              {
                                                "url": artwork,
                                              }
                                            ]
                                          },
                                        }
                                      },
                                      "flexColumns": [
                                        {
                                          "musicResponsiveListItemFlexColumnRenderer": {
                                            "text": {
                                              "runs": [
                                                {
                                                  "text": track,
                                                }
                                            ]
                                            },
                                          }
                                        },
                                        {
                                          "musicResponsiveListItemFlexColumnRenderer": {
                                            "text": {
                                              "runs": [
                                                {
                                                  "text": artist,
                                                },
                                              ]
                                            },
                                          }
                                        }
                                      ],
                                    }
                                  },
                                ],
                              }
                            ],
                          },
                        },
                      },
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
          status:200,
          data:{
            toptracks:{
              "@attr":{
                page:"1",
                perPage:"1",
                user:"RJ",
                total:"100",
                pages:"100",
              },
              track:[
                {
                  artist:{
                    mbid:"",
                    name:artist,
                  },
                  image:[
                    {
                      size:"small",
                      "#text":faker.image.abstract(),
                    },
                    {
                      size:"medium",
                      "#text":faker.image.abstract(),
                    },
                    {
                      size:"large",
                      "#text":faker.image.abstract(),
                    },
                    {
                      size:"extralarge",
                      "#text":faker.image.abstract(),
                    },
                  ],
                  url:faker.internet.url(),
                  name:track,
                  mbid:"",
                },
              ],
            },
          },
        })
      }
    }
  }  