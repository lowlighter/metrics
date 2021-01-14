(function () {
  //Load asset
    const cached = new Map()
    async function load(url) {
      if (!cached.has(url))
        cached.set(url, (await axios.get(url)).data)
      return cached.get(url)
    }
  //Distribution function
    function distribution(length) {
      let probability = 1
      const values = []
      for (let i = 0; i < length-1; i++) {
        const value = Math.random()*probability
        values.push(value)
        probability -= value
      }
      values.push(probability)
      return values.sort((a, b) => b - a)
    }
  //Placeholder function
    window.placeholder = async function (set) {
      //Load templates informations
        let {image, style, fonts, partials} = await load(`/.templates/${set.templates.selected}`)
        await Promise.all(partials.map(async partial => await load(`/.templates/${set.templates.selected}/partials/${partial}.ejs`)))
      //Trap includes
        image = image.replace(/<%-\s*await include[(](`.*?[.]ejs`)[)]\s*%>/g, (m, g) => `<%- await $include(${g}) %>`)
      //Faked data
        const options = set.plugins.options
        const data = {
          //Template elements
            style, fonts, errors:[],
            partials:new Set(partials),
          //Plural helper
            s(value, end = "") {
              return value !== 1 ? {y:"ies", "":"s"}[end] : end
            },
          //Formatter helper
            f(n, {sign = false} = {}) {
              for (const {u, v} of [{u:"b", v:10**9}, {u:"m", v:10**6}, {u:"k", v:10**3}])
                if (n/v >= 1)
                  return `${(sign)&&(n > 0) ? "+" : ""}${(n/v).toFixed(2).substr(0, 4).replace(/[.]0*$/, "")}${u}`
              return `${(sign)&&(n > 0) ? "+" : ""}${n}`
            },
          //Trap for includes
            async $include(path) {
              const partial = await load(`/.templates/${set.templates.selected}/${path}`)
              return await ejs.render(partial, data, {async:true, rmWhitespace:true})
            },
          //Meta-data
            meta:{version:set.version, author:"lowlighter"},
          //Animated
            animated:set.config.animated,
          //Config
            config:set.config,
          //Base elements
            base:set.plugins.enabled.base,
          //Computed elements
            computed: {
              commits:faker.random.number(10000),
              sponsorships:faker.random.number(10),
              licenses:{favorite:[""], used:{MIT:1}},
              token:{scopes:[]},
              repositories: {
                watchers:faker.random.number(1000),
                stargazers:faker.random.number(10000),
                issues_open:faker.random.number(1000),
                issues_closed:faker.random.number(1000),
                pr_open:faker.random.number(1000),
                pr_merged:faker.random.number(1000),
                forks:faker.random.number(1000),
                releases:faker.random.number(1000),
              },
              diskUsage:`${faker.random.float({min:1, max:999}).toFixed(1)}MB`,
              registration:`${faker.random.number({min:2, max:10})} years ago`,
              cakeday:false,
              calendar:new Array(14).fill(null).map(_ => ({color:faker.random.arrayElement(["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"])})),
              avatar:"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mOcOnfpfwAGfgLYttYINwAAAABJRU5ErkJggg=="
            },
          //User data
            user:{
              databaseId:faker.random.number(10000000),
              name:"(placeholder)",
              login:set.user||"metrics",
              createdAt:`${faker.date.past(10)}`,
              avatarUrl:set.avatar,
              websiteUrl:options["pagespeed.url"]||"(attached website)",
              isHireable:false,
              twitterUsername:options["tweets.user"]||"(attached Twitter account)",
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
              calendar:{contributionCalendar:{weeks:[]}},
              repositoriesContributedTo:{totalCount:faker.random.number(100)},
              followers:{totalCount:faker.random.number(1000)},
              following:{totalCount:faker.random.number(1000)},
              issueComments:{totalCount:faker.random.number(1000)},
              organizations:{totalCount:faker.random.number(10)}
            },
          //Plugins
            plugins:{
              //Tweets
                ...(set.plugins.enabled.tweets ? ({
                  tweets:{
                    username:options["tweets.user"]||"(attached Twitter account)",
                    profile:{
                      profile_image_url:faker.image.people(),
                      name:"",
                      verified:false,
                      id:faker.random.number(1000000).toString(),
                      username:options["tweets.user"]||"(attached Twitter account)",
                      profile_image:"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mOcOnfpfwAGfgLYttYINwAAAABJRU5ErkJggg==",
                    },
                    list:[
                      {
                        id:faker.random.number(100000000000000).toString(),
                        created_at:faker.date.recent(),
                        entities: {
                          mentions: [ { start: 22, end: 33, username: 'lowlighter' } ]
                        },
                        text: 'Checkout metrics from  <span class="mention">@lowlighter</span>  !  <span class="hashtag">#GitHub</span> ',
                        mentions: [ 'lowlighter' ]
                      },
                      ...new Array(Number(options["tweets.limit"])-1).fill(null).map(_ => ({
                        id:faker.random.number(100000000000000).toString(),
                        created_at:faker.date.recent(),
                        text:faker.lorem.paragraph(),
                        mentions:[]
                      })),
                    ]
                  }
                }) : null),
              //Lines
                ...(set.plugins.enabled.lines ? ({
                  lines:{
                    added:`${faker.random.number(100)}.${faker.random.number(9)}k`,
                    deleted:`${faker.random.number(100)}.${faker.random.number(9)}k`,
                  }
                }) : null),
              //Traffic
                ...(set.plugins.enabled.traffic ? ({
                  traffic:{
                    views:{
                      count:`${faker.random.number({min:10, max:100})}.${faker.random.number(9)}k`,
                      uniques:`${faker.random.number(10)}.${faker.random.number(9)}k`,
                    }
                  }
                }) : null),
              //Follow-up
                ...(set.plugins.enabled.followup ? ({
                  followup:{
                    issues:{get count() { return this.open + this.closed }, open:faker.random.number(1000), closed:faker.random.number(1000)},
                    pr:{get count() { return this.open + this.merged }, open:faker.random.number(1000), merged:faker.random.number(1000)},
                  }
                }) : null),
              //Gists
                ...(set.plugins.enabled.gists ? ({
                  gists:{
                    totalCount:faker.random.number(100),
                    stargazers:faker.random.number(1000),
                    forks:faker.random.number(100),
                    files:faker.random.number(100),
                    comments:faker.random.number(1000)
                  }
                }) : null),
              //Languages
                ...(set.plugins.enabled.languages ? ({
                  languages:{
                    get colors() { return Object.fromEntries(Object.entries(this.favorites).map(([key, {color}]) => [key, color])) },
                    total:faker.random.number(10000),
                    get stats() { return Object.fromEntries(Object.entries(this.favorites).map(([key, {value}]) => [key, value])) },
                    favorites:distribution(7).map((value, index, array) => ({name:faker.lorem.word(), color:faker.internet.color(), value, x:array.slice(0, index).reduce((a, b) => a + b, 0)}))
                  }
                }) : null),
              //Habits
                ...(set.plugins.enabled.habits ? ({
                  habits:{
                    facts:options["habits.facts"],
                    charts:options["habits.charts"],
                    commits:{
                      get hour() { return Object.keys(this.hours).filter(key => /^\d+$/.test(key)).map(key => [key, this.hours[key]]).sort((a, b) => b[1] - a[1]).shift()?.[0] },
                      hours:{
                        [faker.random.number(24)]:faker.random.number(10),
                        [faker.random.number(24)]:faker.random.number(10),
                        [faker.random.number(24)]:faker.random.number(10),
                        [faker.random.number(24)]:faker.random.number(10),
                        [faker.random.number(24)]:faker.random.number(10),
                        [faker.random.number(24)]:faker.random.number(10),
                        [faker.random.number(24)]:faker.random.number(10),
                        get max() { return Object.keys(this).filter(key => /^\d+$/.test(key)).map(key => [key, this[key]]).sort((a, b) => b[1] - a[1]).shift()?.[1] }
                      },
                      get day() { return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][Object.keys(this.days).filter(key => /^\d+$/.test(key)).map(key => [key, this.days[key]]).sort((a, b) => b[1] - a[1]).shift()?.[0]] },
                      days:{
                        "0":faker.random.number(10),
                        "1":faker.random.number(10),
                        "2":faker.random.number(10),
                        "3":faker.random.number(10),
                        "4":faker.random.number(10),
                        "5":faker.random.number(10),
                        "6":faker.random.number(10),
                        get max() { return Object.keys(this).filter(key => /^\d+$/.test(key)).map(key => [key, this[key]]).sort((a, b) => b[1] - a[1]).shift()?.[1] }
                      },
                    },
                    indents:{style:"spaces", spaces:1, tabs:0},
                    linguist:{
                      available:true,
                      get ordered() { return Object.entries(this.languages) },
                      get languages() { return Object.fromEntries(distribution(4).map(value => [faker.lorem.word(), value])) },
                    }
                  }
                }) : null),
              //People
                ...(set.plugins.enabled.people ? ({
                  people:{
                    types:options["people.types"].split(",").map(x => x.trim()),
                    size:options["people.size"],
                    followers:new Array(Number(options["people.limit"])).fill(null).map(_ => ({
                      login:faker.internet.userName(),
                      avatar:"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mOcOnfpfwAGfgLYttYINwAAAABJRU5ErkJggg==",
                    })),
                    following:new Array(Number(options["people.limit"])).fill(null).map(_ => ({
                      login:faker.internet.userName(),
                      avatar:"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mOcOnfpfwAGfgLYttYINwAAAABJRU5ErkJggg==",
                    }))
                  }
                }) : null),
              //Music
                ...(set.plugins.enabled.music ? ({
                  music:{
                    provider:"(music provider)",
                    mode:"Suggested tracks",
                    tracks:new Array(Number(options["music.limit"])).fill(null).map(_ => ({
                      name:faker.random.words(5),
                      artist:faker.random.words(),
                      artwork:"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mOcOnfpfwAGfgLYttYINwAAAABJRU5ErkJggg==",
                    }))
                  }
                }) : null),
              //Pagespeed
                ...(set.plugins.enabled.pagespeed ? ({
                  pagespeed:{
                    url:options["pagespeed.url"]||"(attached website url)",
                    detailed:options["pagespeed.detailed"]||false,
                    scores: [
                      {score:faker.random.float({max:1}), title:"Performance"},
                      {score:faker.random.float({max:1}), title:"Accessibility"},
                      {score:faker.random.float({max:1}), title:"Best Practices"},
                      {score:faker.random.float({max:1}), title:"SEO"}
                    ],
                    metrics:{
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
                    screenshot:options["pagespeed.screenshot"] ? "data:image/jpg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mOcOnfpfwAGfgLYttYINwAAAABJRU5ErkJggg==" : null
                  }
                }) : null),
              //Projects
                ...(set.plugins.enabled.projects ? ({
                  projects:{
                    totalCount:options["projects.limit"]+faker.random.number(10),
                    list:new Array(Number(options["projects.limit"])).fill(null).map(_ => ({
                      name:faker.lorem.sentence(),
                      updated:`${2+faker.date.recent(8)} days ago`,
                      progress:{enabled:true, todo:faker.random.number(50), doing:faker.random.number(50), done:faker.random.number(50), get total() { return this.todo + this.doing + this.done } }
                    }))
                  }
                }) : null),
              //Posts
                ...(set.plugins.enabled.posts ? ({
                  posts:{
                    source:options["posts.source"],
                    list:new Array(Number(options["posts.limit"])).fill(null).map(_ => ({
                      title:faker.lorem.sentence(),
                      date:faker.date.recent().toString().substring(4, 10).trim()
                    }))
                  }
                }) : null),
              //Topics
                ...(set.plugins.enabled.topics ? ({
                  topics:{
                    mode:options["topics.mode"],
                    list:new Array(Number(options["topics.limit"])||20).fill(null).map(_ => ({
                      name:faker.lorem.words(2),
                      description:faker.lorem.sentence(),
                      icon:"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mOcOnfpfwAGfgLYttYINwAAAABJRU5ErkJggg=="
                    }))
                  }
                }) : null),
              //Stars
                ...(set.plugins.enabled.stars ? ({
                  stars:{
                    repositories: [
                      {
                        starredAt:faker.date.recent(),
                        node: {
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
                          licenseInfo:{nickname:null, name:"MIT License"},
                          primaryLanguage:{color:"#f1e05a", name:"JavaScript"}
                        },
                        starred:"1 day ago"
                      },
                      ...new Array(Number(options["stars.limit"])-1).fill(null).map((_, i) => ({
                        starredAt:faker.date.recent(),
                        node: {
                          description:faker.lorem.sentence(),
                          forkCount:faker.random.number(100),
                          isFork:faker.random.boolean(),
                          issues:{
                            totalCount:faker.random.number(100),
                          },
                          nameWithOwner:`${faker.random.word()}/${faker.random.word()}`,
                          openGraphImageUrl:faker.internet.url(),
                          pullRequests:{
                            totalCount:faker.random.number(100),
                          },
                          stargazerCount:faker.random.number(10000),
                          licenseInfo:{nickname:null, name:"License"},
                          primaryLanguage:{color:faker.internet.color(), name:faker.lorem.word()}
                        },
                        starred:`${i+2} days ago`
                      })),
                    ]
                  }
                }) : null),
              //Stars
                ...(set.plugins.enabled.stargazers ? ({
                  get stargazers() {
                    const dates = []
                    let total = faker.random.number(1000)
                    const result = {
                      total:{
                        dates:{},
                        get max() { return Math.max(...dates.map(date => this.dates[date])) },
                        get min() { return Math.min(...dates.map(date => this.dates[date])) },
                      },
                      increments:{
                        dates:{},
                        get max() { return Math.max(...dates.map(date => this.dates[date])) },
                        get min() { return Math.min(...dates.map(date => this.dates[date])) },
                      },
                      months:["", "Jan.", "Feb.", "Mar.", "Apr.", "May", "June", "July", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."]
                    }
                    for (let d = -14; d <= 0; d++) {
                      const date = new Date(Date.now()-d*24*60*60*1000).toISOString().substring(0, 10)
                      dates.push(date)
                      result.total.dates[date] = (total += (result.increments.dates[date] = faker.random.number(100)))
                    }
                    return result
                  }
                }) : null),
              //Activity
                ...(set.plugins.enabled.activity ? ({
                  activity:{
                    events:new Array(Number(options["activity.limit"])).fill(null).map(_ => [
                      {
                        type:"push",
                        repo:`${faker.random.word()}/${faker.random.word()}`,
                        size:1,
                        branch:"master",
                        commits: [ { sha:faker.git.shortSha(), message:faker.lorem.sentence()} ]
                      },
                      {
                        type:"comment",
                        on:"commit",
                        repo:`${faker.random.word()}/${faker.random.word()}`,
                        content:faker.lorem.paragraph(),
                        user:set.user,
                        mobile:null,
                        number:faker.git.shortSha(),
                        title:"",
                      },
                      {
                        type:"comment",
                        on:"pr",
                        repo:`${faker.random.word()}/${faker.random.word()}`,
                        content:faker.lorem.sentence(),
                        user:set.user,
                        mobile:null,
                        number:faker.random.number(100),
                        title:faker.lorem.paragraph(),
                      },
                      {
                        type:"comment",
                        on:"issue",
                        repo:`${faker.random.word()}/${faker.random.word()}`,
                        content:faker.lorem.sentence(),
                        user:set.user,
                        mobile:null,
                        number:faker.random.number(100),
                        title:faker.lorem.paragraph(),
                      },
                      {
                        type:"issue",
                        repo:`${faker.random.word()}/${faker.random.word()}`,
                        action:faker.random.arrayElement(["opened", "closed", "reopened"]),
                        user:set.user,
                        number:faker.random.number(100),
                        title:faker.lorem.paragraph(),
                      },
                      {
                        type:"pr",
                        repo:`${faker.random.word()}/${faker.random.word()}`,
                        action:faker.random.arrayElement(["opened", "closed"]),
                        user:set.user,
                        number:faker.random.number(100),
                        title:faker.lorem.paragraph(),
                        lines:{added:faker.random.number(1000), deleted:faker.random.number(1000)}, files:{changed:faker.random.number(10)}
                      },
                      {
                        type:"wiki",
                        repo:`${faker.random.word()}/${faker.random.word()}`,
                        pages:[faker.lorem.sentence(), faker.lorem.sentence()]
                      },
                      {
                        type:"fork",
                        repo:`${faker.random.word()}/${faker.random.word()}`,
                      },
                      {
                        type:"review",
                        repo:`${faker.random.word()}/${faker.random.word()}`,
                        user:set.user,
                        number:faker.random.number(100),
                        title:faker.lorem.paragraph(),
                      },
                      {
                        type:"release",
                        repo:`${faker.random.word()}/${faker.random.word()}`,
                        action:"published",
                        name:faker.random.words(4),
                        draft:faker.random.boolean(),
                        prerelease:faker.random.boolean(),
                      },
                      {
                        type:"ref/create",
                        repo:`${faker.random.word()}/${faker.random.word()}`,
                        ref:{name:faker.lorem.slug(), type:faker.random.arrayElement(["tag", "branch"]),}
                      },
                      {
                        type:"ref/delete",
                        repo:`${faker.random.word()}/${faker.random.word()}`,
                        ref:{name:faker.lorem.slug(), type:faker.random.arrayElement(["tag", "branch"]),}
                      },
                      {
                        type:"member",
                        repo:`${faker.random.word()}/${faker.random.word()}`,
                        user:set.user
                      },
                      {
                        type:"public",
                        repo:`${faker.random.word()}/${faker.random.word()}`,
                      },
                      {
                        type:"star",
                        repo:`${faker.random.word()}/${faker.random.word()}`,
                        action:"started"
                      },
                    ][Math.floor(Math.random()*15)])
                  }
                }) : null),
              //Isocalendar
                ...(set.plugins.enabled.isocalendar ? ({
                  isocalendar:{
                    streak:{max:30+faker.random.number(20), current:faker.random.number(30)},
                    max:10+faker.random.number(40),
                    average:faker.random.float(10),
                    svg:"(isometric calendar is not displayed in placeholder)",
                    duration:options["isocalendar.duration"]
                  }
                }) : null),
            },
        }
      //Render
        return await ejs.render(image, data, {async:true, rmWhitespace:true})
    }
})()
