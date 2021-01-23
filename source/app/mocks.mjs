//Imports
  import axios from "axios"
  import urls from "url"
  import faker from "faker"

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
              const login = query.match(/login: "(?<login>.*?)"/)?.groups?.login ?? faker.internet.userName()

            //Common query
              if (/^query Metrics /.test(query)) {
                console.debug(`metrics/compute/mocks > mocking graphql api result > Metrics`)
                return ({
                  user: {
                    databaseId:faker.random.number(10000000),
                    name:faker.name.findName(),
                    login,
                    createdAt:`${faker.date.past(10)}`,
                    avatarUrl:faker.image.people(),
                    websiteUrl:faker.internet.url(),
                    isHireable:faker.random.boolean(),
                    twitterUsername:login,
                    repositories:{totalCount:faker.random.number(100), totalDiskUsage:faker.random.number(100000), nodes:[]},
                    packages:{totalCount:faker.random.number(10)},
                    starredRepositories:{totalCount:faker.random.number(1000)},
                    watching:{totalCount:faker.random.number(100)},
                    sponsorshipsAsSponsor:{totalCount:faker.random.number(10)},
                    sponsorshipsAsMaintainer:{totalCount:faker.random.number(10)},
                    contributionsCollection:{
                      totalRepositoriesWithContributedCommits:faker.random.number(100),
                      totalCommitContributions:faker.random.number(10000),
                      restrictedContributionsCount:faker.random.number(10000),
                      totalIssueContributions:faker.random.number(100),
                      totalPullRequestContributions:faker.random.number(1000),
                      totalPullRequestReviewContributions:faker.random.number(1000),
                    },
                    calendar:{
                      contributionCalendar:{
                        weeks:[
                          {
                            contributionDays:[
                              {color:faker.random.arrayElement(["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"])},
                              {color:faker.random.arrayElement(["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"])},
                              {color:faker.random.arrayElement(["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"])},
                              {color:faker.random.arrayElement(["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"])},
                              {color:faker.random.arrayElement(["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"])},
                            ]
                          },
                          {
                            contributionDays:[
                              {color:faker.random.arrayElement(["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"])},
                              {color:faker.random.arrayElement(["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"])},
                              {color:faker.random.arrayElement(["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"])},
                              {color:faker.random.arrayElement(["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"])},
                              {color:faker.random.arrayElement(["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"])},
                              {color:faker.random.arrayElement(["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"])},
                              {color:faker.random.arrayElement(["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"])},
                            ]
                          },
                          {
                            contributionDays:[
                              {color:faker.random.arrayElement(["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"])},
                              {color:faker.random.arrayElement(["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"])},
                              {color:faker.random.arrayElement(["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"])},
                            ]
                          }
                        ]
                      }
                    },
                    repositoriesContributedTo:{totalCount:faker.random.number(100)},
                    followers:{totalCount:faker.random.number(1000)},
                    following:{totalCount:faker.random.number(1000)},
                    issueComments:{totalCount:faker.random.number(1000)},
                    organizations:{totalCount:faker.random.number(10)}
                  }
                })
              }
            //Repositories query
              if (/^query Repositories /.test(query)) {
                console.debug(`metrics/compute/mocks > mocking graphql api result > Repositories`)
                return /after: "MOCKED_CURSOR"/m.test(query) ? ({
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
                          cursor:"MOCKED_CURSOR"
                        },
                      ],
                      nodes:[
                        {
                          name:faker.random.words(),
                          watchers:{totalCount:faker.random.number(1000)},
                          stargazers:{totalCount:faker.random.number(10000)},
                          owner:{login},
                          languages:{
                            edges:[
                              {size:faker.random.number(100000), node:{color:faker.internet.color(), name:faker.lorem.word()}},
                              {size:faker.random.number(100000), node:{color:faker.internet.color(), name:faker.lorem.word()}},
                              {size:faker.random.number(100000), node:{color:faker.internet.color(), name:faker.lorem.word()}},
                              {size:faker.random.number(100000), node:{color:faker.internet.color(), name:faker.lorem.word()}},
                              {size:faker.random.number(100000), node:{color:faker.internet.color(), name:faker.lorem.word()}},
                              {size:faker.random.number(100000), node:{color:faker.internet.color(), name:faker.lorem.word()}},
                              {size:faker.random.number(100000), node:{color:faker.internet.color(), name:faker.lorem.word()}},
                            ]
                          },
                          issues_open:{totalCount:faker.random.number(100)},
                          issues_closed:{totalCount:faker.random.number(100)},
                          pr_open:{totalCount:faker.random.number(100)},
                          pr_merged:{totalCount:faker.random.number(100)},
                          releases:{totalCount:faker.random.number(100)},
                          forkCount:faker.random.number(100),
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
                      owner:{login},
                      createdAt:new Date().toISOString(),
                      diskUsage:Math.floor(Math.random()*10000),
                      homepageUrl:faker.internet.url(),
                      watchers:{totalCount:faker.random.number(1000)},
                      stargazers:{totalCount:faker.random.number(10000)},
                      languages:{
                        edges:[
                          {size:faker.random.number(100000), node:{color:faker.internet.color(), name:faker.lorem.word()}},
                          {size:faker.random.number(100000), node:{color:faker.internet.color(), name:faker.lorem.word()}},
                          {size:faker.random.number(100000), node:{color:faker.internet.color(), name:faker.lorem.word()}},
                          {size:faker.random.number(100000), node:{color:faker.internet.color(), name:faker.lorem.word()}},
                          {size:faker.random.number(100000), node:{color:faker.internet.color(), name:faker.lorem.word()}},
                          {size:faker.random.number(100000), node:{color:faker.internet.color(), name:faker.lorem.word()}},
                          {size:faker.random.number(100000), node:{color:faker.internet.color(), name:faker.lorem.word()}},
                        ]
                      },
                      issues_open:{totalCount:faker.random.number(100)},
                      issues_closed:{totalCount:faker.random.number(100)},
                      pr_open:{totalCount:faker.random.number(100)},
                      pr_merged:{totalCount:faker.random.number(100)},
                      releases:{totalCount:faker.random.number(100)},
                      forkCount:faker.random.number(100),
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
                      const contributionCount = Math.min(10, Math.max(0, faker.random.number(14)-4))
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
                return /after: "MOCKED_CURSOR"/m.test(query) ? ({
                  user:{
                    gists:{
                      edges:[],
                      nodes:[],
                    }
                  }
                }) : ({
                  user:{
                    gists:{
                      edges:[
                        {
                          cursor:"MOCKED_CURSOR"
                        },
                      ],
                      totalCount:faker.random.number(100),
                      nodes:[
                        {
                          stargazerCount:faker.random.number(10),
                          isFork:false,
                          forks:{totalCount:faker.random.number(10)},
                          files:[{name:faker.system.fileName()}],
                          comments:{totalCount:faker.random.number(10)}
                        },
                        {
                          stargazerCount:faker.random.number(10),
                          isFork:false,
                          forks:{totalCount:faker.random.number(10)},
                          files:[{name:faker.system.fileName()}],
                          comments:{totalCount:faker.random.number(10)}
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
                          updatedAt:`${faker.date.recent()}`,
                          progress:{
                            doneCount:faker.random.number(10),
                            inProgressCount:faker.random.number(10),
                            todoCount:faker.random.number(10),
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
                        updatedAt:`${faker.date.recent()}`,
                        progress:{
                          doneCount:faker.random.number(10),
                          inProgressCount:faker.random.number(10),
                          todoCount:faker.random.number(10),
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
                          starredAt:`${faker.date.recent(14)}`,
                          node:{
                            description:"📊 An image generator with 20+ metrics about your GitHub account such as activity, community, repositories, coding habits, website performances, music played, starred topics, etc. that you can put on your profile or elsewhere !",
                            forkCount:faker.random.number(100),
                            isFork:false,
                            issues:{
                              totalCount:faker.random.number(100),
                            },
                            nameWithOwner:"lowlighter/metrics",
                            openGraphImageUrl:"https://repository-images.githubusercontent.com/293860197/7fd72080-496d-11eb-8fe0-238b38a0746a",
                            pullRequests:{
                              totalCount:faker.random.number(100),
                            },
                            stargazerCount:faker.random.number(10000),
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
                return /after: "MOCKED_CURSOR"/m.test(query) ? ({
                  repository:{
                    stargazers:{
                      edges:[],
                    }
                  }
                }) : ({
                  repository:{
                    stargazers:{
                      edges:new Array(faker.random.number({min:50, max:100})).fill(null).map(() => ({
                        starredAt:`${faker.date.recent(30)}`,
                        cursor:"MOCKED_CURSOR"
                      }))
                    }
                  }
                })
              }
            //People query
              if (/^query People /.test(query)) {
                console.debug(`metrics/compute/mocks > mocking graphql api result > People`)
                const type = query.match(/(?<type>followers|following)[(]/)?.groups?.type ?? "(unknown type)"
                return /after: "MOCKED_CURSOR"/m.test(query) ? ({
                  user:{
                    [type]:{
                      edges:[],
                    }
                  }
                }) : ({
                  user:{
                    [type]:{
                      edges:new Array(Math.ceil(20+80*Math.random())).fill(undefined).map((login = faker.internet.userName()) => ({
                        cursor:"MOCKED_CURSOR",
                        node:{
                          login,
                          avatarUrl:null,
                        }
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
                    status:200,
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
                if (/^https:..api.github.com.repos.lowlighter.metrics.commits.MOCKED_SHA/.test(url)) {
                  console.debug(`metrics/compute/mocks > mocking rest api result > rest.request ${url}`)
                  return ({
                    status:200,
                    url:"https://api.github.com/repos/lowlighter/metrics/commits/MOCKED_SHA",
                    data:{
                      sha:"MOCKED_SHA",
                      commit:{
                        author:{
                          name:faker.internet.userName(),
                          email:faker.internet.email(),
                          date:`${faker.date.recent(7)}`,
                        },
                        committer:{
                          name:faker.internet.userName(),
                          email:faker.internet.email(),
                          date:`${faker.date.recent(7)}`,
                        },
                      },
                      author:{
                        login:faker.internet.userName(),
                        id:faker.random.number(100000000),
                      },
                      committer:{
                        login:faker.internet.userName(),
                        id:faker.random.number(100000000),
                      },
                      files: [
                        {
                          sha:"MOCKED_SHA",
                          filename:faker.system.fileName(),
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
                status:200,
                url:"https://api.github.com/rate_limit",
                headers:{
                  server:"GitHub.com",
                  status:"200 OK",
                  "x-oauth-scopes":"repo",
                },
                data:{
                  resources:{
                    core:{limit:5000, used:0, remaining:5000, reset:0},
                    search:{limit:30, used:0, remaining:30, reset:0},
                    graphql:{limit:5000, used:0, remaining:5000, reset:0},
                    integration_manifest:{limit:5000, used:0, remaining:5000, reset:0},
                    source_import:{limit:100, used:0, remaining:100, reset:0},
                    code_scanning_upload:{limit:500, used:0, remaining:500, reset:0},
                  },
                  rate:{limit:5000, used:0, remaining:"MOCKED", reset:0}
                }
              })
            }
          })

        //Events list
          rest.activity.listEventsForAuthenticatedUser = new Proxy(unmocked.listEventsForAuthenticatedUser, {
            apply:function(target, that, [{username:login, page, per_page}]) {
              console.debug(`metrics/compute/mocks > mocking rest api result > rest.activity.listEventsForAuthenticatedUser`)
              return ({
                status:200,
                url:`https://api.github.com/users/${login}/events?per_page=${per_page}&page=${page}`,
                headers:{
                  server:"GitHub.com",
                  status:"200 OK",
                  "x-oauth-scopes":"repo",
                },
                data:page < 1 ? [] : [
                  {
                    id:"10000000000",
                    type:"CommitCommentEvent",
                    actor:{
                      login,
                    },
                    repo:{
                      name:`${faker.random.word()}/${faker.random.word()}`,
                    },
                    payload:{
                      comment:{
                        user:{
                          login,
                        },
                        path:faker.system.fileName(),
                        commit_id:"MOCKED_SHA",
                        body:faker.lorem.sentence(),
                      }
                    },
                    created_at:faker.date.recent(7),
                  },
                  {
                    id:"10000000001",
                    type:"PullRequestReviewCommentEvent",
                    actor:{
                      login,
                    },
                    repo:{
                      name:`${faker.random.word()}/${faker.random.word()}`,
                    },
                    payload:{
                      action:"created",
                      comment:{
                        user:{
                          login,
                        },
                        body:faker.lorem.paragraph(),
                      },
                      pull_request:{
                        title:faker.lorem.sentence(),
                        number:1,
                        user:{
                          login:faker.internet.userName(),
                        },
                        body:"",
                      }
                    },
                    created_at:faker.date.recent(7),
                  },
                  {
                    id:"10000000002",
                    type:"IssuesEvent",
                    actor:{
                      login,
                    },
                    repo:{
                      name:`${faker.random.word()}/${faker.random.word()}`,
                    },
                    payload:{
                      action:faker.random.arrayElement(["opened", "closed", "reopened"]),
                      issue:{
                        number:2,
                        title:faker.lorem.sentence(),
                        user:{
                          login,
                        },
                        body:faker.lorem.paragraph(),
                        performed_via_github_app:null
                      }
                    },
                    created_at:faker.date.recent(7),
                  },
                  {
                    id:"10000000003",
                    type:"GollumEvent",
                    actor:{
                      login,
                    },
                    repo:{
                      name:`${faker.random.word()}/${faker.random.word()}`,
                    },
                    payload:{
                      pages:[
                        {
                          page_name:faker.lorem.sentence(),
                          title:faker.lorem.sentence(),
                          summary:null,
                          action:"created",
                          sha:"MOCKED_SHA",
                        }
                      ]
                    },
                    created_at:faker.date.recent(7),
                  },
                  {
                    id:"10000000004",
                    type:"IssueCommentEvent",
                    actor:{
                      login,
                    },
                    repo:{
                      name:`${faker.random.word()}/${faker.random.word()}`,
                    },
                    payload:{
                      action:"created",
                      issue:{
                        number:3,
                        title:faker.lorem.sentence(),
                        user:{
                          login,
                        },
                        labels:[
                          {
                            name:"lorem ipsum",
                            color:"d876e3",
                          }
                        ],
                        state:"open",
                      },
                      comment:{
                        body:faker.lorem.paragraph(),
                        performed_via_github_app:null
                      }
                    },
                    created_at:faker.date.recent(7),
                  },
                  {
                    id:"10000000005",
                    type:"ForkEvent",
                    actor:{
                      login,
                    },
                    repo:{
                      name:`${faker.random.word()}/${faker.random.word()}`,
                    },
                    payload:{
                      forkee:{
                        name:faker.random.word(),
                        full_name:`${faker.random.word()}/${faker.random.word()}`,
                      }
                    },
                    created_at:faker.date.recent(7),
                  },
                  {
                    id:"10000000006",
                    type:"PullRequestReviewEvent",
                    actor:{
                      login,
                    },
                    repo:{
                      name:`${faker.random.word()}/${faker.random.word()}`,
                    },
                    payload:{
                      action:"created",
                      review:{
                        user:{
                          login,
                        },
                        state:"approved",
                      },
                      pull_request:{
                        state:"open",
                        number:4,
                        locked:false,
                        title:faker.lorem.sentence(),
                        user:{
                          login:faker.internet.userName(),
                        },
                      }
                    },
                    created_at:faker.date.recent(7),
                  },
                  {
                    id:"10000000007",
                    type:"ReleaseEvent",
                    actor:{
                      login,
                    },
                    repo:{
                      name:`${faker.random.word()}/${faker.random.word()}`,
                    },
                    payload:{
                      action:"published",
                      release:{
                        tag_name:`v${faker.random.number()}.${faker.random.number()}`,
                        name:faker.random.words(4),
                        draft:faker.random.boolean(),
                        prerelease:faker.random.boolean(),
                      }
                    },
                    created_at:faker.date.recent(7),
                  },
                  {
                    id:"10000000008",
                    type:"CreateEvent",
                    actor:{
                      login,
                    },
                    repo:{
                      name:`${faker.random.word()}/${faker.random.word()}`,
                    },
                    payload:{
                      ref:faker.lorem.slug(),
                      ref_type:faker.random.arrayElement(["tag", "branch"]),
                      master_branch:"master",
                    },
                    created_at:faker.date.recent(7),
                  },
                  {
                    id:"100000000009",
                    type:"WatchEvent",
                    actor:{
                      login,
                    },
                    repo:{
                      name:"lowlighter/metrics",
                    },
                    payload:{action:"started"},
                    created_at:faker.date.recent(7),
                  },
                  {
                    id:"10000000010",
                    type:"DeleteEvent",
                    actor:{
                      login,
                    },
                    repo:{
                      name:`${faker.random.word()}/${faker.random.word()}`,
                    },
                    payload:{
                      ref:faker.lorem.slug(),
                      ref_type:faker.random.arrayElement(["tag", "branch"]),
                    },
                    created_at:faker.date.recent(7),
                  },
                  {
                    id:"10000000011",
                    type:"PushEvent",
                    actor:{
                      login,
                    },
                    repo:{
                      name:`${faker.random.word()}/${faker.random.word()}`,
                    },
                    payload:{
                      size:1,
                      ref:"refs/heads/master",
                      commits:[
                        {
                          sha:"MOCKED_SHA",
                          message:faker.lorem.sentence(),
                        }
                      ]
                    },
                    created_at:faker.date.recent(7),
                  },
                  {
                    id:"10000000012",
                    type:"PullRequestEvent",
                    actor:{
                      login,
                    },
                    repo:{
                      name:`${faker.random.word()}/${faker.random.word()}`,
                    },
                    payload:{
                      action:faker.random.arrayElement(["opened", "closed"]),
                      number:5,
                      pull_request:{
                        user:{
                          login,
                        },
                        state:"open",
                        title:faker.lorem.sentence(),
                        additions:faker.random.number(1000),
                        deletions:faker.random.number(1000),
                        changed_files:faker.random.number(10),
                      }
                    },
                    created_at:faker.date.recent(7),
                  },
                  {
                    id:"10000000013",
                    type:"MemberEvent",
                    actor:{
                      login,
                    },
                    repo:{
                      name:`${faker.random.word()}/${faker.random.word()}`,
                    },
                    payload:{
                      member:{
                        login:faker.internet.userName(),
                      },
                      action:"added"
                    },
                    created_at:faker.date.recent(7),
                  },
                  {
                    id:"10000000014",
                    type:"PublicEvent",
                    actor:{
                      login,
                    },
                    repo:{
                      name:`${faker.random.word()}/${faker.random.word()}`,
                    },
                    payload:{},
                    created_at:faker.date.recent(7),
                  }
                ]
              })
            }
          })

        //Repository traffic
          rest.repos.getViews = new Proxy(unmocked.getViews, {
            apply:function(target, that, [{owner, repo}]) {
              console.debug(`metrics/compute/mocks > mocking rest api result > rest.repos.getViews`)
              const count = faker.random.number(10000)*2
              const uniques = faker.random.number(count)*2
              return ({
                status:200,
                url:`https://api.github.com/repos/${owner}/${repo}/traffic/views`,
                headers:{
                  server:"GitHub.com",
                  status:"200 OK",
                  "x-oauth-scopes":"repo",
                },
                data:{
                  count,
                  uniques,
                  views:[
                    {timestamp:`${faker.date.recent()}`, count:count/2, uniques:uniques/2},
                    {timestamp:`${faker.date.recent()}`, count:count/2, uniques:uniques/2},
                  ]
                }
              })
            }
          })

        //Repository contributions
          rest.repos.getContributorsStats = new Proxy(unmocked.getContributorsStats, {
            apply:function(target, that, [{owner, repo}]) {
              console.debug(`metrics/compute/mocks > mocking rest api result > rest.repos.getContributorsStats`)
              return ({
                status:200,
                url:`https://api.github.com/repos/${owner}/${repo}/stats/contributors`,
                headers:{
                  server:"GitHub.com",
                  status:"200 OK",
                  "x-oauth-scopes":"repo",
                },
                data:[
                  {
                    total:faker.random.number(10000),
                    weeks:[
                      {w:1, a:faker.random.number(10000), d:faker.random.number(10000), c:faker.random.number(10000)},
                      {w:2, a:faker.random.number(10000), d:faker.random.number(10000), c:faker.random.number(10000)},
                      {w:3, a:faker.random.number(10000), d:faker.random.number(10000), c:faker.random.number(10000)},
                      {w:4, a:faker.random.number(10000), d:faker.random.number(10000), c:faker.random.number(10000)},
                    ],
                    author: {
                      login:owner,
                    }
                  }
                ]
              })
            }
          })

        //Repository contributions
          rest.repos.listCommits = new Proxy(unmocked.listCommits, {
            apply:function(target, that, [{page, per_page, owner, repo}]) {
              console.debug(`metrics/compute/mocks > mocking rest api result > rest.repos.listCommits`)
              return ({
                status:200,
                url:`https://api.github.com/repos/${owner}/${repo}/commits?per_page=${per_page}&page=${page}`,
                headers: {
                  server:"GitHub.com",
                  status:"200 OK",
                  "x-oauth-scopes":"repo",
                },
                data:page < 2 ? new Array(per_page).fill(null).map(() =>
                  ({
                    sha:"MOCKED_SHA",
                    commit:{
                      author:{
                        name:owner,
                        date:`${faker.date.recent(14)}`
                      },
                      committer:{
                        name:owner,
                        date:`${faker.date.recent(14)}`
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
                const tested = url.match(/&url=(?<tested>.*?)(?:&|$)/)?.groups?.tested ?? faker.internet.url()
              //Pagespeed api
                if (/^https:..www.googleapis.com.pagespeedonline.v5/.test(url)) {
                  //Pagespeed result
                    if (/v5.runPagespeed.*&key=MOCKED_TOKEN/.test(url)) {
                      console.debug(`metrics/compute/mocks > mocking pagespeed api result > ${url}`)
                      return ({
                        status:200,
                        data:{
                          captchaResult:"CAPTCHA_NOT_NEEDED",
                          id:tested,
                          lighthouseResult:{
                            requestedUrl:tested,
                            finalUrl:tested,
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
                                      observedFirstContentfulPaint:faker.random.number(500),
                                      observedFirstVisualChangeTs:faker.time.recent(),
                                      observedFirstContentfulPaintTs:faker.time.recent(),
                                      firstContentfulPaint:faker.random.number(500),
                                      observedDomContentLoaded:faker.random.number(500),
                                      observedFirstMeaningfulPaint:faker.random.number(1000),
                                      maxPotentialFID:faker.random.number(500),
                                      observedLoad:faker.random.number(500),
                                      firstMeaningfulPaint:faker.random.number(500),
                                      observedCumulativeLayoutShift:faker.random.float({max:1}),
                                      observedSpeedIndex:faker.random.number(1000),
                                      observedSpeedIndexTs:faker.time.recent(),
                                      observedTimeOriginTs:faker.time.recent(),
                                      observedLargestContentfulPaint:faker.random.number(1000),
                                      cumulativeLayoutShift:faker.random.float({max:1}),
                                      observedFirstPaintTs:faker.time.recent(),
                                      observedTraceEndTs:faker.time.recent(),
                                      largestContentfulPaint:faker.random.number(2000),
                                      observedTimeOrigin:faker.random.number(10),
                                      speedIndex:faker.random.number(1000),
                                      observedTraceEnd:faker.random.number(2000),
                                      observedDomContentLoadedTs:faker.time.recent(),
                                      observedFirstPaint:faker.random.number(500),
                                      totalBlockingTime:faker.random.number(500),
                                      observedLastVisualChangeTs:faker.time.recent(),
                                      observedFirstVisualChange:faker.random.number(500),
                                      observedLargestContentfulPaintTs:faker.time.recent(),
                                      estimatedInputLatency:faker.random.number(100),
                                      observedLoadTs:faker.time.recent(),
                                      observedLastVisualChange:faker.random.number(1000),
                                      firstCPUIdle:faker.random.number(1000),
                                      interactive:faker.random.number(1000),
                                      observedNavigationStartTs:faker.time.recent(),
                                      observedNavigationStart:faker.random.number(10),
                                      observedFirstMeaningfulPaintTs:faker.time.recent()
                                    },
                                  ]
                                },
                              },
                            },
                            categories:{
                              "best-practices":{
                                id:"best-practices",
                                title:"Best Practices",
                                score:faker.random.float({max:1}),
                              },
                              seo:{
                                id:"seo",
                                title:"SEO",
                                score:faker.random.float({max:1}),
                              },
                              accessibility:{
                                id:"accessibility",
                                title:"Accessibility",
                                score:faker.random.float({max:1}),
                              },
                              performance: {
                                id:"performance",
                                title:"Performance",
                                score:faker.random.float({max:1}),
                              }
                            },
                          },
                          analysisUTCTimestamp:`${faker.date.recent()}`,
                        }
                      })
                    }
                }
              //Spotify api
                if (/^https:..api.spotify.com/.test(url)) {
                  //Get recently played tracks
                    if (/me.player.recently-played/.test(url)&&(options?.headers?.Authorization === "Bearer MOCKED_TOKEN_ACCESS")) {
                      console.debug(`metrics/compute/mocks > mocking spotify api result > ${url}`)
                      const artist = faker.random.words()
                      const track = faker.random.words(5)
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
                                        name:artist,
                                        type:"artist",
                                      }
                                    ],
                                    images:[
                                      {
                                        height:640,
                                        url:faker.image.abstract(),
                                        width:640
                                      },
                                      {
                                        height:300,
                                        url:faker.image.abstract(),
                                        width:300
                                      },
                                      {
                                        height:64,
                                        url:faker.image.abstract(),
                                        width:64
                                      }
                                    ],
                                    name:track,
                                    release_date:`${faker.date.past()}`.substring(0, 10),
                                    type:"album",
                                  },
                                  artists:[
                                    {
                                      name:artist,
                                      type:"artist",
                                    }
                                  ],
                                  name:track,
                                  preview_url:faker.internet.url(),
                                  type:"track",
                                },
                                played_at:`${faker.date.recent()}`,
                                context:{
                                  type:"album",
                                }
                              },
                            ],
                          }
                      })
                    }
                }
              //Last.fm api
                if (/^https:..ws.audioscrobbler.com/.test(url)) {
                  //Get recently played tracks
                    if (/user.getrecenttracks/.test(url)) {
                      console.debug(`metrics/compute/mocks > mocking lastfm api result > ${url}`)
                      const artist = faker.random.word()
                      const album = faker.random.words(3)
                      const track = faker.random.words(5)
                      const date = faker.date.recent()
                      return ({
                          status:200,
                          data:{
                            recenttracks:{
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
                                    "#text":artist,
                                  },
                                  album:{
                                    mbid:"",
                                    "#text":album,
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
                                  streamable:"0",
                                  date:{
                                    uts:Math.floor(date.getTime() / 1000),
                                    "#text":date.toUTCString().slice(5, 22),
                                  },
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
              //Twitter api
                if (/^https:..api.twitter.com/.test(url)) {
                  //Get user profile
                    if ((/users.by.username/.test(url))&&(options?.headers?.Authorization === "Bearer MOCKED_TOKEN")) {
                      console.debug(`metrics/compute/mocks > mocking twitter api result > ${url}`)
                      const username = url.match(/username[/](?<username>.*?)[?]/)?.groups?.username ?? faker.internet.userName()
                      return ({
                          status:200,
                          data:{
                            data:{
                              profile_image_url:faker.image.people(),
                              name:faker.name.findName(),
                              verified:faker.random.boolean(),
                              id:faker.random.number(1000000).toString(),
                              username,
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
                              id:faker.random.number(100000000000000).toString(),
                              created_at:`${faker.date.recent()}`,
                              entities:{
                                mentions:[
                                  {start:22, end:33, username:"lowlighter"},
                                ],
                              },
                              text:"Checkout metrics from @lowlighter ! #GitHub",
                            },
                            {
                              id:faker.random.number(100000000000000).toString(),
                              created_at:`${faker.date.recent()}`,
                              text:faker.lorem.paragraph(),
                            }
                          ],
                          includes:{
                            users:[
                              {
                                id:faker.random.number(100000000000000).toString(),
                                name:"lowlighter",
                                username:"lowlighter",
                              },
                            ]
                          },
                          meta:{
                            newest_id:faker.random.number(100000000000000).toString(),
                            oldest_id:faker.random.number(100000000000000).toString(),
                            result_count:2,
                            next_token:"MOCKED_CURSOR",
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

