//Imports
  import axios from "axios"
  import urls from "url"

//Mocked state
  let mocked = false

//Mocking
  export default async function ({graphql, rest}) {

    //Check if already mocked
      if (mocked)
        return {graphql, rest}
      mocked = true
      console.debug(`metrics/compute/mocks > mocking`)

    //GraphQL API mocking
      {
        console.debug(`metrics/compute/mocks > mocking graphql api`)
        const unmocked = graphql
        graphql = new Proxy(unmocked, {
          apply(target, that, args) {
            //Arguments
              const [query] = args
            //Common query
              if (/^query Metrics /.test(query)) {
                console.debug(`metrics/compute/mocks > mocking graphql api result > Metrics`)
                return ({
                  user: {
                    databaseId:22963968,
                    name:"Simon Lecoq",
                    login:"lowlighter",
                    createdAt:"2016-10-20T16:49:29Z",
                    avatarUrl:"https://avatars0.githubusercontent.com/u/22963968?u=f5097de6f06ed2e31906f784163fc1e9fc84ed57&v=4",
                    websiteUrl:"https://simon.lecoq.io",
                    isHireable:false,
                    twitterUsername:"lecoqsimon",
                    repositories:{totalCount:Math.floor(Math.random()*100), totalDiskUsage:Math.floor(Math.random()*100000), nodes:[]},
                    packages:{totalCount:Math.floor(Math.random()*10)},
                    starredRepositories:{totalCount:Math.floor(Math.random()*1000)},
                    watching:{totalCount:Math.floor(Math.random()*100)},
                    sponsorshipsAsSponsor:{totalCount:Math.floor(Math.random()*5)},
                    sponsorshipsAsMaintainer:{totalCount:Math.floor(Math.random()*5)},
                    contributionsCollection:{
                      totalRepositoriesWithContributedCommits:Math.floor(Math.random()*30),
                      totalCommitContributions:Math.floor(Math.random()*1000),
                      restrictedContributionsCount:Math.floor(Math.random()*500),
                      totalIssueContributions:Math.floor(Math.random()*100),
                      totalPullRequestContributions:Math.floor(Math.random()*100),
                      totalPullRequestReviewContributions:Math.floor(Math.random()*100)
                    },
                    calendar:{
                      contributionCalendar:{
                        weeks:[
                          {
                            contributionDays:[
                              {color:"#40c463"},
                              {color:"#ebedf0"},
                              {color:"#9be9a8"},
                              {color:"#ebedf0"},
                              {color:"#ebedf0"}
                            ]
                          },
                          {
                            contributionDays:[
                              {color:"#30a14e"},
                              {color:"#9be9a8"},
                              {color:"#40c463"},
                              {color:"#9be9a8"},
                              {color:"#ebedf0"},
                              {color:"#ebedf0"},
                              {color:"#ebedf0"}
                            ]
                          },
                          {
                            contributionDays:[
                              {color:"#40c463"},
                              {color:"#216e39"},
                              {color:"#9be9a8"}
                            ]
                          }
                        ]
                      }
                    },
                    repositoriesContributedTo:{totalCount:Math.floor(Math.random()*10)},
                    followers:{totalCount:Math.floor(Math.random()*100)},
                    following:{totalCount:Math.floor(Math.random()*100)},
                    issueComments:{totalCount:Math.floor(Math.random()*100)},
                    organizations:{totalCount:Math.floor(Math.random()*5)}
                  }
                })
              }
            //Repositories query
              if (/^query Repositories /.test(query)) {
                console.debug(`metrics/compute/mocks > mocking graphql api result > Repositories`)
                return /after: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"/m.test(query) ? ({
                  user:{
                    repositories:{
                      edges:[],
                      nodes:[],
                    }
                  }
                }) : ({
                  user:{
                    repositories:{
                      edges:[
                        {
                          cursor:"xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                        },
                      ],
                      nodes:[
                        {
                          name:"metrics",
                          watchers:{totalCount:Math.floor(Math.random()*100)},
                          stargazers:{totalCount:Math.floor(Math.random()*1000)},
                          languages:{
                            edges:[
                              {size:111733, node:{color:"#f1e05a", name:"JavaScript"}
                              },
                              {size:14398, node:{color:"#563d7c", name:"CSS"}},
                              {size:13223, node:{color:"#e34c26", name:"HTML"}},
                            ]
                          },
                          issues_open:{totalCount:Math.floor(Math.random()*100)},
                          issues_closed:{totalCount:Math.floor(Math.random()*100)},
                          pr_open:{totalCount:Math.floor(Math.random()*100)},
                          pr_merged:{totalCount:Math.floor(Math.random()*100)},
                          releases:{totalCount:Math.floor(Math.random()*100)},
                          forkCount:Math.floor(Math.random()*100),
                          licenseInfo:{spdxId:"MIT"}
                        },
                      ]
                    }
                  }
                })
              }
            //Single repository query
              if (/^query Repository /.test(query)) {
                console.debug(`metrics/compute/mocks > mocking graphql api result > Repository`)
                return ({
                  user:{
                    repository:{
                      name:"metrics",
                      createdAt:new Date().toISOString(),
                      diskUsage:Math.floor(Math.random()*10000),
                      watchers:{totalCount:Math.floor(Math.random()*100)},
                      stargazers:{totalCount:Math.floor(Math.random()*1000)},
                      languages:{
                        edges:[
                          {size:111733, node:{color:"#f1e05a", name:"JavaScript"}
                          },
                          {size:14398, node:{color:"#563d7c", name:"CSS"}},
                          {size:13223, node:{color:"#e34c26", name:"HTML"}},
                        ]
                      },
                      issues_open:{totalCount:Math.floor(Math.random()*100)},
                      issues_closed:{totalCount:Math.floor(Math.random()*100)},
                      pr_open:{totalCount:Math.floor(Math.random()*100)},
                      pr_merged:{totalCount:Math.floor(Math.random()*100)},
                      releases:{totalCount:Math.floor(Math.random()*100)},
                      forkCount:Math.floor(Math.random()*100),
                      licenseInfo:{spdxId:"MIT"}
                    },
                  }
                })
              }
            //Calendar query
              if (/^query Calendar /.test(query)) {
                console.debug(`metrics/compute/mocks > mocking graphql api result > Calendar`)
                //Generate calendar
                  const date = new Date(query.match(/from: "(?<date>\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z)"/)?.groups?.date)
                  const to = new Date(query.match(/to: "(?<date>\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z)"/)?.groups?.date)
                  const weeks = []
                  let contributionDays = []
                  for (; date <= to; date.setDate(date.getDate()+1)) {
                    //Create new week on sunday
                      if (date.getDay() === 0) {
                        weeks.push({contributionDays})
                        contributionDays = []
                      }
                    //Random contributions
                      const contributionCount = Math.min(10, Math.max(0, Math.floor(Math.random()*14-4)))
                      contributionDays.push({
                        contributionCount,
                        color:["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"][Math.ceil(contributionCount/10/0.25)],
                        date:date.toISOString().substring(0, 10)
                      })
                  }
                return ({
                  user: {
                    calendar:{
                      contributionCalendar:{
                        weeks
                      }
                    }
                  }
                })
              }
            //Gists query
              if (/^query Gists /.test(query)) {
                console.debug(`metrics/compute/mocks > mocking graphql api result > Projects`)
                return ({
                  user:{
                    gists:{
                      totalCount:1,
                      nodes:[
                        {
                          stargazerCount:Math.floor(Math.random()*10),
                          isFork:false,
                          forks:{totalCount:Math.floor(Math.random()*10)},
                          files:[{name:"example"}],
                          comments:{totalCount:Math.floor(Math.random()*10)}
                        }
                      ]
                    }
                  }
                })
              }
            //Projects query
              if (/^query Projects /.test(query)) {
                console.debug(`metrics/compute/mocks > mocking graphql api result > Projects`)
                return ({
                  user:{
                    projects:{
                      totalCount:1,
                      nodes:[
                        {
                          name:"User-owned project",
                          updatedAt:new Date().toISOString(),
                          progress:{
                            doneCount:Math.floor(Math.random()*10),
                            inProgressCount:Math.floor(Math.random()*10),
                            todoCount:Math.floor(Math.random()*10),
                            enabled:true
                          }
                        }
                      ]
                    }
                  }
                })
              }
            //Repository project query
              if (/^query RepositoryProject /.test(query)) {
                console.debug(`metrics/compute/mocks > mocking graphql api result > RepositoryProject`)
                return ({
                  user:{
                    repository:{
                      project:{
                        name:"Repository project example",
                        updatedAt:new Date().toISOString(),
                        progress:{
                          doneCount:Math.floor(Math.random()*10),
                          inProgressCount:Math.floor(Math.random()*10),
                          todoCount:Math.floor(Math.random()*10),
                          enabled:true
                        }
                      }
                    }
                  }
                })
              }
            //Starred repositories query
              if (/^query Starred /.test(query)) {
                console.debug(`metrics/compute/mocks > mocking graphql api result > Starred`)
                return ({
                  user:{
                    starredRepositories:{
                      edges:[
                        {
                          starredAt:"2020-10-16T18:53:16Z",
                          node:{
                            description:"📊 An image generator with 20+ metrics about your GitHub account such as activity, community, repositories, coding habits, website performances, music played, starred topics, etc. that you can put on your profile or elsewhere !",
                            forkCount:12,
                            isFork:false,
                            issues:{
                              totalCount: 12
                            },
                            nameWithOwner:"lowlighter/metrics",
                            openGraphImageUrl:"https://repository-images.githubusercontent.com/293860197/7fd72080-496d-11eb-8fe0-238b38a0746a",
                            pullRequests:{
                              totalCount:23
                            },
                            stargazerCount:120,
                            licenseInfo:{
                              nickname:null,
                              name:"MIT License"
                            },
                            primaryLanguage:{
                              color:"#f1e05a",
                              name:"JavaScript"
                            }
                          }
                        },
                      ]
                    }
                  }
                })
              }
            //Stargazers query
              if (/^query Stargazers /.test(query)) {
                console.debug(`metrics/compute/mocks > mocking graphql api result > Stargazers`)
                return /after: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"/m.test(query) ? ({
                  repository:{
                    stargazers:{
                      edges:[],
                    }
                  }
                }) : ({
                  repository:{
                    stargazers:{
                      edges:new Array(Math.ceil(20+80*Math.random())).fill(null).map(() => ({
                        starredAt:new Date(Date.now()-Math.floor(30*Math.random())*24*60*60*1000).toISOString(),
                        cursor:"xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      }))
                    }
                  }
                })
              }
            //Unmocked call
              return target(...args)
          }
        })
      }

    //Rest API mocking
      {
        console.debug(`metrics/compute/mocks > mocking rest api`)
        const unmocked = {
          request:rest.request,
          rateLimit:rest.rateLimit.get,
          listEventsForAuthenticatedUser:rest.activity.listEventsForAuthenticatedUser,
          getViews:rest.repos.getViews,
          getContributorsStats:rest.repos.getContributorsStats,
          listCommits:rest.repos.listCommits,
        }

        //Raw request
          rest.request = new Proxy(unmocked.request, {
            apply:function(target, that, args) {
              //Arguments
                const [url] = args
              //Head request
                if (/^HEAD .$/.test(url)) {
                  console.debug(`metrics/compute/mocks > mocking rest api result > rest.request HEAD`)
                  return ({
                    status: 200,
                    url:"https://api.github.com/",
                    headers:{
                      server:"GitHub.com",
                      status:"200 OK",
                      "x-oauth-scopes":"repo",
                    },
                    data:undefined
                  })
                }
              //Commit content
                if (/^https:..api.github.com.repos.lowlighter.metrics.commits.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx/.test(url)) {
                  console.debug(`metrics/compute/mocks > mocking rest api result > rest.request ${url}`)
                  return ({
                    status: 200,
                    url:"https://api.github.com/repos/lowlighter/metrics/commits/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
                    data:{
                      sha:"xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
                      commit:{
                        author:{
                          name:"lowlighter",
                          email:"22963968+lowlighter@users.noreply.github.com",
                          date:new Date().toISOString(),
                        },
                        committer:{
                          name:"lowlighter",
                          email:"22963968+lowlighter@users.noreply.github.com",
                          date:new Date().toISOString(),
                        },
                      },
                      author:{
                        login:"lowlighter",
                        id:22963968,
                      },
                      committer:{
                        login:"lowlighter",
                        id:22963968,
                      },
                      files: [
                        {
                          sha:"5ab8c4fb6a0be4c157419c3b9d7b522dca354b3f",
                          filename:"index.mjs",
                          patch:"@@ -0,0 +1,5 @@\n+//Imports\n+  import app from \"./src/app.mjs\"\n+\n+//Start app\n+  await app()\n\\ No newline at end of file"
                        },
                      ]
                    }
                  })
                }

              return target(...args)
            }
          })

        //Rate limit
          rest.rateLimit.get = new Proxy(unmocked.rateLimit, {
            apply:function(target, that, args) {
              return ({
                status: 200,
                url:"https://api.github.com/rate_limit",
                headers:{
                  server:"GitHub.com",
                  status:"200 OK",
                  "x-oauth-scopes":"repo",
                },
                data:{
                  resources:{
                    core:{limit:5000, used:0, remaining:5000, reset:0 },
                    search:{limit:30, used:0, remaining:30, reset:0 },
                    graphql:{limit:5000, used:0, remaining:5000, reset:0 },
                    integration_manifest:{limit:5000, used:0, remaining:5000, reset:0 },
                    source_import:{limit:100, used:0, remaining:100, reset:0 },
                    code_scanning_upload:{limit:500, used:0, remaining:500, reset:0 },
                  },
                  rate:{limit:5000, used:0, remaining:"MOCKED", reset:0}
                }
              })
            }
          })

        //Events list
          rest.activity.listEventsForAuthenticatedUser = new Proxy(unmocked.listEventsForAuthenticatedUser, {
            apply:function(target, that, [{page, per_page}]) {
              console.debug(`metrics/compute/mocks > mocking rest api result > rest.activity.listEventsForAuthenticatedUser`)
              return ({
                status:200,
                url:`https://api.github.com/users/lowlighter/events?per_page=${per_page}&page=${page}`,
                headers:{
                  server:"GitHub.com",
                  status:"200 OK",
                  "x-oauth-scopes":"repo",
                },
                data:page < 1 ? new Array(10).fill(null).map(() =>
                (false ? {
                    id:"10000000001",
                    type:"IssueCommentEvent",
                  } : {
                    id:"10000000000",
                    type:"PushEvent",
                    actor:{
                      id:22963968,
                      login:"lowlighter",
                    },
                    repo: {
                      id:293860197,
                      name:"lowlighter/metrics",
                    },
                    payload: {
                      ref:"refs/heads/master",
                      commits: [
                        {
                          url:"https://api.github.com/repos/lowlighter/metrics/commits/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                        }
                      ]
                    },
                    created_at:new Date(Date.now()-Math.floor(-Math.random()*14)*Math.floor(-Math.random()*24)*60*60*1000).toISOString()
                  })
                ) : []
              })
            }
          })

        //Repository traffic
          rest.repos.getViews = new Proxy(unmocked.getViews, {
            apply:function(target, that, args) {
              console.debug(`metrics/compute/mocks > mocking rest api result > rest.repos.getViews`)
              const count = Math.floor(Math.random()*1000)*2
              const uniques = Math.floor(Math.random()*count)*2
              return ({
                status:200,
                url:"https://api.github.com/repos/lowlighter/metrics/traffic/views",
                headers:{
                  server:"GitHub.com",
                  status:"200 OK",
                  "x-oauth-scopes":"repo",
                },
                data:{
                  count,
                  uniques,
                  views:[
                    {timestamp:new Date().toISOString(), count:count/2, uniques:uniques/2},
                    {timestamp:new Date().toISOString(), count:count/2, uniques:uniques/2},
                  ]
                }
              })
            }
          })

        //Repository contributions
          rest.repos.getContributorsStats = new Proxy(unmocked.getContributorsStats, {
            apply:function(target, that, args) {
              console.debug(`metrics/compute/mocks > mocking rest api result > rest.repos.getContributorsStats`)
              return ({
                status:200,
                url:"https://api.github.com/repos/lowlighter/metrics/stats/contributors",
                headers: {
                  server:"GitHub.com",
                  status:"200 OK",
                  "x-oauth-scopes":"repo",
                },
                data:[
                  {
                    total:Math.floor(Math.random()*1000),
                    weeks:[
                      {w:1, a:Math.floor(Math.random()*10000), d:Math.floor(Math.random()*10000), c:Math.floor(Math.random()*10000)},
                      {w:2, a:Math.floor(Math.random()*10000), d:Math.floor(Math.random()*10000), c:Math.floor(Math.random()*10000)},
                      {w:3, a:Math.floor(Math.random()*10000), d:Math.floor(Math.random()*10000), c:Math.floor(Math.random()*10000)},
                      {w:4, a:Math.floor(Math.random()*10000), d:Math.floor(Math.random()*10000), c:Math.floor(Math.random()*10000)},
                    ],
                    author: {
                      login:"lowlighter",
                    }
                  }
                ]
              })
            }
          })

        //Repository contributions
          rest.repos.listCommits = new Proxy(unmocked.listCommits, {
            apply:function(target, that, [{page, per_page}]) {
              console.debug(`metrics/compute/mocks > mocking rest api result > rest.repos.listCommits`)
              return ({
                status:200,
                url:`https://api.github.com/repos/lowlighter/metrics/commits?per_page=${per_page}&page=${page}`,
                headers: {
                  server:"GitHub.com",
                  status:"200 OK",
                  "x-oauth-scopes":"repo",
                },
                data:page < 2 ? new Array(per_page).fill(null).map(() =>
                  ({
                    sha:"xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
                    commit:{
                      author:{
                        name:"lowlighter",
                        date:new Date(Date.now()-Math.floor(-Math.random()*14)*24*60*60*1000).toISOString()
                      },
                      committer:{
                        name:"lowlighter",
                        date:new Date(Date.now()-Math.floor(-Math.random()*14)*24*60*60*1000).toISOString()
                      },
                    }
                  })
                ) : []
              })
            }
          })
      }

    //Axios mocking
      {
        console.debug(`metrics/compute/mocks > mocking axios`)
        const unmocked = {
          get:axios.get,
          post:axios.post,
        }

        //Post requests
          axios.post = new Proxy(unmocked.post, {
            apply:function(target, that, args) {
              //Arguments
                const [url, body] = args
              //Spotify api
                if (/^https:..accounts.spotify.com.api.token/.test(url)) {
                  //Access token generator
                    const params = new urls.URLSearchParams(body)
                    if ((params.get("grant_type") === "refresh_token")&&(params.get("client_id") === "MOCKED_CLIENT_ID")&&(params.get("client_secret") === "MOCKED_CLIENT_SECRET")&&(params.get("refresh_token") === "MOCKED_REFRESH_TOKEN")) {
                      console.debug(`metrics/compute/mocks > mocking spotify api result > ${url}`)
                      return ({
                          status:200,
                          data:{
                            access_token:"MOCKED_TOKEN_ACCESS",
                            token_type:"Bearer",
                            expires_in:3600,
                            scope:"user-read-recently-played user-read-private",
                          }
                      })
                    }
                }
              return target(...args)
            }
          })

        //Get requests
          axios.get = new Proxy(unmocked.get, {
            apply:function(target, that, args) {
              //Arguments
                const [url, options] = args
              //Pagespeed api
                if (/^https:..www.googleapis.com.pagespeedonline.v5/.test(url)) {
                  //Pagespeed result
                    if (/v5.runPagespeed.*&key=MOCKED_TOKEN/.test(url)) {
                      console.debug(`metrics/compute/mocks > mocking pagespeed api result > ${url}`)
                      return ({
                        status:200,
                        data:{
                          captchaResult:"CAPTCHA_NOT_NEEDED",
                          id:"https://simon.lecoq.io/",
                          lighthouseResult:{
                            requestedUrl:"https://simon.lecoq.io/",
                            finalUrl:"https://simon.lecoq.io/",
                            lighthouseVersion:"6.3.0",
                            audits:{
                              "final-screenshot":{
                                id:"final-screenshot",
                                title:"Final Screenshot",
                                score: null,
                                details:{
                                  data:"data:image/jpg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mOcOnfpfwAGfgLYttYINwAAAABJRU5ErkJggg==",
                                  type:"screenshot",
                                  timestamp:Date.now()
                                }
                              },
                              metrics:{
                                id:"metrics",
                                title:"Metrics",
                                score: null,
                                details:{
                                  items:[
                                    {
                                      observedFirstContentfulPaint:283,
                                      observedFirstVisualChangeTs:1789259909429,
                                      observedFirstContentfulPaintTs:1789259857628,
                                      firstContentfulPaint:370,
                                      observedDomContentLoaded:251,
                                      observedFirstMeaningfulPaint:642,
                                      maxPotentialFID:203,
                                      observedLoad:330,
                                      firstMeaningfulPaint:370,
                                      observedCumulativeLayoutShift:0.0028944855967078186,
                                      observedSpeedIndex:711,
                                      observedSpeedIndexTs:1789260285891,
                                      observedTimeOriginTs:1789259574429,
                                      observedLargestContentfulPaint:857,
                                      cumulativeLayoutShift:0.0028944855967078186,
                                      observedFirstPaintTs:1789259857628,
                                      observedTraceEndTs:1789261300953,
                                      largestContentfulPaint:1085,
                                      observedTimeOrigin:0,
                                      speedIndex:578,
                                      observedTraceEnd:1727,
                                      observedDomContentLoadedTs:1789259825567,
                                      observedFirstPaint:283,
                                      totalBlockingTime:133,
                                      observedLastVisualChangeTs:1789260426429,
                                      observedFirstVisualChange:335,
                                      observedLargestContentfulPaintTs:1789260431554,
                                      estimatedInputLatency:13,
                                      observedLoadTs:1789259904916,
                                      observedLastVisualChange:852,
                                      firstCPUIdle:773,
                                      interactive:953,
                                      observedNavigationStartTs:1789259574429,
                                      observedNavigationStart:0,
                                      observedFirstMeaningfulPaintTs:1789260216895
                                    },
                                  ]
                                },
                              },
                            },
                            categories:{
                              "best-practices":{
                                id:"best-practices",
                                title:"Best Practices",
                                score:Math.floor(Math.random()*100)/100,
                              },
                              seo:{
                                id:"seo",
                                title:"SEO",
                                score:Math.floor(Math.random()*100)/100,
                              },
                              accessibility:{
                                id:"accessibility",
                                title:"Accessibility",
                                score:Math.floor(Math.random()*100)/100,
                              },
                              performance: {
                                id:"performance",
                                title:"Performance",
                                score:Math.floor(Math.random()*100)/100,
                              }
                            },
                          },
                          analysisUTCTimestamp:new Date().toISOString()
                        }
                      })
                    }
                }
              //Spotify api
                if (/^https:..api.spotify.com/.test(url)) {
                  //Get recently played tracks
                    if (/me.player.recently-played/.test(url)&&(options?.headers?.Authorization === "Bearer MOCKED_TOKEN_ACCESS")) {
                      console.debug(`metrics/compute/mocks > mocking spotify api result > ${url}`)
                      return ({
                          status:200,
                          data:{
                            items:[
                              {
                                track:{
                                  album:{
                                    album_type:"single",
                                    artists:[
                                      {
                                        name:"EGOIST",
                                        type:"artist",
                                      }
                                    ],
                                    images:[
                                      {
                                        height:640,
                                        url:"https://i.scdn.co/image/ab67616d0000b27366371d0ad05c3f402d9cb2ae",
                                        width:640
                                      },
                                      {
                                        height:300,
                                        url:"https://i.scdn.co/image/ab67616d00001e0266371d0ad05c3f402d9cb2ae",
                                        width:300
                                      },
                                      {
                                        height:64,
                                        url:"https://i.scdn.co/image/ab67616d0000485166371d0ad05c3f402d9cb2ae",
                                        width:64
                                      }
                                    ],
                                    name:"Fallen",
                                    release_date:"2014-11-19",
                                    type:"album",
                                  },
                                  artists:[
                                    {
                                      name:"EGOIST",
                                      type:"artist",
                                    }
                                  ],
                                  name:"Fallen",
                                  preview_url:"https://p.scdn.co/mp3-preview/f30eb6d1c55afa13ce754559a41ab683a1a76b02?cid=fa6ae353840041ee8af3bd1d21a66783",
                                  type:"track",
                                },
                                played_at:new Date().toISOString(),
                                context:{
                                  type:"album",
                                }
                              },
                            ],
                          }
                      })
                    }
                }
              //Twitter api
                if (/^https:..api.twitter.com/.test(url)) {
                  //Get user profile
                    if ((/users.by.username/.test(url))&&(options?.headers?.Authorization === "Bearer MOCKED_TOKEN")) {
                      console.debug(`metrics/compute/mocks > mocking twitter api result > ${url}`)
                      return ({
                          status:200,
                          data:{
                            data:{
                              profile_image_url:"https://pbs.twimg.com/profile_images/1338344493234286592/C_ujKIUa_normal.png",
                              name:"GitHub",
                              verified:true,
                              id:"13334762",
                              username:"github",
                            },
                          }
                      })
                    }
                  //Get recent tweets
                    if ((/tweets.search.recent/.test(url))&&(options?.headers?.Authorization === "Bearer MOCKED_TOKEN")) {
                      console.debug(`metrics/compute/mocks > mocking twitter api result > ${url}`)
                      return ({
                        status:200,
                        data:{
                          data:[
                            {
                              id:"1000000000000000001",
                              created_at:new Date().toISOString(),
                              entities:{
                                mentions:[
                                  {start:22, end:33, username:"lowlighter"},
                                ],
                              },
                              text:"Checkout metrics from @lowlighter ! #GitHub",
                            },
                            {
                              id:"1000000000000000000",
                              created_at:new Date().toISOString(),
                              text:"Hello world !",
                            }
                          ],
                          includes:{
                            users:[
                              {
                                id:"100000000000000000",
                                name:"lowlighter",
                                username:"lowlighter",
                              },
                            ]
                          },
                          meta:{
                            newest_id:"1000000000000000001",
                            oldest_id:"1000000000000000000",
                            result_count:2,
                            next_token:"xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
                          },
                        }
                      })
                    }
                }
              return target(...args)
            }
          })
      }

    //Return mocked elements
      return {graphql, rest}
  }

