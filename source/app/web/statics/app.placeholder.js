async function placeholder(set) {
  //Load asset
    async function load(url) {
      if (!set.cached.has(url))
        set.cached.set(url, (await axios.get(url)).data)
      return set.cached.get(url)
    }
  //Load templates informations
    let {image, style, fonts, partials} = await load(`/.templates/${set.templates.selected}`)
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
          avatar:""
        },
      //User data
        user:{
          databaseId:faker.random.number(10000000),
          name:"",
          login:set.user,
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
                colors:{
                  JavaScript: '#f1e05a',
                  CSS: '#563d7c',
                  HTML: '#e34c26',
                  Dockerfile: '#384d54',
                  TypeScript: '#2b7489',
                  Python: '#3572A5',
                  Vue: '#2c3e50',
                  PowerShell: '#012456',
                  Less: '#1d365d',
                  TeX: '#3D6117',
                  C: '#555555',
                  Gnuplot: '#f0a9f0',
                  Shell: '#89e051',
                  'C++': '#f34b7d',
                  Makefile: '#427819',
                  CMake: '#ededed',
                  Lex: '#DBCA00',
                  QMake: '#ededed'
                },
                total: 3125821,
                stats: {
                  JavaScript: 0.5822419134045104,
                  CSS: 0.04600615326341464,
                  HTML: 0.08085331821623823,
                  Dockerfile: 0.000491710817733965,
                  TypeScript: 0.015703074488270442,
                  Python: 0.024137018722441242,
                  Vue: 0.003580499331215703,
                  PowerShell: 0.0005758487130261137,
                  Less: 0.0032311511119798605,
                  TeX: 0.03526017644644399,
                  C: 0.004387007445403944,
                  Gnuplot: 0.00003135176326475508,
                  Shell: 0.0007684381159381807,
                  'C++': 0.19736798748232864,
                  Makefile: 0.000286324776754651,
                  CMake: 0.0007246096305578598,
                  Lex: 0.00079275172826595,
                  QMake: 0.00356066454221147
                },
                favorites: [
                  {
                    name: 'JavaScript',
                    value: 0.5822419134045104,
                    color: '#f1e05a',
                    x: 0
                  },
                  {
                    name: 'C++',
                    value: 0.19736798748232864,
                    color: '#f34b7d',
                    x: 0.5822419134045104
                  },
                  {
                    name: 'HTML',
                    value: 0.08085331821623823,
                    color: '#e34c26',
                    x: 0.779609900886839
                  },
                  {
                    name: 'CSS',
                    value: 0.04600615326341464,
                    color: '#563d7c',
                    x: 0.8604632191030772
                  },
                  {
                    name: 'TeX',
                    value: 0.03526017644644399,
                    color: '#3D6117',
                    x: 0.9064693723664918
                  },
                  {
                    name: 'Python',
                    value: 0.024137018722441242,
                    color: '#3572A5',
                    x: 0.9417295488129358
                  },
                  {
                    name: 'TypeScript',
                    value: 0.015703074488270442,
                    color: '#2b7489',
                    x: 0.965866567535377
                  },
                  {
                    name: 'C',
                    value: 0.004387007445403944,
                    color: '#555555',
                    x: 0.9815696420236475
                  }
                ]
              }
            }) : null),
          //Habits
            ...(set.plugins.enabled.habits ? ({
              habits:{
                facts:options["habits.fact"],
                charts:options["habits.charts"],
                commits:{
                  hour: "18",
                  hours: {
                    "0": 3,
                    "2": 4,
                    "8": 4,
                    "10": 1,
                    "12": 3,
                    "13": 2,
                    "14": 10,
                    "15": 2,
                    "17": 1,
                    "18": 38,
                    "19": 12,
                    "20": 9,
                    "21": 14,
                    "22": 12,
                    "23": 7,
                    max: 38
                  },
                  day:"Monday",
                  days: {
                    "0": 10,
                    "1": 42,
                    "2": 22,
                    "3": 1,
                    "4": 4,
                    "5": 5,
                    "6": 38,
                    max: 42
                  }
                },
                indents:{style:"spaces", spaces:0, tabs:0},
                linguist:{
                  available:true,
                  ordered:[
                    [faker.lorem.word(), ],
                    [faker.lorem.word(), ],
                    [faker.lorem.word(), ],
                    [faker.lorem.word(), ]
                  ],
                  get languages() { return Object.fromEntries(this.ordered) }
                }
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
              stargazers:{
                total:{
                  dates:{
                    '2020-12-30': '8.99k',
                    '2020-12-31': '8.99k',
                    '2021-01-01': '8.99k',
                    '2021-01-02': '8.99k',
                    '2021-01-03': '9k',
                    '2021-01-04': '9k',
                    '2021-01-05': '9k',
                    '2021-01-06': '9k',
                    '2021-01-07': '9k',
                    '2021-01-08': '9.01k',
                    '2021-01-09': '9.01k',
                    '2021-01-10': '9.01k',
                    '2021-01-11': '9.01k',
                    '2021-01-12': '9.01k'
                  },
                  max: 9011,
                  min: 8989
                },
                increments: {
                  dates: {
                    '2020-12-30': '+4',
                    '2020-12-31': '+2',
                    '2021-01-01': '+2',
                    '2021-01-02': '+1',
                    '2021-01-03': '+2',
                    '2021-01-04': '+2',
                    '2021-01-05': '+2',
                    '2021-01-06': '+2',
                    '2021-01-07': '+2',
                    '2021-01-08': '+2',
                    '2021-01-09': '+2',
                    '2021-01-10': '+1',
                    '2021-01-11': '+1',
                    '2021-01-12': '+1'
                  },
                  max: 4,
                  min: 1
                },
                months:["", "Jan.", "Feb.", "Mar.", "Apr.", "May", "June", "July", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."]
              }
            }) : null),

        },
    }
  //Trap includes
    image = image.replace(/<%-\s*await include[(](`.*?[.]ejs`)[)]\s*%>/g, (m, g) => `<%- await $include(${g}) %>`)
  //Render
    return await ejs.render(image, data, {async:true, rmWhitespace:true})
}