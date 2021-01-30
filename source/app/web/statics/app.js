;(async function() {
  //Init
    const {data:templates} = await axios.get("/.templates")
    const {data:plugins} = await axios.get("/.plugins")
    const {data:metadata} = await axios.get("/.plugins.metadata")
    const {data:base} = await axios.get("/.plugins.base")
    const {data:version} = await axios.get("/.version")
    templates.sort((a, b) => (a.name.startsWith("@") ^ b.name.startsWith("@")) ? (a.name.startsWith("@") ? 1 : -1) : a.name.localeCompare(b.name))
  //App
    return new Vue({
      //Initialization
        el:"main",
        async mounted() {
          //Interpolate config from browser
            try {
              this.config.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
              this.palette = (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
            } catch (error) {}
          //GitHub limit tracker
            const {data:requests} = await axios.get("/.requests")
            this.requests = requests
            setInterval(async () => {
              const {data:requests} = await axios.get("/.requests")
              this.requests = requests
            }, 15000)
          //Generate placeholder
            this.mock({timeout:200})
            setInterval(() => {
              const marker = document.querySelector("#metrics-end")
              if (marker) {
                this.mockresize()
                marker.remove()
              }
            }, 100)
        },
        components:{Prism:PrismComponent},
      //Watchers
        watch:{
          palette:{
            immediate:true,
            handler(current, previous) {
              document.querySelector("body").classList.remove(previous)
              document.querySelector("body").classList.add(current)
            }
          }
        },
      //Data initialization
        data:{
          version,
          user:"",
          tab:"overview",
          palette:"light",
          requests:{limit:0, used:0, remaining:0, reset:0},
          cached:new Map(),
          config:{
            timezone:"",
            animated:true,
          },
          plugins:{
            base,
            list:plugins,
            enabled:{base:Object.fromEntries(base.map(key => [key, true]))},
            descriptions:{
              base:"🗃️ Base content",
              "base.header":"Header",
              "base.activity":"Account activity",
              "base.community":"Community stats",
              "base.repositories":"Repositories metrics",
              "base.metadata":"Metadata",
              ...Object.fromEntries(Object.entries(metadata).map(([key, {name}]) => [key, name]))
            },
            options:{
              descriptions:{...(Object.assign({}, ...Object.entries(metadata).flatMap(([key, {web}]) => web)))},
              ...(Object.fromEntries(Object.entries(
                Object.assign({}, ...Object.entries(metadata).flatMap(([key, {web}]) => web)))
                  .map(([key, {defaulted}]) => [key, defaulted])
              ))
            },
          },
          templates:{
            list:templates,
            selected:templates[0]?.name||"classic",
            placeholder:{
              timeout:null,
              image:""
            },
            descriptions:{
              classic:"Classic template",
              terminal:"Terminal template",
              repository:"(hidden)",
            },
          },
          generated:{
            pending:false,
            content:"",
            error:false,
          },
        },
      //Computed data
        computed:{
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
              //Config
                const config = Object.entries(this.config).filter(([key, value]) => value).map(([key, value]) => `config.${key}=${encodeURIComponent(value)}`)
              //Template
                const template = (this.templates.selected !== templates[0]) ? [`template=${this.templates.selected}`] : []
              //Generated url
                const params = [...template, ...plugins, ...options, ...config].join("&")
                return `${window.location.protocol}//${window.location.host}/${this.user}${params.length ? `?${params}` : ""}`
              },
          //Embedded generated code
            embed() {
              return `![Metrics](${this.url})`
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
                `  push: {branches: ["master", "main"]}`,
                `  workflow_dispatch:`,
                `jobs:`,
                `  github-metrics:`,
                `    runs-on: ubuntu-latest`,
                `    steps:`,
                `      - uses: lowlighter/metrics@latest`,
                `        with:`,
                `          # Your GitHub token`,
                `          token: ${"$"}{{ secrets.METRICS_TOKEN }}`,
                `          # GITHUB_TOKEN is a special auto-generated token restricted to current repository, which is used to push files in it`,
                `          committer_token: ${"$"}{{ secrets.GITHUB_TOKEN }}`,
                ``,
                `          # Options`,
                `          user: ${this.user }`,
                `          template: ${this.templates.selected}`,
                `          base: ${Object.entries(this.plugins.enabled.base).filter(([key, value]) => value).map(([key]) => key).join(", ")||'""'}`,
                ...[
                  ...Object.entries(this.plugins.enabled).filter(([key, value]) => (key !== "base")&&(value)).map(([key]) => `          plugin_${key}: yes`),
                  ...Object.entries(this.plugins.options).filter(([key, value]) => value).filter(([key, value]) => this.plugins.enabled[key.split(".")[0]]).map(([key, value]) => `          plugin_${key.replace(/[.]/, "_")}: ${typeof value === "boolean" ? {true:"yes", false:"no"}[value] : value}`),
                  ...Object.entries(this.config).filter(([key, value]) => value).map(([key, value]) => `          config_${key.replace(/[.]/, "_")}: ${typeof value === "boolean" ? {true:"yes", false:"no"}[value] : value}`),
                ].sort(),
              ].join("\n")
            },
          //Configurable plugins
            configure() {
              //Check enabled plugins
                const enabled = Object.entries(this.plugins.enabled).filter(([key, value]) => (value)&&(key !== "base")).map(([key, value]) => key)
                const filter = new RegExp(`^(?:${enabled.join("|")})[.]`)
              //Search related options
                const entries = Object.entries(this.plugins.options.descriptions).filter(([key, value]) => filter.test(key))
                entries.push(...enabled.map(key => [key, this.plugins.descriptions[key]]))
                entries.sort((a, b) => a[0].localeCompare(b[0]))
              //Return object
                const configure = Object.fromEntries(entries)
                return Object.keys(configure).length ? configure : null
            }
        },
      //Methods
        methods:{
          //Load and render placeholder image
            async mock({timeout = 600} = {}) {
              clearTimeout(this.templates.placeholder.timeout)
              this.templates.placeholder.timeout = setTimeout(async () => {
                this.templates.placeholder.image = await placeholder(this)
                this.generated.content = ""
                this.generated.error = false
              }, timeout)
            },
          //Resize mock image
            mockresize() {
              const svg = document.querySelector(".preview .image svg")
              if (svg) {
                const height = svg.querySelector("#metrics-end")?.getBoundingClientRect()?.y-svg.getBoundingClientRect()?.y
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
                  this.generated.error = false
                } catch {
                  this.generated.error = true
                }
                finally {
                  this.generated.pending = false
                }
            },
        },
    })
})()