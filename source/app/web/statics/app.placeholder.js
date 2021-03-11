(function ({axios, faker, ejs} = {axios:globalThis.axios, faker:globalThis.faker, ejs:globalThis.ejs}) {
  //Load assets
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
    globalThis.placeholder = async function (set) {
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
            partials:new Set([...(set.config.order||"").split(",").map(x => x.trim()).filter(x => partials.includes(x)), ...partials]),
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
            animated:false,
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
              avatar:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mOcOnfpfwAGfgLYttYINwAAAABJRU5ErkJggg=="
            },
          //User data
            account:"user",
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
                      profile_image:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mOcOnfpfwAGfgLYttYINwAAAABJRU5ErkJggg==",
                    },
                    list:[
                      {
                        id:faker.random.number(100000000000000).toString(),
                        created_at:faker.date.recent(),
                        entities: {
                          mentions: [ {start:22, end:33, username:"lowlighter"} ]
                        },
                        text: 'Checkout metrics from  <span class="mention">@lowlighter</span>  !  <span class="hashtag">#GitHub</span> ',
                        mentions: ["lowlighter"]
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
              //Reactions
                ...(set.plugins.enabled.reactions ? ({
                  reactions:{
                    list:{
                      HEART:{value:faker.random.number(100), get percentage() { return this.score }, score:faker.random.number(100)/100},
                      THUMBS_UP:{value:faker.random.number(100), get percentage() { return this.score }, score:faker.random.number(100)/100},
                      THUMBS_DOWN:{value:faker.random.number(100), get percentage() { return this.score }, score:faker.random.number(100)/100},
                      LAUGH:{value:faker.random.number(100), get percentage() { return this.score }, score:faker.random.number(100)/100},
                      CONFUSED:{value:faker.random.number(100), get percentage() { return this.score }, score:faker.random.number(100)/100},
                      EYES:{value:faker.random.number(100), get percentage() { return this.score }, score:faker.random.number(100)/100},
                      ROCKET:{value:faker.random.number(100), get percentage() { return this.score }, score:faker.random.number(100)/100},
                      HOORAY:{value:faker.random.number(100), get percentage() { return this.score }, score:faker.random.number(100)/100},
                    },
                    comments:options["reactions.limit"],
                    details:options["reactions.details"],
                    days:options["reactions.days"]
                  }
                }) : null),
              //Introduction
                ...(set.plugins.enabled.introduction ? ({
                  introduction:{
                    mode:"user",
                    title:options["introduction.title"],
                    text:faker.lorem.sentences(),
                  }
                }) : null),
              //Languages
                ...(set.plugins.enabled.languages ? ({
                  languages:{
                    details:options["languages.details"].split(",").map(x => x.trim()).filter(x => x),
                    get colors() { return Object.fromEntries(Object.entries(this.favorites).map(([key, {color}]) => [key, color])) },
                    total:faker.random.number(10000),
                    get stats() { return Object.fromEntries(Object.entries(this.favorites).map(([key, {value}]) => [key, value])) },
                    favorites:distribution(7).map((value, index, array) => ({name:faker.lorem.word(), color:faker.internet.color(), value, size:faker.random.number(1000000), x:array.slice(0, index).reduce((a, b) => a + b, 0)}))
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
                  get people() {
                    const types = options["people.types"].split(",").map(x => x.trim())
                      .map(x => ({followed:"following", sponsors:"sponsorshipsAsMaintainer", sponsored:"sponsorshipsAsSponsor", sponsoring:"sponsorshipsAsSponsor"})[x] ?? x)
                      .filter(x => ["followers", "following", "sponsorshipsAsMaintainer", "sponsorshipsAsSponsor"].includes(x))
                    return {
                      types,
                      size:options["people.size"],
                      ...(Object.fromEntries(types.map(type => [
                        type,
                        new Array(Number(options["people.limit"])).fill(null).map(_ => ({
                          login:faker.internet.userName(),
                          avatar:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mOcOnfpfwAGfgLYttYINwAAAABJRU5ErkJggg==",
                        }))
                      ]))),
                      thanks:options["people.thanks"].split(",").map(x => x.trim()).map(login => ({
                        login,
                        avatar:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mOcOnfpfwAGfgLYttYINwAAAABJRU5ErkJggg==",
                      }))
                    }
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
                      artwork:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mOcOnfpfwAGfgLYttYINwAAAABJRU5ErkJggg==",
                    }))
                  }
                }) : null),
              //Nightscout
              ...(set.plugins.enabled.nightscout ? ({
                nightscout:{
                  url: options["nightscout.url"] != null && options["nightscout.url"] != "https://example.herokuapp.com" ? options["nightscout.url"]: "https://testapp.herokuapp.com/",
                  datapoints: faker.random.number({min: 8, max: 12}),
                  lowalert: faker.random.number({min: 60, max: 90}),
                  highalert: faker.random.number({min: 150, max: 200}),
                  urgentlowalert: faker.random.number({min: 40, max: 59}),
                  urgenthighalert: faker.random.number({min: 201, max: 300})
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
                    descriptions:options["projects.descriptions"],
                    list:new Array(Number(options["projects.limit"])).fill(null).map(_ => ({
                      name:faker.lorem.sentence(),
                      description:faker.lorem.paragraph(),
                      updated:`${2+faker.random.number(8)} days ago`,
                      progress:{enabled:true, todo:faker.random.number(50), doing:faker.random.number(50), done:faker.random.number(50), get total() { return this.todo + this.doing + this.done } }
                    }))
                  }
                }) : null),
              //Posts
                ...(set.plugins.enabled.posts ? ({
                  posts:{
                    source:options["posts.source"],
                    descriptions:options["posts.descriptions"],
                    covers:options["posts.covers"],
                    list:new Array(Number(options["posts.limit"])).fill(null).map(_ => ({
                      title:faker.lorem.sentence(),
                      description:faker.lorem.paragraph(),
                      date:faker.date.recent(),
                      image:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mOcOnfpfwAGfgLYttYINwAAAABJRU5ErkJggg==",
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
                      icon:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mOcOnfpfwAGfgLYttYINwAAAABJRU5ErkJggg=="
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
              //Wakatime
                ...(set.plugins.enabled.wakatime ? ({
                  get wakatime() {
                    const stats = (array) => {
                      const elements = []
                      let results = new Array(4+faker.random.number(2)).fill(null).map(_ => ({
                        name:array ? faker.random.arrayElement(array) : faker.random.words(2).replace(/ /g, "-").toLocaleLowerCase(),
                        percent:0, total_seconds:faker.random.number(1000000),
                      }))
                      let percents = 100
                      for (const result of results) {
                        result.percent = 1+faker.random.number(percents-1)
                        percents -= result.percent
                        result.percent /= 100
                      }
                      results.filter(({name}) => elements.includes(name) ? false : (elements.push(name), true))
                      return results.sort((a, b) => b.percent - a.percent)
                    }
                    return {
                      sections:options["wakatime.sections"].split(",").map(x => x.trim()).filter(x => x),
                      days:Number(options["wakatime.days"])||7,
                      time:{total:faker.random.number(100000), daily:faker.random.number(24)},
                      editors:stats(["VS Code", "Chrome", "IntelliJ", "PhpStorm", "WebStorm", "Android Studio", "Visual Studio", "Sublime Text", "PyCharm", "Vim", "Atom", "Xcode"]),
                      languages:stats(["JavaScript", "TypeScript", "PHP", "Java", "Python", "Vue.js", "HTML", "C#", "JSON", "Dart", "SCSS", "Kotlin", "JSX", "Go", "Ruby", "YAML"]),
                      projects:stats(),
                      os:stats(["Mac", "Windows", "Linux"]),
                    }
                  }
                }) : null),
              //Anilist
                ...(set.plugins.enabled.anilist ? ({
                  anilist:{
                    user:{
                      stats:{
                        anime:{
                          count:faker.random.number(1000),
                          minutesWatched:faker.random.number(100000),
                          episodesWatched:faker.random.number(10000),
                          genres:new Array(4).fill(null).map(_ => ({genre:faker.lorem.word()})),
                        },
                        manga:{
                          count:faker.random.number(1000),
                          chaptersRead:faker.random.number(100000),
                          volumesRead:faker.random.number(10000),
                          genres:new Array(4).fill(null).map(_ => ({genre:faker.lorem.word()})),
                        },
                      },
                      genres:new Array(4).fill(null).map(_ => ({genre:faker.lorem.word()})),
                    },
                    get lists() {
                      const media = (type) => ({
                        name:faker.lorem.words(),
                        type,
                        status:faker.random.arrayElement(["FINISHED", "RELEASING", "NOT_YET_RELEASED", "CANCELLED", "HIATUS"]),
                        release:faker.date.past(20).getFullYear(),
                        genres:new Array(6).fill(null).map(_ => faker.lorem.word()),
                        progress:faker.random.number(100),
                        description:faker.lorem.paragraphs(),
                        scores:{user:faker.random.number(100), community:faker.random.number(100)},
                        released:100+faker.random.number(1000),
                        artwork:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mOcOnfpfwAGfgLYttYINwAAAABJRU5ErkJggg==",
                      })
                      const sections = options["anilist.sections"].split(",").map(x => x.trim()).filter(x => x)
                      const medias = options["anilist.medias"].split(",").map(x => x.trim()).filter(x => x)
                      return {
                        ...(medias.includes("anime") ? {anime:{
                          ...(sections.includes("watching") ? {watching:new Array(Number(options["anilist.limit"])||4).fill(null).map(_ => media("ANIME"))} : {}),
                          ...(sections.includes("favorites") ? {favorites:new Array(Number(options["anilist.limit"])||4).fill(null).map(_ => media("ANIME"))} : {}),
                        }} : {}),
                        ...(medias.includes("manga") ? {manga:{
                          ...(sections.includes("reading") ? {reading:new Array(Number(options["anilist.limit"])||4).fill(null).map(_ => media("MANGA"))} : {}),
                          ...(sections.includes("favorites") ? {favorites:new Array(Number(options["anilist.limit"])||4).fill(null).map(_ => media("MANGA"))} : {}),
                        }} : {}),
                      }
                    },
                    characters:new Array(11).fill(null).map(_ => ({
                      name:faker.name.findName(),
                      artwork:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mOcOnfpfwAGfgLYttYINwAAAABJRU5ErkJggg==",
                    })),
                    sections:options["anilist.sections"].split(",").map(x => x.trim()).filter(x => x)
                  }
                }) : null),
              //Activity
                ...(set.plugins.enabled.activity ? ({
                  activity:{
                    timestamps:options["activity.timestamps"],
                    events:new Array(Number(options["activity.limit"])).fill(null).map(_ => [
                      {
                        type:"push",
                        repo:`${faker.random.word()}/${faker.random.word()}`,
                        size:1,
                        branch:"master",
                        commits: [ { sha:faker.git.shortSha(), message:faker.lorem.sentence()} ],
                        timestamp:faker.date.recent(),
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
                        timestamp:faker.date.recent(),
                      },
                      {
                        type:"comment",
                        on:"pr",
                        repo:`${faker.random.word()}/${faker.random.word()}`,
                        content:faker.lorem.sentence(),
                        user:set.user,
                        mobile:null,
                        number:faker.random.number(100),
                        title:faker.lorem.sentence(),
                        timestamp:faker.date.recent(),
                      },
                      {
                        type:"comment",
                        on:"issue",
                        repo:`${faker.random.word()}/${faker.random.word()}`,
                        content:faker.lorem.sentence(),
                        user:set.user,
                        mobile:null,
                        number:faker.random.number(100),
                        title:faker.lorem.sentence(),
                        timestamp:faker.date.recent(),
                      },
                      {
                        type:"issue",
                        repo:`${faker.random.word()}/${faker.random.word()}`,
                        action:faker.random.arrayElement(["opened", "closed", "reopened"]),
                        user:set.user,
                        number:faker.random.number(100),
                        title:faker.lorem.sentence(),
                        timestamp:faker.date.recent(),
                      },
                      {
                        type:"pr",
                        repo:`${faker.random.word()}/${faker.random.word()}`,
                        action:faker.random.arrayElement(["opened", "closed"]),
                        user:set.user,
                        number:faker.random.number(100),
                        title:faker.lorem.sentence(),
                        lines:{added:faker.random.number(1000), deleted:faker.random.number(1000)}, files:{changed:faker.random.number(10)},
                        timestamp:faker.date.recent(),
                      },
                      {
                        type:"wiki",
                        repo:`${faker.random.word()}/${faker.random.word()}`,
                        pages:[faker.lorem.sentence(), faker.lorem.sentence()],
                        timestamp:faker.date.recent(),
                      },
                      {
                        type:"fork",
                        repo:`${faker.random.word()}/${faker.random.word()}`,
                        timestamp:faker.date.recent(),
                      },
                      {
                        type:"review",
                        repo:`${faker.random.word()}/${faker.random.word()}`,
                        user:set.user,
                        number:faker.random.number(100),
                        title:faker.lorem.sentence(),
                        timestamp:faker.date.recent(),
                      },
                      {
                        type:"release",
                        repo:`${faker.random.word()}/${faker.random.word()}`,
                        action:"published",
                        name:faker.random.words(4),
                        draft:faker.random.boolean(),
                        prerelease:faker.random.boolean(),
                        timestamp:faker.date.recent(),
                      },
                      {
                        type:"ref/create",
                        repo:`${faker.random.word()}/${faker.random.word()}`,
                        ref:{name:faker.lorem.slug(), type:faker.random.arrayElement(["tag", "branch"])},
                        timestamp:faker.date.recent(),
                      },
                      {
                        type:"ref/delete",
                        repo:`${faker.random.word()}/${faker.random.word()}`,
                        ref:{name:faker.lorem.slug(), type:faker.random.arrayElement(["tag", "branch"])},
                        timestamp:faker.date.recent(),
                      },
                      {
                        type:"member",
                        repo:`${faker.random.word()}/${faker.random.word()}`,
                        user:set.user,
                        timestamp:faker.date.recent(),
                      },
                      {
                        type:"public",
                        repo:`${faker.random.word()}/${faker.random.word()}`,
                        timestamp:faker.date.recent(),
                      },
                      {
                        type:"star",
                        repo:`${faker.random.word()}/${faker.random.word()}`,
                        action:"started",
                        timestamp:faker.date.recent(),
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
              //Stackoverflow
                ...(set.plugins.enabled.stackoverflow ? ({
                  stackoverflow:{
                    sections:options["stackoverflow.sections"].split(",").map(x => x.trim()).filter(x => x),
                    lines:options["stackoverflow.lines"],
                    user:{
                      reputation:faker.random.number(100000),
                      badges:faker.random.number(1000),
                      questions:faker.random.number(1000),
                      answers:faker.random.number(1000),
                      comments:faker.random.number(1000),
                      views:faker.random.number(1000),
                    },
                    "answers-top":new Array(options["stackoverflow.limit"]).fill(null).map(_ => ({
                      type:"answer",
                      body:faker.lorem.paragraphs(),
                      score:faker.random.number(1000),
                      upvotes:faker.random.number(1000),
                      downvotes:faker.random.number(1000),
                      accepted:faker.random.boolean(),
                      comments:faker.random.number(1000),
                      author:set.user,
                      created:"01/01/1970",
                      link:null,
                      id:faker.random.number(100000),
                      question_id:faker.random.number(100000),
                      question:{
                        title:faker.lorem.sentence(),
                        tags:[faker.lorem.slug(), faker.lorem.slug()],
                      }
                    })),
                    get ["answers-recent"]() {
                      return this["answers-top"]
                    },
                    "questions-top":new Array(options["stackoverflow.limit"]).fill(null).map(_ => ({
                      type:"question",
                      title:faker.lorem.sentence(),
                      body:faker.lorem.paragraphs(),
                      score:faker.random.number(1000),
                      upvotes:faker.random.number(1000),
                      downvotes:faker.random.number(1000),
                      favorites:faker.random.number(1000),
                      tags:[faker.lorem.slug(), faker.lorem.slug()],
                      answered:faker.random.boolean(),
                      answers:faker.random.number(1000),
                      comments:faker.random.number(1000),
                      views:faker.random.number(1000),
                      author:set.user,
                      created:"01/01/1970",
                      link:null,
                      id:faker.random.number(100000),
                      accepted_answer_id:faker.random.number(100000),
                      answer:null,
                    })),
                    get ["questions-recent"]() {
                      return this["questions-top"]
                    },
                  }
                }) : null),
            },
        }
      //Formatters
        data.f.bytes = function (n) {
          for (const {u, v} of [{u:"E", v:10**18}, {u:"P", v:10**15}, {u:"T", v:10**12}, {u:"G", v:10**9}, {u:"M", v:10**6}, {u:"k", v:10**3}])
            if (n/v >= 1)
              return `${(n/v).toFixed(2).substr(0, 4).replace(/[.]0*$/, "")} ${u}B`
          return `${n} byte${n > 1 ? "s" : ""}`
        }
        data.f.percentage = function (n, {rescale = true} = {}) {
          return `${(n*(rescale ? 100 : 1)).toFixed(2)
            .replace(/[.]([1-9]*)(0+)$/, (m, a, b) => `.${a}`)
            .replace(/[.]$/, "")}%`
        }
        data.f.ellipsis = function (text, {length = 20} = {}) {
          text = `${text}`
          if (text.length < length)
            return text
          return `${text.substring(0, length)}…`
        }
        data.f.date = function (string, options) {
          return new Intl.DateTimeFormat("en-GB", options).format(new Date(string))
        }
      //Render
        return await ejs.render(image, data, {async:true, rmWhitespace:true})
    }
  //Reset globals contexts
    globalThis.placeholder.init = function(globals) {
      axios = globals.axios || axios
      faker = globals.faker || faker
      ejs = globals.ejs || ejs
    }
})()
