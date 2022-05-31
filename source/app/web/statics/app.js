;(async function() {
  //Init
  const {data: metadata} = await axios.get("/.plugins.metadata")
  delete metadata.core.web.output
  delete metadata.core.web.twemojis
  //App
  return new Vue({
    //Initialization
    el: "main",
    async mounted() {
      //Interpolate config from browser
      try {
        this.config.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
        this.palette = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      }
      catch (error) {}
      //Init
      await Promise.all([
        //GitHub limit tracker
        (async () => {
          const {data: requests} = await axios.get("/.requests")
          this.requests = requests
        })(),
        //Templates
        (async () => {
          const {data: templates} = await axios.get("/.templates")
          templates.sort((a, b) => (a.name.startsWith("@") ^ b.name.startsWith("@")) ? (a.name.startsWith("@") ? 1 : -1) : a.name.localeCompare(b.name))
          this.templates.list = templates
          this.templates.selected = templates[0]?.name || "classic"
        })(),
        //Plugins
        (async () => {
          const {data: plugins} = await axios.get("/.plugins")
          this.plugins.list = plugins.filter(({name}) => metadata[name]?.supports.includes("user") || metadata[name]?.supports.includes("organization"))
          const categories = [...new Set(this.plugins.list.map(({category}) => category))]
          this.plugins.categories = Object.fromEntries(categories.map(category => [category, this.plugins.list.filter(value => category === value.category)]))
        })(),
        //Base
        (async () => {
          const {data: base} = await axios.get("/.plugins.base")
          this.plugins.base = base
          this.plugins.enabled.base = Object.fromEntries(base.map(key => [key, true]))
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
      //Generate placeholder
      this.mock({timeout: 200})
      setInterval(() => {
        const marker = document.querySelector("#metrics-end")
        if (marker) {
          this.mockresize()
          marker.remove()
        }
      }, 100)
    },
    components: {Prism: PrismComponent},
    //Watchers
    watch: {
      tab: {
        immediate: true,
        handler(current) {
          if (current === "action")
            this.clipboard = new ClipboardJS(".copy-action")
          else
            this.clipboard?.destroy()
        },
      },
      palette: {
        immediate: true,
        handler(current, previous) {
          document.querySelector("body").classList.remove(previous)
          document.querySelector("body").classList.add(current)
        },
      },
    },
    //Data initialization
    data: {
      version: "",
      user: "",
      mode: "metrics",
      tab: "overview",
      palette: "light",
      clipboard: null,
      requests: {rest: {limit: 0, used: 0, remaining: 0, reset: NaN}, graphql: {limit: 0, used: 0, remaining: 0, reset: NaN}},
      cached: new Map(),
      config: Object.fromEntries(Object.entries(metadata.core.web).map(([key, {defaulted}]) => [key, defaulted])),
      metadata: Object.fromEntries(Object.entries(metadata).map(([key, {web}]) => [key, web])),
      hosted: null,
      docs: {
        overview: {
          link: "https://github.com/lowlighter/metrics#-documentation",
          name: "Complete documentation",
        },
        markdown: {
          link: "https://github.com/lowlighter/metrics/blob/master/.github/readme/partials/documentation/setup/shared.md",
          name: "Setup using the shared instance",
        },
        action: {
          link: "https://github.com/lowlighter/metrics/blob/master/.github/readme/partials/documentation/setup/action.md",
          name: "Setup using GitHub Action on a profile repository",
        },
      },
      plugins: {
        base: {},
        list: [],
        categories: [],
        enabled: {},
        descriptions: {
          base: "🗃️ Base content",
          "base.header": "Header",
          "base.activity": "Account activity",
          "base.community": "Community stats",
          "base.repositories": "Repositories metrics",
          "base.metadata": "Metadata",
          ...Object.fromEntries(Object.entries(metadata).map(([key, {name}]) => [key, name])),
        },
        options: {
          descriptions: {...(Object.assign({}, ...Object.entries(metadata).flatMap(([key, {web}]) => web)))},
          ...(Object.fromEntries(
            Object.entries(
              Object.assign({}, ...Object.entries(metadata).flatMap(([key, {web}]) => web)),
            )
              .map(([key, {defaulted}]) => [key, defaulted]),
          )),
        },
      },
      templates: {
        list: [],
        selected: "classic",
        placeholder: {
          timeout: null,
          image: "",
        },
        descriptions: {
          classic: "Classic template",
          terminal: "Terminal template",
          markdown: "(hidden)",
          repository: "(hidden)",
        },
      },
      generated: {
        pending: false,
        content: "",
        error: false,
      },
    },
    //Computed data
    computed: {
      //Unusable plugins
      unusable() {
        return this.plugins.list.filter(({name}) => this.plugins.enabled[name]).filter(({enabled}) => !enabled).map(({name}) => name)
      },
      //User's avatar
      avatar() {
        return this.generated.content ? `https://github.com/${this.user}.png` : null
      },
      //User's repository
      repo() {
        return `https://github.com/${this.user}/${this.user}`
      },
      //Endpoint to use for computed metrics
      url() {
        //Plugins enabled
        const plugins = Object.entries(this.plugins.enabled)
          .flatMap(([key, value]) => key === "base" ? Object.entries(value).map(([key, value]) => [`base.${key}`, value]) : [[key, value]])
          .filter(([key, value]) => /^base[.]\w+$/.test(key) ? !value : value)
          .map(([key, value]) => `${key}=${+value}`)
        //Plugins options
        const options = Object.entries(this.plugins.options)
          .filter(([key, value]) => `${value}`.length)
          .filter(([key, value]) => this.plugins.enabled[key.split(".")[0]])
          .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        //Base options
        const base = Object.entries(this.plugins.options).filter(([key, value]) => (key in metadata.base.web) && (value !== metadata.base.web[key]?.defaulted)).map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        //Config
        const config = Object.entries(this.config).filter(([key, value]) => (value) && (value !== metadata.core.web[key]?.defaulted)).map(([key, value]) => `config.${key}=${encodeURIComponent(value)}`)
        //Template
        const template = (this.templates.selected !== this.templates.list[0]) ? [`template=${this.templates.selected}`] : []
        //Generated url
        const params = [...template, ...base, ...plugins, ...options, ...config].join("&")
        return `${window.location.protocol}//${window.location.host}/${this.user}${params.length ? `?${params}` : ""}`
      },
      //Embedded generated code
      embed() {
        return `![Metrics](${this.url})`
      },
      //Token scopes
      scopes() {
        return new Set([
          ...Object.entries(this.plugins.enabled).filter(([key, value]) => (key !== "base") && (value)).flatMap(([key]) => metadata[key].scopes),
          ...(Object.entries(this.plugins.enabled.base).filter(([key, value]) => value).length ? metadata.base.scopes : []),
        ])
      },
      //GitHub action auto-generated code
      action() {
        return [
          `# Visit https://github.com/lowlighter/metrics/blob/master/action.yml for full reference`,
          `name: Metrics`,
          `on:`,
          `  # Schedule updates (each hour)`,
          `  schedule: [{cron: "0 * * * *"}]`,
          `  # Lines below let you run workflow manually and on each commit`,
          `  workflow_dispatch:`,
          `  push: {branches: ["master", "main"]}`,
          `jobs:`,
          `  github-metrics:`,
          `    runs-on: ubuntu-latest`,
          `    permissions:`,
          `      contents: write`,
          `    steps:`,
          `      - uses: lowlighter/metrics@latest`,
          `        with:`,
          ...(this.scopes.size
            ? [
              `          # Your GitHub token`,
              `          # The following scopes are required:`,
              ...[...this.scopes].map(scope => `          #  - ${scope}${scope === "public_access" ? " (default scope)" : ""}`),
              `          # The following additional scopes may be required:`,
              `          #  - read:org      (for organization related metrics)`,
              `          #  - read:user     (for user related data)`,
              `          #  - read:packages (for some packages related data)`,
              `          #  - repo          (optional, if you want to include private repositories)`,
            ]
            : [
              `          # Current configuration doesn't require a GitHub token`,
            ]),
          `          token: ${this.scopes.size ? `${"$"}{{ secrets.METRICS_TOKEN }}` : "NOT_NEEDED"}`,
          ``,
          `          # Options`,
          `          user: ${this.user}`,
          `          template: ${this.templates.selected}`,
          `          base: ${Object.entries(this.plugins.enabled.base).filter(([key, value]) => value).map(([key]) => key).join(", ") || '""'}`,
          ...[
            ...Object.entries(this.plugins.options).filter(([key, value]) => (key in metadata.base.web) && (value !== metadata.base.web[key]?.defaulted)).map(([key, value]) => `          ${key.replace(/[.]/g, "_")}: ${typeof value === "boolean" ? {true: "yes", false: "no"}[value] : value}`),
            ...Object.entries(this.plugins.enabled).filter(([key, value]) => (key !== "base") && (value)).map(([key]) => `          plugin_${key}: yes`),
            ...Object.entries(this.plugins.options).filter(([key, value]) => (value) && (!(key in metadata.base.web))).filter(([key, value]) => this.plugins.enabled[key.split(".")[0]]).map(([key, value]) => `          plugin_${key.replace(/[.]/g, "_")}: ${typeof value === "boolean" ? {true: "yes", false: "no"}[value] : value}`),
            ...Object.entries(this.config).filter(([key, value]) => (value) && (value !== metadata.core.web[key]?.defaulted)).map(([key, value]) => `          config_${key.replace(/[.]/g, "_")}: ${typeof value === "boolean" ? {true: "yes", false: "no"}[value] : value}`),
          ].sort(),
        ].join("\n")
      },
      //Configurable plugins
      configure() {
        //Check enabled plugins
        const enabled = Object.entries(this.plugins.enabled).filter(([key, value]) => (value) && (key !== "base")).map(([key, value]) => key)
        const filter = new RegExp(`^(?:${enabled.join("|")})[.]`)
        //Search related options
        const entries = Object.entries(this.plugins.options.descriptions).filter(([key, value]) => (filter.test(key)) && (!(key in metadata.base.web)))
        entries.push(...enabled.map(key => [key, this.plugins.descriptions[key]]))
        entries.sort((a, b) => a[0].localeCompare(b[0]))
        //Return object
        const configure = Object.fromEntries(entries)
        return Object.keys(configure).length ? configure : null
      },
      //Is in preview mode
      preview() {
        return /-preview$/.test(this.version)
      },
      //Rate limit reset
      rlreset() {
        const reset = new Date(Math.max(this.requests.graphql.reset, this.requests.rest.reset))
        return `${reset.getHours()}:${reset.getMinutes()}`
      },
    },
    //Methods
    methods: {
      //Refresh computed properties
      async refresh() {
        const keys = {action: ["scopes", "action"], markdown: ["url", "embed"]}[this.tab]
        if (keys) {
          for (const key of keys)
            this._computedWatchers[key]?.run()
          this.$forceUpdate()
        }
      },
      //Load and render placeholder image
      async mock({timeout = 600} = {}) {
        this.refresh()
        clearTimeout(this.templates.placeholder.timeout)
        this.templates.placeholder.timeout = setTimeout(async () => {
          this.templates.placeholder.image = await placeholder(this)
          this.generated.content = ""
          this.generated.error = null
        }, timeout)
      },
      //Resize mock image
      mockresize() {
        const svg = document.querySelector(".preview .image svg")
        if ((svg) && (svg.getAttribute("height") == 99999)) {
          const height = svg.querySelector("#metrics-end")?.getBoundingClientRect()?.y - svg.getBoundingClientRect()?.y
          if (Number.isFinite(height))
            svg.setAttribute("height", height)
        }
      },
      //Generate metrics and flush cache
      async generate() {
        //Avoid requests spamming
        if (this.generated.pending)
          return
        this.generated.pending = true
        //Compute metrics
        try {
          await axios.get(`/.uncache?&token=${(await axios.get(`/.uncache?user=${this.user}`)).data.token}`)
          this.generated.content = (await axios.get(this.url)).data
          this.generated.error = null
        }
        catch (error) {
          this.generated.error = {code: error.response.status, message: error.response.data}
        }
        finally {
          this.generated.pending = false
          try {
            const {data: requests} = await axios.get("/.requests")
            this.requests = requests
          }
          catch {}
        }
      },
    },
  })
})()
