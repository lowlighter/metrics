;(function({axios, faker, ejs} = {axios: globalThis.axios, faker: globalThis.faker, ejs: globalThis.ejs}) {
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
    for (let i = 0; i < length - 1; i++) {
      const value = Math.random() * probability
      values.push(value)
      probability -= value
    }
    values.push(probability)
    return values.sort((a, b) => b - a)
  }
  //Escape partial
  function escape(partial) {
    return encodeURIComponent(partial).replace(/%2F/gi, "/")
  }
  //Static complex placeholder
  async function staticPlaceholder(condition, name) {
    if (!condition)
      return ""
    return await fetch(`/.placeholders/${name}`).then(response => response.text()).catch(() => "(could not render placeholder)")
  }
  //Placeholder function
  globalThis.placeholder = async function(set) {
    //Load templates informations
    let {image, style, fonts, partials} = await load(`/.templates/${set.templates.selected}`)
    await Promise.all(partials.map(async partial => await load(`/.templates/${set.templates.selected}/partials/${escape(partial)}.ejs`)))
    //Trap includes
    image = image.replace(/<%-\s*await include[(](`.*?[.]ejs`)[)]\s*%>/g, (m, g) => `<%- await $include(${g}) %>`)
    //Faked data
    const options = set.plugins.options
    const data = {
      //Template elements
      style,
      fonts,
      errors: [],
      partials: new Set([...(set.config.order || "").split(",").map(x => x.trim()).filter(x => partials.includes(x)), ...partials]),
      //Plural helper
      s(value, end = "") {
        return value !== 1 ? {y: "ies", "": "s"}[end] : end
      },
      //Formatter helper
      f(n, {sign = false} = {}) {
        for (const {u, v} of [{u: "b", v: 10 ** 9}, {u: "m", v: 10 ** 6}, {u: "k", v: 10 ** 3}]) {
          if (n / v >= 1)
            return `${(sign) && (n > 0) ? "+" : ""}${(n / v).toFixed(2).substr(0, 4).replace(/[.]0*$/, "")}${u}`
        }
        return `${(sign) && (n > 0) ? "+" : ""}${n}`
      },
      //Trap for includes
      async $include(path) {
        const partial = await load(`/.templates/${set.templates.selected}/${escape(path)}`)
        return await ejs.render(partial, data, {async: true, rmWhitespace: true})
      },
      //Meta-data
      meta: {version: set.version, author: "lowlighter", generated: new Date().toGMTString().replace(/GMT$/g, "").trim()},
      //Animated
      animated: false,
      //Display size
      large: set.config.display === "large",
      columns: set.config.display === "columns",
      //Config
      config: set.config,
      //Extras
      extras: {css: options["extras.css"] ?? ""},
      //Base elements
      base: set.plugins.enabled.base,
      //Computed elements
      computed: {
        commits: faker.datatype.number(10000),
        sponsorships: faker.datatype.number(10),
        licenses: {favorite: [""], used: {MIT: 1}, about: {}},
        token: {scopes: []},
        repositories: {
          watchers: faker.datatype.number(1000),
          stargazers: faker.datatype.number(10000),
          issues_open: faker.datatype.number(1000),
          issues_closed: faker.datatype.number(1000),
          pr_open: faker.datatype.number(1000),
          pr_closed: {totalCount: faker.datatype.number(100)},
          pr_merged: faker.datatype.number(1000),
          forks: faker.datatype.number(1000),
          releases: faker.datatype.number(1000),
        },
        diskUsage: `${faker.datatype.float({min: 1, max: 999}).toFixed(1)}MB`,
        registration: `${faker.datatype.number({min: 2, max: 10})} years ago`,
        cakeday: false,
        calendar: new Array(14).fill(null).map(_ => ({color: faker.random.arrayElement(["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"])})),
        avatar: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mOcOnfpfwAGfgLYttYINwAAAABJRU5ErkJggg==",
      },
      //User data
      account: "user",
      user: {
        databaseId: faker.datatype.number(10000000),
        name: "(placeholder)",
        login: set.user || "metrics",
        createdAt: `${faker.date.past(10)}`,
        avatarUrl: set.avatar,
        websiteUrl: options["pagespeed.url"] || "(attached website)",
        isHireable: options["base.hireable"],
        twitterUsername: options["tweets.user"] || "(attached Twitter account)",
        repositories: {totalCount: faker.datatype.number(100), totalDiskUsage: faker.datatype.number(100000), nodes: []},
        packages: {totalCount: faker.datatype.number(10)},
        starredRepositories: {totalCount: faker.datatype.number(1000)},
        watching: {totalCount: faker.datatype.number(100)},
        sponsorshipsAsSponsor: {totalCount: faker.datatype.number(10)},
        sponsorshipsAsMaintainer: {totalCount: faker.datatype.number(10)},
        contributionsCollection: {
          totalRepositoriesWithContributedCommits: faker.datatype.number(100),
          totalCommitContributions: faker.datatype.number(10000),
          restrictedContributionsCount: faker.datatype.number(10000),
          totalIssueContributions: faker.datatype.number(100),
          totalPullRequestContributions: faker.datatype.number(1000),
          totalPullRequestReviewContributions: faker.datatype.number(1000),
        },
        calendar: {contributionCalendar: {weeks: []}},
        repositoriesContributedTo: {totalCount: faker.datatype.number(100)},
        followers: {totalCount: faker.datatype.number(1000)},
        following: {totalCount: faker.datatype.number(1000)},
        issueComments: {totalCount: faker.datatype.number(1000)},
        organizations: {totalCount: faker.datatype.number(10)},
      },
      //Plugins
      plugins: {
        //Tweets
        ...(set.plugins.enabled.tweets
          ? ({
            tweets: {
              username: options["tweets.user"] || "(attached Twitter account)",
              profile: {
                profile_image_url: faker.image.people(),
                name: "",
                verified: false,
                id: faker.datatype.number(1000000).toString(),
                username: options["tweets.user"] || "(attached Twitter account)",
                profile_image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mOcOnfpfwAGfgLYttYINwAAAABJRU5ErkJggg==",
              },
              list: [
                {
                  id: faker.datatype.number(100000000000000).toString(),
                  created_at: faker.date.recent(),
                  entities: {
                    mentions: [{start: 22, end: 33, username: "lowlighter"}],
                  },
                  text: 'Checkout metrics from  <span class="mention">@lowlighter</span>  !  <span class="hashtag">#GitHub</span> ',
                  mentions: ["lowlighter"],
                },
                ...new Array(Number(options["tweets.limit"]) - 1).fill(null).map(_ => ({
                  id: faker.datatype.number(100000000000000).toString(),
                  created_at: faker.date.recent(),
                  text: faker.lorem.paragraph(),
                  mentions: [],
                })),
              ],
            },
          })
          : null),
        //Lines
        ...(set.plugins.enabled.lines
          ? ({
            lines: {
              added: `${faker.datatype.number(100)}.${faker.datatype.number(9)}k`,
              deleted: `${faker.datatype.number(100)}.${faker.datatype.number(9)}k`,
            },
          })
          : null),
        //Traffic
        ...(set.plugins.enabled.traffic
          ? ({
            traffic: {
              views: {
                count: `${faker.datatype.number({min: 10, max: 100})}.${faker.datatype.number(9)}k`,
                uniques: `${faker.datatype.number(10)}.${faker.datatype.number(9)}k`,
              },
            },
          })
          : null),
        //Follow-up
        ...(set.plugins.enabled.followup
          ? ({
            followup: {
              sections: options["followup.sections"].split(",").map(x => x.trim()).filter(x => ["user", "repositories"].includes(x)),
              issues: {
                get count() {
                  return this.open + this.closed + this.drafts + this.skipped
                },
                open: faker.datatype.number(1000),
                closed: faker.datatype.number(1000),
                drafts: faker.datatype.number(100),
                skipped: faker.datatype.number(100),
                get collaborators() {
                  return {
                    open: faker.datatype.number(this.open),
                    closed: faker.datatype.number(this.closed),
                    drafts: faker.datatype.number(this.drafts),
                    skipped: faker.datatype.number(this.skipped),
                  }
                },
              },
              pr: {
                get count() {
                  return this.open + this.closed + this.merged + this.drafts
                },
                open: faker.datatype.number(1000),
                closed: faker.datatype.number(1000),
                merged: faker.datatype.number(1000),
                drafts: faker.datatype.number(100),
                get collaborators() {
                  return {
                    open: faker.datatype.number(this.open),
                    closed: faker.datatype.number(this.closed),
                    merged: faker.datatype.number(this.skipped),
                    drafts: faker.datatype.number(this.drafts),
                  }
                },
              },
              user: {
                issues: {
                  get count() {
                    return this.open + this.closed + this.drafts + this.skipped
                  },
                  open: faker.datatype.number(1000),
                  closed: faker.datatype.number(1000),
                  drafts: faker.datatype.number(100),
                  skipped: faker.datatype.number(100),
                },
                pr: {
                  get count() {
                    return this.open + this.closed + this.merged + this.drafts
                  },
                  open: faker.datatype.number(1000),
                  closed: faker.datatype.number(1000),
                  merged: faker.datatype.number(1000),
                  drafts: faker.datatype.number(100),
                },
              },
              indepth: options["followup.indepth"] ? {} : null,
            },
          })
          : null),
        //Notable
        ...(set.plugins.enabled.notable
          ? ({
            notable: {
              contributions: new Array(2 + faker.datatype.number(2)).fill(null).map(_ => ({
                get name() {
                  return options["notable.repositories"] ? this.handle : this.handle.split("/")[0]
                },
                handle: `${faker.lorem.slug()}/${faker.lorem.slug()}`,
                avatar: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mOcOnfpfwAGfgLYttYINwAAAABJRU5ErkJggg==",
                organization: faker.datatype.boolean(),
                stars: faker.datatype.number(1000),
                aggregated: faker.datatype.number(100),
                history: faker.datatype.number(1000),
                ...(options["notable.indepth"]
                  ? {
                    user: {
                      commits: faker.datatype.number(100),
                      percentage: faker.datatype.float({max: 1}),
                      maintainer: false,
                      stars: faker.datatype.number(100),
                    },
                  }
                  : null),
              })),
            },
          })
          : null),
        //Gists
        ...(set.plugins.enabled.gists
          ? ({
            gists: {
              totalCount: faker.datatype.number(100),
              stargazers: faker.datatype.number(1000),
              forks: faker.datatype.number(100),
              files: faker.datatype.number(100),
              comments: faker.datatype.number(1000),
            },
          })
          : null),
        //Reactions
        ...(set.plugins.enabled.reactions
          ? ({
            reactions: {
              list: {
                HEART: {
                  value: faker.datatype.number(100),
                  get percentage() {
                    return this.score
                  },
                  score: faker.datatype.number(100) / 100,
                },
                THUMBS_UP: {
                  value: faker.datatype.number(100),
                  get percentage() {
                    return this.score
                  },
                  score: faker.datatype.number(100) / 100,
                },
                THUMBS_DOWN: {
                  value: faker.datatype.number(100),
                  get percentage() {
                    return this.score
                  },
                  score: faker.datatype.number(100) / 100,
                },
                LAUGH: {
                  value: faker.datatype.number(100),
                  get percentage() {
                    return this.score
                  },
                  score: faker.datatype.number(100) / 100,
                },
                CONFUSED: {
                  value: faker.datatype.number(100),
                  get percentage() {
                    return this.score
                  },
                  score: faker.datatype.number(100) / 100,
                },
                EYES: {
                  value: faker.datatype.number(100),
                  get percentage() {
                    return this.score
                  },
                  score: faker.datatype.number(100) / 100,
                },
                ROCKET: {
                  value: faker.datatype.number(100),
                  get percentage() {
                    return this.score
                  },
                  score: faker.datatype.number(100) / 100,
                },
                HOORAY: {
                  value: faker.datatype.number(100),
                  get percentage() {
                    return this.score
                  },
                  score: faker.datatype.number(100) / 100,
                },
              },
              comments: options["reactions.limit"],
              details: options["reactions.details"].split(",").map(x => x.trim()),
              days: options["reactions.days"],
            },
          })
          : null),
        //Achievements
        ...(set.plugins.enabled.achievements
          ? ({
            achievements: {
              display: options["achievements.display"],
              list: new Array(8).fill(null).map(_ => ({
                prefix: "",
                title: faker.lorem.word(),
                unlock: null,
                text: faker.lorem.sentence(),
                get icon() {
                  const colors = {S: ["#FF0000", "#FF8500"], A: ["#B59151", "#FFD576"], B: ["#7D6CFF", "#B2A8FF"], C: ["#2088FF", "#79B8FF"], $: ["#FF48BD", "#FF92D8"], X: ["#7A7A7A", "#B0B0B0"]}
                  return `<g xmlns="http://www.w3.org/2000/svg" stroke-linecap="round" stroke-width="2" fill="none" fill-rule="evenodd"><g stroke-linejoin="round"><g stroke="#secondary"><path d="M8 43a3 3 0 100 6 3 3 0 000-6zm40 0a3.001 3.001 0 10.002 6.002A3.001 3.001 0 0048 43zm-18 3h-4.971m-11.045 0H11M45 46h-4"/></g><path stroke="#primary" d="M13 51h28M36.992 45.276l6.375-8.017c1.488.63 3.272.29 4.414-.977a3.883 3.883 0 00.658-4.193l-1.96 2.174-1.936-.151-.406-1.955 1.96-2.173a3.898 3.898 0 00-4.107 1.092 3.886 3.886 0 00-.512 4.485l-7.317 7.169c-1.32 1.314-.807 2.59-.236 3.105.67.601 1.888.845 3.067-.56z"/><g stroke="#primary"><path d="M12.652 31.063l9.442 12.578a.512.512 0 01-.087.716l-2.396 1.805a.512.512 0 01-.712-.114L9.46 33.47l-.176-3.557 3.37 1.15zM17.099 43.115l2.395-1.806"/></g></g><path d="M25.68 36.927v-2.54a2.227 2.227 0 01.37-1.265c-.526-.04-3.84-.371-3.84-4.302 0-1.013.305-1.839.915-2.477a4.989 4.989 0 01-.146-1.86c.087-.882.946-.823 2.577.178 1.277-.47 2.852-.47 4.725 0 .248-.303 2.434-1.704 2.658-.268.047.296.016.946-.093 1.95.516.524.776 1.358.78 2.501.007 2.261-1.26 3.687-3.8 4.278.24.436.355.857.346 1.264a117.57 117.57 0 000 2.614c2.43-.744 4.228-2.06 5.395-3.95.837-1.356 1.433-2.932 1.433-4.865 0-2.886-1.175-4.984-2.5-6.388C32.714 19.903 30.266 19 28 19a9.094 9.094 0 00-6.588 2.897C20.028 23.393 19 25.507 19 28.185c0 2.026.701 3.945 1.773 5.38 1.228 1.643 2.864 2.764 4.907 3.362zM52.98 25.002l-3.07 3.065-1.49-1.485M6.98 25.002l-3.07 3.065-1.49-1.485" stroke="#primary" stroke-linejoin="round"/><path d="M19.001 11V9a2 2 0 012-2h14a2 2 0 012 2v2m-21 12.028v-10.03a2 2 0 012-1.998h20a2 2 0 012 2v10.028" stroke="#secondary" stroke-linejoin="round"/><path stroke="#secondary" d="M28.001 7V3M15.039 7.797c-5.297 3.406-9.168 8.837-10.517 15.2m46.737-.936c-1.514-5.949-5.25-11.01-10.273-14.248"/></g>`
                    .replace(/#primary/g, colors[this.rank][0])
                    .replace(/#secondary/g, colors[this.rank][1])
                },
                rank: faker.random.arrayElement(["A", "B", "C", "X", "$"]),
                progress: faker.datatype.number(100) / 100,
                value: faker.datatype.number(1000),
              }))
                .filter(({rank}) => options["achievements.secrets"] ? true : rank !== "$")
                .filter(({rank}) => ({S: 5, A: 4, B: 3, C: 2, $: 1, X: 0}[rank] >= {S: 5, A: 4, B: 3, C: 2, $: 1, X: 0}[options["achievements.threshold"]]))
                .sort((a, b) => ({S: 5, A: 4, B: 3, C: 2, $: 1, X: 0}[b.rank] + b.progress * 0.99) - ({S: 5, A: 4, B: 3, C: 2, $: 1, X: 0}[a.rank] + a.progress * 0.99))
                .slice(0, options["achievements.limit"] || Infinity),
            },
          })
          : null),
        //Introduction
        ...(set.plugins.enabled.introduction
          ? ({
            introduction: {
              mode: "user",
              title: options["introduction.title"],
              text: faker.lorem.sentences(),
            },
          })
          : null),
        //Code snippet
        ...(set.plugins.enabled.code
          ? ({
            code: {
              snippet: {
                sha: faker.git.shortSha(),
                message: faker.lorem.sentence(),
                filename: "docs/specifications.html",
                status: "modified",
                additions: faker.datatype.number(50),
                deletions: faker.datatype.number(50),
                patch: `<span class="token coord">@@ -0,0 +1,5 @@</span><br>  //Imports<br><span class="token inserted">+  import app from "./src/app.mjs"</span><br><span class="token deleted">-  import app from "./src/app.js"</span><br>  //Start app<br>  await app()<br>\\ No newline at end of file`,
                repo: `${faker.random.word()}/${faker.random.word()}`,
              },
            },
          })
          : null),
        //Sponsors
        ...(set.plugins.enabled.sponsors
          ? ({
            sponsors: {
              sections: options["sponsors.sections"].split(",").map(x => x.trim()),
              about: "A new way to contribute to open source",
              list: new Array(Number(faker.datatype.number(40))).fill(null).map(_ => ({
                login: faker.internet.userName(),
                amount: faker.datatype.number(10),
                avatar: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mOcOnfpfwAGfgLYttYINwAAAABJRU5ErkJggg==",
                past: faker.datatype.boolean(),
              })),
              past: options["sponsors.past"],
              size: options["sponsors.size"],
              count: {
                total: {
                  count: faker.datatype.number(100),
                  user: faker.datatype.number(100),
                  organization: faker.datatype.number(100),
                },
                active: {
                  total: faker.datatype.number(100),
                  user: faker.datatype.number(100),
                  organization: faker.datatype.number(100),
                },
                past: {
                  total: faker.datatype.number(100),
                  user: faker.datatype.number(100),
                  organization: faker.datatype.number(100),
                },
              },
              goal: {
                progress: faker.datatype.number(100),
                title: `$${faker.datatype.number(100) * 10} per month`,
                description: "Invest in the software that powers your world",
              },
            },
          })
          : null),
        //Languages
        ...(set.plugins.enabled.languages
          ? ({
            languages: {
              unique: faker.datatype.number(50),
              sections: options["languages.sections"].split(", ").map(x => x.trim()).filter(x => /^(most-used|recently-used)$/.test(x)),
              details: options["languages.details"].split(",").map(x => x.trim()).filter(x => x),
              get colors() {
                return Object.fromEntries(Object.entries(this.favorites).map(([key, {color}]) => [key, color]))
              },
              total: faker.datatype.number(10000),
              get stats() {
                return Object.fromEntries(Object.entries(this.favorites).map(([key, {value}]) => [key, value]))
              },
              ["stats.recent"]: {
                total: faker.datatype.number(10000),
                get lines() {
                  return Object.fromEntries(Object.entries(this.recent).map(([key, {value}]) => [key, value]))
                },
                get stats() {
                  return Object.fromEntries(Object.entries(this.recent).map(([key, {value}]) => [key, value]))
                },
                commits: faker.datatype.number(500),
                files: faker.datatype.number(1000),
                days: Number(options["languages.recent.days"]),
              },
              favorites: distribution(options["languages.limit"] || 8).map((value, index, array) => ({name: (index + 1 === array.length) && (options["languages.other"]) ? "Other" : faker.lorem.word(), color: faker.internet.color(), value, size: faker.datatype.number(1000000), x: array.slice(0, index).reduce((a, b) => a + b, 0)})),
              recent: distribution(options["languages.limit"] || 8).map((value, index, array) => ({name: (index + 1 === array.length) && (options["languages.other"]) ? "Other" : faker.lorem.word(), color: faker.internet.color(), value, size: faker.datatype.number(1000000), x: array.slice(0, index).reduce((a, b) => a + b, 0)})),
              get verified() {
                return options["languages.indepth"] ? {signature: faker.datatype.number(this.commits)} : null
              },
              indepth: options["languages.indepth"],
              commits: faker.datatype.number(500),
              files: faker.datatype.number(1000),
            },
          })
          : null),
        //RSS
        ...(set.plugins.enabled.rss
          ? ({
            rss: {
              source: faker.lorem.words(),
              description: faker.lorem.paragraph(),
              link: options["rss.source"],
              feed: new Array(Number(options["rss.limit"])).fill(null).map(_ => ({
                title: faker.lorem.sentence(),
                date: faker.date.recent(),
              })),
            },
          })
          : null),
        //Stock price
        ...(set.plugins.enabled.stock
          ? ({
            stock: {
              chart: await staticPlaceholder(set.plugins.enabled.stock, "stock.svg"),
              currency: "USD",
              price: faker.datatype.number(10000) / 100,
              previous: faker.datatype.number(10000) / 100,
              get delta() {
                return this.price - this.previous
              },
              symbol: options["stock.symbol"],
              company: faker.company.companyName(),
              interval: options["stock.interval"],
              duration: options["stock.duration"],
            },
          })
          : null),
        //Habits
        ...(set.plugins.enabled.habits
          ? ({
            habits: {
              facts: options["habits.facts"],
              charts: options["habits.charts"],
              trim: options["habits.trim"],
              lines: {
                average: {
                  chars: faker.datatype.number(1000) / 10,
                },
              },
              commits: {
                get hour() {
                  return Object.keys(this.hours).filter(key => /^\d+$/.test(key)).map(key => [key, this.hours[key]]).sort((a, b) => b[1] - a[1]).shift()?.[0]
                },
                hours: {
                  [faker.datatype.number(24)]: faker.datatype.number(10),
                  [faker.datatype.number(24)]: faker.datatype.number(10),
                  [faker.datatype.number(24)]: faker.datatype.number(10),
                  [faker.datatype.number(24)]: faker.datatype.number(10),
                  [faker.datatype.number(24)]: faker.datatype.number(10),
                  [faker.datatype.number(24)]: faker.datatype.number(10),
                  [faker.datatype.number(24)]: faker.datatype.number(10),
                  get max() {
                    return Object.keys(this).filter(key => /^\d+$/.test(key)).map(key => [key, this[key]]).sort((a, b) => b[1] - a[1]).shift()?.[1]
                  },
                },
                get day() {
                  return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][Object.keys(this.days).filter(key => /^\d+$/.test(key)).map(key => [key, this.days[key]]).sort((a, b) => b[1] - a[1]).shift()?.[0]]
                },
                days: {
                  "0": faker.datatype.number(10),
                  "1": faker.datatype.number(10),
                  "2": faker.datatype.number(10),
                  "3": faker.datatype.number(10),
                  "4": faker.datatype.number(10),
                  "5": faker.datatype.number(10),
                  "6": faker.datatype.number(10),
                  get max() {
                    return Object.keys(this).filter(key => /^\d+$/.test(key)).map(key => [key, this[key]]).sort((a, b) => b[1] - a[1]).shift()?.[1]
                  },
                },
              },
              indents: {style: "spaces", spaces: 1, tabs: 0},
              linguist: {
                available: true,
                get ordered() {
                  return Object.entries(this.languages)
                },
                get languages() {
                  return Object.fromEntries(distribution(4).map(value => [faker.lorem.word(), value]))
                },
              },
            },
          })
          : null),
        //People
        ...(set.plugins.enabled.people
          ? ({
            get people() {
              const types = options["people.types"].split(",").map(x => x.trim())
                .map(x => ({followed: "following", sponsors: "sponsorshipsAsMaintainer", sponsored: "sponsorshipsAsSponsor", sponsoring: "sponsorshipsAsSponsor"})[x] ?? x)
                .filter(x => ["followers", "following", "sponsorshipsAsMaintainer", "sponsorshipsAsSponsor"].includes(x))
              return {
                types,
                size: options["people.size"],
                ...(Object.fromEntries(types.map(type => [
                  type,
                  new Array(Number(options["people.limit"])).fill(null).map(_ => ({
                    login: faker.internet.userName(),
                    avatar: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mOcOnfpfwAGfgLYttYINwAAAABJRU5ErkJggg==",
                  })),
                ]))),
                thanks: options["people.thanks"].split(",").map(x => x.trim()).map(login => ({
                  login,
                  avatar: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mOcOnfpfwAGfgLYttYINwAAAABJRU5ErkJggg==",
                })),
              }
            },
          })
          : null),
        //Music
        ...(set.plugins.enabled.music
          ? ({
            music: {
              provider: "(music provider)",
              mode: "Suggested tracks",
              played_at: options["music.played.at"],
              tracks: new Array(Number(options["music.limit"])).fill(null).map(_ => ({
                name: faker.random.words(5),
                artist: faker.random.words(),
                artwork: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mOcOnfpfwAGfgLYttYINwAAAABJRU5ErkJggg==",
                played_at: options["music.played.at"] ? faker.date.recent() : null,
              })),
            },
          })
          : null),
        //Nightscout
        ...(set.plugins.enabled.nightscout
          ? ({
            nightscout: {
              url: options["nightscout.url"] != null && options["nightscout.url"] != "https://example.herokuapp.com" ? options["nightscout.url"] : "https://testapp.herokuapp.com/",
              data: new Array(12).fill(null).map(_ => ({
                timeUTCHumanReadable: `${new Date().getUTCHours()}:${new Date().getUTCMinutes()}`,
                color: faker.random.arrayElement(["#9be9a8", "#40c463", "#30a14e", "#216e39"]),
                sgv: faker.datatype.number({min: 40, max: 400}),
                delta: faker.datatype.number({min: -10, max: 10}),
                direction: faker.random.arrayElement(["SingleUp", "DoubleUp", "FortyFiveUp", "Flat", "FortyFiveDown", "SingleDown", "DoubleDown"]),
                alert: faker.random.arrayElement(["Normal", "Urgent High", "Urgent Low", "High", "Low"]),
                arrowHumanReadable: faker.random.arrayElement(["↑↑", "↑", "↗", "→", "↘", "↓", "↓↓"]),
              })),
            },
          })
          : null),
        //Fortune
        ...(set.plugins.enabled.fortune
          ? ({
            fortune: faker.random.arrayElement([
              {chance: .06, color: "#43FD3B", text: "Good news will come to you by mail"},
              {chance: .06, color: "#00CBB0", text: "ｷﾀ━━━━━━(ﾟ∀ﾟ)━━━━━━ !!!!"},
              {chance: 0.03, color: "#FD4D32", text: "Excellent Luck"},
            ]),
          })
          : null),
        //Pagespeed
        ...(set.plugins.enabled.pagespeed
          ? ({
            pagespeed: {
              url: options["pagespeed.url"] || "(attached website url)",
              detailed: options["pagespeed.detailed"] || false,
              scores: [
                {score: faker.datatype.float({max: 1}), title: "Performance"},
                {score: faker.datatype.float({max: 1}), title: "Accessibility"},
                {score: faker.datatype.float({max: 1}), title: "Best Practices"},
                {score: faker.datatype.float({max: 1}), title: "SEO"},
              ],
              metrics: {
                observedFirstContentfulPaint: faker.datatype.number(500),
                observedFirstVisualChangeTs: faker.time.recent(),
                observedFirstContentfulPaintTs: faker.time.recent(),
                firstContentfulPaint: faker.datatype.number(500),
                observedDomContentLoaded: faker.datatype.number(500),
                observedFirstMeaningfulPaint: faker.datatype.number(1000),
                maxPotentialFID: faker.datatype.number(500),
                observedLoad: faker.datatype.number(500),
                firstMeaningfulPaint: faker.datatype.number(500),
                observedCumulativeLayoutShift: faker.datatype.float({max: 1}),
                observedSpeedIndex: faker.datatype.number(1000),
                observedSpeedIndexTs: faker.time.recent(),
                observedTimeOriginTs: faker.time.recent(),
                observedLargestContentfulPaint: faker.datatype.number(1000),
                cumulativeLayoutShift: faker.datatype.float({max: 1}),
                observedFirstPaintTs: faker.time.recent(),
                observedTraceEndTs: faker.time.recent(),
                largestContentfulPaint: faker.datatype.number(2000),
                observedTimeOrigin: faker.datatype.number(10),
                speedIndex: faker.datatype.number(1000),
                observedTraceEnd: faker.datatype.number(2000),
                observedDomContentLoadedTs: faker.time.recent(),
                observedFirstPaint: faker.datatype.number(500),
                totalBlockingTime: faker.datatype.number(500),
                observedLastVisualChangeTs: faker.time.recent(),
                observedFirstVisualChange: faker.datatype.number(500),
                observedLargestContentfulPaintTs: faker.time.recent(),
                estimatedInputLatency: faker.datatype.number(100),
                observedLoadTs: faker.time.recent(),
                observedLastVisualChange: faker.datatype.number(1000),
                firstCPUIdle: faker.datatype.number(1000),
                interactive: faker.datatype.number(1000),
                observedNavigationStartTs: faker.time.recent(),
                observedNavigationStart: faker.datatype.number(10),
                observedFirstMeaningfulPaintTs: faker.time.recent(),
              },
              screenshot: options["pagespeed.screenshot"] ? "data:image/jpg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mOcOnfpfwAGfgLYttYINwAAAABJRU5ErkJggg==" : null,
            },
          })
          : null),
        //Projects
        ...(set.plugins.enabled.projects
          ? ({
            projects: {
              totalCount: options["projects.limit"] + faker.datatype.number(10),
              descriptions: options["projects.descriptions"],
              list: new Array(Number(options["projects.limit"])).fill(null).map(_ => ({
                name: faker.lorem.sentence(),
                description: faker.lorem.paragraph(),
                updated: `${2 + faker.datatype.number(8)} days ago`,
                progress: {
                  enabled: true,
                  todo: faker.datatype.number(50),
                  doing: faker.datatype.number(50),
                  done: faker.datatype.number(50),
                  get total() {
                    return this.todo + this.doing + this.done
                  },
                },
              })),
            },
          })
          : null),
        //Discussions
        ...(set.plugins.enabled.discussions
          ? ({
            discussions: {
              categories: {
                stats: {"🙏 Q&A": faker.datatype.number(100), "📣 Announcements": faker.datatype.number(100), "💡 Ideas": faker.datatype.number(100), "💬 General": faker.datatype.number(100)},
                favorite: "📣 Announcements",
              },
              upvotes: {discussions: faker.datatype.number(1000), comments: faker.datatype.number(1000)},
              started: faker.datatype.number(1000),
              comments: faker.datatype.number(1000),
              answers: faker.datatype.number(1000),
              display: {categories: options["discussions.categories"] ? {limit: options["discussions.categories.limit"] || Infinity} : null},
            },
          })
          : null),
        //Posts
        ...(set.plugins.enabled.posts
          ? ({
            posts: {
              source: options["posts.source"],
              descriptions: options["posts.descriptions"],
              covers: options["posts.covers"],
              list: new Array(Number(options["posts.limit"])).fill(null).map(_ => ({
                title: faker.lorem.sentence(),
                description: faker.lorem.paragraph(),
                date: faker.date.recent(),
                image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mOcOnfpfwAGfgLYttYINwAAAABJRU5ErkJggg==",
              })),
            },
          })
          : null),
        //Topics
        ...(set.plugins.enabled.topics
          ? ({
            topics: {
              mode: options["topics.mode"],
              type: {starred: "labels", labels: "labels", mastered: "icons", icons: "icons"}[options["topics.mode"]] || "labels",
              list: new Array(Number(options["topics.limit"]) || 20).fill(null).map(_ => ({
                name: faker.lorem.words(2),
                description: faker.lorem.sentence(),
                icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mOcOnfpfwAGfgLYttYINwAAAABJRU5ErkJggg==",
              })),
            },
          })
          : null),
        //Stars
        ...(set.plugins.enabled.stars
          ? ({
            stars: {
              repositories: [
                {
                  starredAt: faker.date.recent(),
                  node: {
                    description: "📊 An image generator with 20+ metrics about your GitHub account such as activity, community, repositories, coding habits, website performances, music played, starred topics, etc. that you can put on your profile or elsewhere !",
                    forkCount: faker.datatype.number(100),
                    isFork: false,
                    issues: {
                      totalCount: faker.datatype.number(100),
                    },
                    nameWithOwner: "lowlighter/metrics",
                    openGraphImageUrl: "https://repository-images.githubusercontent.com/293860197/7fd72080-496d-11eb-8fe0-238b38a0746a",
                    pullRequests: {
                      totalCount: faker.datatype.number(100),
                    },
                    stargazerCount: faker.datatype.number(10000),
                    licenseInfo: {nickname: null, name: "MIT License"},
                    primaryLanguage: {color: "#f1e05a", name: "JavaScript"},
                  },
                  starred: "1 day ago",
                },
                ...new Array(Number(options["stars.limit"]) - 1).fill(null).map((_, i) => ({
                  starredAt: faker.date.recent(),
                  node: {
                    description: faker.lorem.sentence(),
                    forkCount: faker.datatype.number(100),
                    isFork: faker.datatype.boolean(),
                    issues: {
                      totalCount: faker.datatype.number(100),
                    },
                    nameWithOwner: `${faker.random.word()}/${faker.random.word()}`,
                    openGraphImageUrl: faker.internet.url(),
                    pullRequests: {
                      totalCount: faker.datatype.number(100),
                    },
                    stargazerCount: faker.datatype.number(10000),
                    licenseInfo: {nickname: null, name: "License"},
                    primaryLanguage: {color: faker.internet.color(), name: faker.lorem.word()},
                  },
                  starred: `${i + 2} days ago`,
                })),
              ],
            },
          })
          : null),
        //Starlists
        ...(set.plugins.enabled.starlists
          ? ({
            starlists: {
              lists: new Array(Number(options["starlists.limit"])).fill(null).map(_ => ({
                link: faker.internet.url(),
                name: `${faker.random.arrayElement(["😎", "🥳", "🧐", "😂", "😁"])} ${faker.lorem.word()}`,
                description: faker.lorem.sentence(),
                count: faker.datatype.number(100),
                repositories: new Array(Number(options["starlists.limit.repositories"])).fill(null).map((_, i) => ({
                  description: !i
                    ? "📊 An image generator with 20+ metrics about your GitHub account such as activity, community, repositories, coding habits, website performances, music played, starred topics, etc. that you can put on your profile or elsewhere !"
                    : faker.lorem.sentence(),
                  name: !i ? "lowlighter/metrics" : `${faker.random.word()}/${faker.random.word()}`,
                })),
              })),
            },
          })
          : null),
        //Repositories
        ...(set.plugins.enabled.repositories
          ? ({
            repositories: {
              list: new Array(Number(options["repositories.featured"].split(",").map(x => x.trim()).length)).fill(null).map((_, i) => ({
                created: faker.date.past(),
                description: faker.lorem.sentence(),
                forkCount: faker.datatype.number(100),
                isFork: faker.datatype.boolean(),
                issues: {
                  totalCount: faker.datatype.number(100),
                },
                nameWithOwner: `${faker.random.word()}/${faker.random.word()}`,
                openGraphImageUrl: faker.internet.url(),
                pullRequests: {
                  totalCount: faker.datatype.number(100),
                },
                stargazerCount: faker.datatype.number(10000),
                licenseInfo: {nickname: null, name: "License"},
                primaryLanguage: {color: faker.internet.color(), name: faker.lorem.word()},
              })),
            },
          })
          : null),
        //Stargazers
        ...(set.plugins.enabled.stargazers
          ? ({
            get stargazers() {
              const dates = []
              let total = faker.datatype.number(1000)
              const result = {
                total: {
                  dates: {},
                  get max() {
                    return Math.max(...dates.map(date => this.dates[date]))
                  },
                  get min() {
                    return Math.min(...dates.map(date => this.dates[date]))
                  },
                },
                increments: {
                  dates: {},
                  get max() {
                    return Math.max(...dates.map(date => this.dates[date]))
                  },
                  get min() {
                    return Math.min(...dates.map(date => this.dates[date]))
                  },
                },
                months: ["", "Jan.", "Feb.", "Mar.", "Apr.", "May", "June", "July", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."],
              }
              for (let d = -14; d <= 0; d++) {
                const date = new Date(Date.now() - d * 24 * 60 * 60 * 1000).toISOString().substring(0, 10)
                dates.push(date)
                result.total.dates[date] = total += result.increments.dates[date] = faker.datatype.number(100)
              }
              return result
            },
          })
          : null),
        //Wakatime
        ...(set.plugins.enabled.wakatime
          ? ({
            get wakatime() {
              const stats = array => {
                const elements = []
                let results = new Array(4 + faker.datatype.number(2)).fill(null).map(_ => ({
                  name: array ? faker.random.arrayElement(array) : faker.random.words(2).replace(/ /g, "-").toLocaleLowerCase(),
                  percent: 0,
                  total_seconds: faker.datatype.number(1000000),
                }))
                let percents = 100
                for (const result of results) {
                  result.percent = 1 + faker.datatype.number(percents - 1)
                  percents -= result.percent
                  result.percent /= 100
                }
                results.filter(({name}) => elements.includes(name) ? false : (elements.push(name), true))
                return results.sort((a, b) => b.percent - a.percent)
              }
              return {
                sections: options["wakatime.sections"].split(",").map(x => x.trim()).filter(x => x),
                days: Number(options["wakatime.days"]) || 7,
                time: {total: faker.datatype.number(100000), daily: faker.datatype.number(24)},
                editors: stats(["VS Code", "Chrome", "IntelliJ", "PhpStorm", "WebStorm", "Android Studio", "Visual Studio", "Sublime Text", "PyCharm", "Vim", "Atom", "Xcode"]),
                languages: stats(["JavaScript", "TypeScript", "PHP", "Java", "Python", "Vue.js", "HTML", "C#", "JSON", "Dart", "SCSS", "Kotlin", "JSX", "Go", "Ruby", "YAML"]),
                projects: stats(),
                os: stats(["Mac", "Windows", "Linux"]),
              }
            },
          })
          : null),
        //Anilist
        ...(set.plugins.enabled.anilist
          ? ({
            anilist: {
              user: {
                stats: {
                  anime: {
                    count: faker.datatype.number(1000),
                    minutesWatched: faker.datatype.number(100000),
                    episodesWatched: faker.datatype.number(10000),
                    genres: new Array(4).fill(null).map(_ => ({genre: faker.lorem.word()})),
                  },
                  manga: {
                    count: faker.datatype.number(1000),
                    chaptersRead: faker.datatype.number(100000),
                    volumesRead: faker.datatype.number(10000),
                    genres: new Array(4).fill(null).map(_ => ({genre: faker.lorem.word()})),
                  },
                },
                genres: new Array(4).fill(null).map(_ => ({genre: faker.lorem.word()})),
              },
              get lists() {
                const media = type => ({
                  name: faker.lorem.words(),
                  type,
                  status: faker.random.arrayElement(["FINISHED", "RELEASING", "NOT_YET_RELEASED", "CANCELLED", "HIATUS"]),
                  release: faker.date.past(20).getFullYear(),
                  genres: new Array(6).fill(null).map(_ => faker.lorem.word()),
                  progress: faker.datatype.number(100),
                  description: faker.lorem.paragraphs(),
                  scores: {user: faker.datatype.number(100), community: faker.datatype.number(100)},
                  released: 100 + faker.datatype.number(1000),
                  artwork: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mOcOnfpfwAGfgLYttYINwAAAABJRU5ErkJggg==",
                })
                const sections = options["anilist.sections"].split(",").map(x => x.trim()).filter(x => x)
                const medias = options["anilist.medias"].split(",").map(x => x.trim()).filter(x => x)
                return {
                  ...(medias.includes("anime")
                    ? {
                      anime: {
                        ...(sections.includes("watching") ? {watching: new Array(Number(options["anilist.limit"]) || 4).fill(null).map(_ => media("ANIME"))} : {}),
                        ...(sections.includes("favorites") ? {favorites: new Array(Number(options["anilist.limit"]) || 4).fill(null).map(_ => media("ANIME"))} : {}),
                      },
                    }
                    : {}),
                  ...(medias.includes("manga")
                    ? {
                      manga: {
                        ...(sections.includes("reading") ? {reading: new Array(Number(options["anilist.limit"]) || 4).fill(null).map(_ => media("MANGA"))} : {}),
                        ...(sections.includes("favorites") ? {favorites: new Array(Number(options["anilist.limit"]) || 4).fill(null).map(_ => media("MANGA"))} : {}),
                      },
                    }
                    : {}),
                }
              },
              characters: new Array(11).fill(null).map(_ => ({
                name: faker.name.findName(),
                artwork: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mOcOnfpfwAGfgLYttYINwAAAABJRU5ErkJggg==",
              })),
              sections: options["anilist.sections"].split(",").map(x => x.trim()).filter(x => x),
            },
          })
          : null),
        //Activity
        ...(set.plugins.enabled.activity
          ? ({
            activity: {
              timestamps: options["activity.timestamps"],
              events: new Array(Number(options["activity.limit"])).fill(null).map(_ =>
                [
                  {
                    type: "push",
                    repo: `${faker.random.word()}/${faker.random.word()}`,
                    size: 1,
                    branch: "master",
                    commits: [{sha: faker.git.shortSha(), message: faker.lorem.sentence()}],
                    timestamp: faker.date.recent(),
                  },
                  {
                    type: "comment",
                    on: "commit",
                    repo: `${faker.random.word()}/${faker.random.word()}`,
                    content: faker.lorem.paragraph(),
                    user: set.user,
                    mobile: null,
                    number: faker.git.shortSha(),
                    title: "",
                    timestamp: faker.date.recent(),
                  },
                  {
                    type: "comment",
                    on: "pr",
                    repo: `${faker.random.word()}/${faker.random.word()}`,
                    content: faker.lorem.sentence(),
                    user: set.user,
                    mobile: null,
                    number: faker.datatype.number(100),
                    title: faker.lorem.sentence(),
                    timestamp: faker.date.recent(),
                  },
                  {
                    type: "comment",
                    on: "issue",
                    repo: `${faker.random.word()}/${faker.random.word()}`,
                    content: faker.lorem.sentence(),
                    user: set.user,
                    mobile: null,
                    number: faker.datatype.number(100),
                    title: faker.lorem.sentence(),
                    timestamp: faker.date.recent(),
                  },
                  {
                    type: "issue",
                    repo: `${faker.random.word()}/${faker.random.word()}`,
                    action: faker.random.arrayElement(["opened", "closed", "reopened"]),
                    user: set.user,
                    number: faker.datatype.number(100),
                    title: faker.lorem.sentence(),
                    timestamp: faker.date.recent(),
                  },
                  {
                    type: "pr",
                    repo: `${faker.random.word()}/${faker.random.word()}`,
                    action: faker.random.arrayElement(["opened", "closed"]),
                    user: set.user,
                    number: faker.datatype.number(100),
                    title: faker.lorem.sentence(),
                    lines: {added: faker.datatype.number(1000), deleted: faker.datatype.number(1000)},
                    files: {changed: faker.datatype.number(10)},
                    timestamp: faker.date.recent(),
                  },
                  {
                    type: "wiki",
                    repo: `${faker.random.word()}/${faker.random.word()}`,
                    pages: [faker.lorem.sentence(), faker.lorem.sentence()],
                    timestamp: faker.date.recent(),
                  },
                  {
                    type: "fork",
                    repo: `${faker.random.word()}/${faker.random.word()}`,
                    timestamp: faker.date.recent(),
                  },
                  {
                    type: "review",
                    repo: `${faker.random.word()}/${faker.random.word()}`,
                    user: set.user,
                    number: faker.datatype.number(100),
                    title: faker.lorem.sentence(),
                    timestamp: faker.date.recent(),
                  },
                  {
                    type: "release",
                    repo: `${faker.random.word()}/${faker.random.word()}`,
                    action: "published",
                    name: faker.random.words(4),
                    draft: faker.datatype.boolean(),
                    prerelease: faker.datatype.boolean(),
                    timestamp: faker.date.recent(),
                  },
                  {
                    type: "ref/create",
                    repo: `${faker.random.word()}/${faker.random.word()}`,
                    ref: {name: faker.lorem.slug(), type: faker.random.arrayElement(["tag", "branch"])},
                    timestamp: faker.date.recent(),
                  },
                  {
                    type: "ref/delete",
                    repo: `${faker.random.word()}/${faker.random.word()}`,
                    ref: {name: faker.lorem.slug(), type: faker.random.arrayElement(["tag", "branch"])},
                    timestamp: faker.date.recent(),
                  },
                  {
                    type: "member",
                    repo: `${faker.random.word()}/${faker.random.word()}`,
                    user: set.user,
                    timestamp: faker.date.recent(),
                  },
                  {
                    type: "public",
                    repo: `${faker.random.word()}/${faker.random.word()}`,
                    timestamp: faker.date.recent(),
                  },
                  {
                    type: "star",
                    repo: `${faker.random.word()}/${faker.random.word()}`,
                    action: "started",
                    timestamp: faker.date.recent(),
                  },
                ][Math.floor(Math.random() * 15)]
              ),
            },
          })
          : null),
        //Isocalendar
        ...(set.plugins.enabled.isocalendar
          ? ({
            isocalendar: {
              streak: {max: 30 + faker.datatype.number(20), current: faker.datatype.number(30)},
              max: 10 + faker.datatype.number(40),
              average: faker.datatype.float(10),
              svg: await staticPlaceholder(set.plugins.enabled.isocalendar, `isocalendar.${options["isocalendar.duration"]}.svg`),
              duration: options["isocalendar.duration"],
            },
          })
          : null),
        //Calendar
        ...(set.plugins.enabled.calendar
          ? ({
            calendar: {
              years: new Array(options["calendar.years"] || 2).fill(0).map((_, index) => ({
                year: new Date().getFullYear() - index,
                weeks: new Array(53).fill(0).map(() => ({
                  contributionDays: new Array(7).fill(0).map(() => ({
                    contributionCount: faker.datatype.number(10),
                    color: faker.random.arrayElement(["#ebedf0", "#ebedf0", "#ebedf0", "#ebedf0", "#ebedf0", "#ebedf0", "#9be9a8", "#9be9a8", "#9be9a8", "#40c463", "#40c463", "#30a14e", "#216e39"]),
                    date: faker.date.past(365),
                  })),
                })),
              })),
            },
          })
          : null),
        //Support
        ...(set.plugins.enabled.support
          ? ({
            support: {
              stats: {solutions: faker.datatype.number(100), posts: faker.datatype.number(1000), topics: faker.datatype.number(1000), received: faker.datatype.number(1000), hearts: faker.datatype.number(1000)},
              badges: {uniques: [], multiples: [], count: faker.datatype.number(1000)},
            },
          })
          : null),
        //Screenshot
        ...(set.plugins.enabled.screenshot
          ? ({
            screenshot: {
              image: "/.placeholders/screenshot.png",
              title: options["screenshot.title"],
              height: 440,
              width: 454,
            },
          })
          : null),
        //Skyline
        ...(set.plugins.enabled.skyline
          ? ({
            skyline: {
              animation: "/.placeholders/skyline.png",
              width: 454,
              height: 284,
              compatibility: false,
            },
          })
          : null),
        //Stackoverflow
        ...(set.plugins.enabled.stackoverflow
          ? ({
            stackoverflow: {
              sections: options["stackoverflow.sections"].split(",").map(x => x.trim()).filter(x => x),
              lines: options["stackoverflow.lines"],
              user: {
                reputation: faker.datatype.number(100000),
                badges: faker.datatype.number(1000),
                questions: faker.datatype.number(1000),
                answers: faker.datatype.number(1000),
                comments: faker.datatype.number(1000),
                views: faker.datatype.number(1000),
              },
              "answers-top": new Array(options["stackoverflow.limit"]).fill(null).map(_ => ({
                type: "answer",
                body: faker.lorem.paragraphs(),
                score: faker.datatype.number(1000),
                upvotes: faker.datatype.number(1000),
                downvotes: faker.datatype.number(1000),
                accepted: faker.datatype.boolean(),
                comments: faker.datatype.number(1000),
                author: set.user,
                created: "01/01/1970",
                link: null,
                id: faker.datatype.number(100000),
                question_id: faker.datatype.number(100000),
                question: {
                  title: faker.lorem.sentence(),
                  tags: [faker.lorem.slug(), faker.lorem.slug()],
                },
              })),
              get ["answers-recent"]() {
                return this["answers-top"]
              },
              "questions-top": new Array(options["stackoverflow.limit"]).fill(null).map(_ => ({
                type: "question",
                title: faker.lorem.sentence(),
                body: faker.lorem.paragraphs(),
                score: faker.datatype.number(1000),
                upvotes: faker.datatype.number(1000),
                downvotes: faker.datatype.number(1000),
                favorites: faker.datatype.number(1000),
                tags: [faker.lorem.slug(), faker.lorem.slug()],
                answered: faker.datatype.boolean(),
                answers: faker.datatype.number(1000),
                comments: faker.datatype.number(1000),
                views: faker.datatype.number(1000),
                author: set.user,
                created: "01/01/1970",
                link: null,
                id: faker.datatype.number(100000),
                accepted_answer_id: faker.datatype.number(100000),
                answer: null,
              })),
              get ["questions-recent"]() {
                return this["questions-top"]
              },
            },
          })
          : null),
      },
    }
    //Formatters
    data.f.bytes = function(n) {
      for (const {u, v} of [{u: "E", v: 10 ** 18}, {u: "P", v: 10 ** 15}, {u: "T", v: 10 ** 12}, {u: "G", v: 10 ** 9}, {u: "M", v: 10 ** 6}, {u: "k", v: 10 ** 3}]) {
        if (n / v >= 1)
          return `${(n / v).toFixed(2).substr(0, 4).replace(/[.]0*$/, "")} ${u}B`
      }
      return `${n} byte${n > 1 ? "s" : ""}`
    }
    data.f.percentage = function(n, {rescale = true} = {}) {
      return `${
        (n * (rescale ? 100 : 1)).toFixed(2)
          .replace(/[.]([1-9]*)(0+)$/, (m, a, b) => `.${a}`)
          .replace(/[.]$/, "")
      }%`
    }
    data.f.ellipsis = function(text, {length = 20} = {}) {
      text = `${text}`
      if (text.length < length)
        return text
      return `${text.substring(0, length)}…`
    }
    data.f.date = function(string, options) {
      if (options.date) {
        delete options.date
        Object.assign(options, {day: "numeric", month: "short", year: "numeric"})
      }
      if (options.time) {
        delete options.time
        Object.assign(options, {hour: "2-digit", minute: "2-digit", second: "2-digit"})
      }
      return new Intl.DateTimeFormat("en-GB", options).format(new Date(string))
    }
    data.f.license = function(text) {
      return text?.name ?? text
    }
    //Render
    return await ejs.render(image, data, {async: true, rmWhitespace: true})
  }
  //Reset globals contexts
  globalThis.placeholder.init = function(globals) {
    axios = globals.axios || axios
    faker = globals.faker || faker
    ejs = globals.ejs || ejs
  }
})()
