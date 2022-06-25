;(async function() {
  //App
  return new Vue({
    //Initialization
    el: "main",
    async mounted() {
      //Palette
      try {
        this.palette = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      }
      catch (error) {}
      //Embed
      this.embed = !!(new URLSearchParams(location.search).get("embed"))
      //From local storage
      this.localstorage = !!(new URLSearchParams(location.search).get("localstorage"))
      //User
      const user = location.pathname.split("/").pop()
      if ((user) && (user !== "about")) {
        this.user = user
        await this.search()
      }
      else {
        this.searchable = true
      }
      //Init
      await Promise.all([
        //GitHub limit tracker
        (async () => {
          const {data: requests} = await axios.get("/.requests")
          this.requests = requests
        })(),
        //Version
        (async () => {
          const {data: version} = await axios.get("/.version")
          this.version = `v${version}`
        })(),
        //Hosted
        (async () => {
          const {data: hosted} = await axios.get("/.hosted")
          this.hosted = hosted
        })(),
      ])
    },
    //Watchers
    watch: {
      palette: {
        immediate: true,
        handler(current, previous) {
          document.querySelector("body").classList.remove(previous)
          document.querySelector("body").classList.add(current)
        },
      },
    },
    //Methods
    methods: {
      format(type, value, options) {
        switch (type) {
          case "plural":
            if (options?.y)
              return (value !== 1) ? "ies" : "y"
            return (value !== 1) ? "s" : ""
          case "number":
            return new Intl.NumberFormat(navigator.lang, options).format(value)
          case "date":
            return new Intl.DateTimeFormat(navigator.lang, options).format(new Date(value))
          case "comment":
            const baseUrl = String.raw`https?:\/\/(?:www\.)?github.com\/([\w.-]+\/[\w.-]+)\/`
            return value
              .replace(
                RegExp(baseUrl + String.raw`(?:issues|pull|discussions)\/(\d+)(?:\?[\w-]+)?(#[\w-]+)?(?=<)`, "g"),
                (_, repo, id, comment) => (options?.repo === repo ? "" : repo) + `#${id}` + (comment ? ` (comment)` : ""),
              ) // -> 'lowlighter/metrics#123'
              .replace(
                RegExp(baseUrl + String.raw`commit\/([\da-f]+)(?=<)`, "g"),
                (_, repo, sha) => (options?.repo === repo ? "" : repo + "@") + sha,
              ) // -> 'lowlighter/metrics@123abc'
              .replace(
                RegExp(baseUrl + String.raw`compare\/([\w-.]+...[\w-.]+)(?=<)`, "g"),
                (_, repo, tags) => (options?.repo === repo ? "" : repo + "@") + tags,
              ) // -> 'lowlighter/metrics@1.0...1.1'
              .replace(
                /(?<!&)#(\d+)/g,
                (_, id) => `<a href="https://github.com/${options?.repo}/issues/${id}">#${id}</a>`,
              ) // -> #123
              .replace(
                /@([-\w]+)/g,
                (_, user) => `<a href="https://github.com/${user}">@${user}</a>`,
              ) // -> @user
        }
        return value
      },
      async search() {
        try {
          this.error = null
          this.metrics = null
          this.pending = true
          if (this.localstorage) {
            this.metrics = JSON.parse(localStorage.getItem("local.metrics") ?? "null")
            this.loaded = ["base", ...Object.keys(this.metrics?.rendered?.plugins ?? {})]
            return
          }
          const {processing, ...data} = (await axios.get(`/about/query/${this.user}`)).data
          if (processing) {
            let completed = 0
            this.progress = 1 / (data.plugins.length + 1)
            this.loaded = []
            const retry = async (plugin, attempts = 60, interval = 10) => {
              if (this.loaded.includes(plugin))
                return
              do {
                try {
                  const {data} = await axios.get(`/about/query/${this.user}/${plugin}`)
                  if (!data)
                    throw new Error(`${plugin}: no data`)
                  if (plugin === "base")
                    this.metrics = {rendered: data, mime: "application/json", errors: []}
                  else
                    Object.assign(this.metrics.rendered.plugins, {[plugin]: data})
                  break
                }
                catch {
                  console.warn(`${plugin}: no data yet, retrying in ${interval} seconds`)
                  await new Promise(solve => setTimeout(solve, interval * 1000))
                }
              } while (--attempts)
              completed++
              this.progress = completed / (data.plugins.length + 1)
              this.loaded.push(plugin)
            }
            await retry("base", 30, 5)
            await Promise.allSettled(data.plugins.map(plugin => retry(plugin)))
          }
          else {
            this.metrics = data
          }
        }
        catch (error) {
          this.error = {code: error.response.status, message: error.response.data}
        }
        finally {
          this.pending = false
          try {
            const {data: requests} = await axios.get("/.requests")
            this.requests = requests
          }
          catch {}
        }
      },
    },
    //Computed properties
    computed: {
      stats() {
        return this.metrics?.rendered.user ?? null
      },
      sponsors() {
        return this.metrics?.rendered.plugins?.sponsors ?? null
      },
      ranked() {
        return this.metrics?.rendered.plugins?.achievements?.list?.filter(({leaderboard}) => leaderboard).sort((a, b) => a.leaderboard.type.localeCompare(b.leaderboard.type)) ?? []
      },
      achievements() {
        return this.metrics?.rendered.plugins?.achievements?.list?.filter(({leaderboard}) => !leaderboard).filter(({title}) => !/(?:automator|octonaut|infographile)/i.test(title)) ?? []
      },
      introduction() {
        return this.metrics?.rendered.plugins?.introduction?.text ?? ""
      },
      followup() {
        return this.metrics?.rendered.plugins?.followup ?? null
      },
      calendar() {
        if (this.metrics?.rendered.plugins?.calendar) {
          return Object.assign(this.metrics?.rendered.plugins?.calendar, {
            color(c) {
              return {
                "#ebedf0": "var(--color-calendar-graph-day-bg)",
                "#9be9a8": "var(--color-calendar-graph-day-L1-bg)",
                "#40c463": "var(--color-calendar-graph-day-L2-bg)",
                "#30a14e": "var(--color-calendar-graph-day-L3-bg)",
                "#216e39": "var(--color-calendar-graph-day-L4-bg)",
              }[c] ?? c
            },
          })
        }
        return null
      },
      isocalendar() {
        return (this.metrics?.rendered.plugins?.isocalendar?.svg ?? "")
          .replace(/#ebedf0/gi, "var(--color-calendar-graph-day-bg)")
          .replace(/#9be9a8/gi, "var(--color-calendar-graph-day-L1-bg)")
          .replace(/#40c463/gi, "var(--color-calendar-graph-day-L2-bg)")
          .replace(/#30a14e/gi, "var(--color-calendar-graph-day-L3-bg)")
          .replace(/#216e39/gi, "var(--color-calendar-graph-day-L4-bg)")
      },
      languages() {
        return Object.assign(this.metrics?.rendered.plugins?.languages?.favorites ?? [], {total: this.metrics?.rendered.plugins?.languages.total})
      },
      reactions() {
        return this.metrics?.rendered.plugins?.reactions ?? null
      },
      repositories() {
        return this.metrics?.rendered.plugins?.repositories?.list ?? []
      },
      stars() {
        return {repositories: this.metrics?.rendered.plugins?.stars?.repositories.map(({node, starredAt}) => ({...node, starredAt})) ?? []}
      },
      topics() {
        return this.metrics?.rendered.plugins?.topics?.list ?? []
      },
      activity() {
        return this.metrics?.rendered.plugins?.activity?.events ?? []
      },
      contributions() {
        return this.metrics?.rendered.plugins?.notable?.contributions ?? []
      },
      account() {
        if (!this.metrics)
          return null
        const {login, name} = this.metrics?.rendered.user
        return {login, name, avatar: this.metrics?.rendered.computed.avatar, type: this.metrics?.rendered.account}
      },
      url() {
        return `${window.location.protocol}//${window.location.host}/about/${this.user}`
      },
      preview() {
        return /-preview$/.test(this.version)
      },
      rlreset() {
        const reset = new Date(Math.max(this.requests.graphql.reset, this.requests.rest.reset))
        return `${reset.getHours()}:${reset.getMinutes()}`
      },
    },
    //Data initialization
    data: {
      version: "",
      hosted: null,
      user: "",
      embed: false,
      localstorage: false,
      searchable: false,
      requests: {rest: {limit: 0, used: 0, remaining: 0, reset: NaN}, graphql: {limit: 0, used: 0, remaining: 0, reset: NaN}},
      palette: "light",
      metrics: null,
      pending: false,
      error: null,
      config: {},
      progress: 0,
      loaded: [],
    },
  })
})()
