;(async function() {
  //Init
    const url = new URLSearchParams(window.location.search)
    const {data:templates} = await axios.get("/.templates")
    const {data:plugins} = await axios.get("/.plugins")
    const {data:base} = await axios.get("/.plugins.base")
    const {data:version} = await axios.get("/.version")
  //App
    return new Vue({
      //Initialization
        el:"main",
        async mounted() {
          await this.load()
        },
        components:{Prism:PrismComponent},
      //Data initialization
        data:{
          version,
          user:url.get("user") || "",
          palette:url.get("palette") || (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") || "light",
          requests:{limit:0, used:0, remaining:0, reset:0},
          plugins:{
            base,
            list:plugins,
            enabled:{base:Object.fromEntries(base.map(key => [key, true]))},
            descriptions:{
              pagespeed:"Website performances",
              languages:"Most used languages",
              followup:"Issues and pull requests",
              traffic:"Pages views",
              lines:"Lines of code changed",
              habits:"Coding habits",
              music:"Music plugin",
              posts:"Recent posts",
              isocalendar:"Isometric commit calendar",
              gists:"Gists metrics",
              topics:"Starred topics",
              projects:"Projects",
              tweets:"Latest tweets",
              "base.header":"Header",
              "base.activity":"Account activity",
              "base.community":"Community stats",
              "base.repositories":"Repositories metrics",
              "base.metadata":"Metadata",
            },
            options:{
              "languages.ignored":"",
              "languages.skipped":"",
              "pagespeed.detailed":false,
              "habits.from":100,
              "habits.days":14,
              "habits.facts":true,
              "habits.charts":false,
              "music.playlist":"",
              "music.limit":4,
              "posts.limit":4,
              "posts.source":"dev.to",
              "isocalendar.duration":"half-year",
              "projects.limit":4,
              "topics.sort":"stars",
              "topics.limit":12,
              "tweets.limit":2,
            },
          },
          templates:{
            list:templates,
            selected:url.get("template") || templates[0],
            loaded:{},
            placeholder:"",
            descriptions:{
              classic:"Classic template",
              terminal:"Terminal template",
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
              //Template
                const template = (this.templates.selected !== templates[0]) ? [`template=${this.templates.selected}`] : []
              //Generated url
                const params = [...template, ...plugins, ...options].join("&")
                return `${window.location.protocol}//${window.location.host}/${this.user}${params.length ? `?${params}` : ""}`
              },
          //Embedded generated code
            embed() {
              return `![GitHub metrics](${this.url})`
            },
          //GitHub action auto-generated code
            action() {
              return [
                `# Visit https://github.com/lowlighter/metrics/blob/master/action.yml for full reference`,
                `name: GitHub metrics`,
                `on:`,
                `  # Schedule updates`,
                `  schedule: [{cron: "0 * * * *"}]`,
                `  push: {branches: "master"}`,
                `jobs:`,
                `  github-metrics:`,
                `    runs-on: ubuntu-latest`,
                `    steps:`,
                `      - uses: lowlighter/metrics@latest`,
                `        with:`,
                `          # You'll need to setup a personal token in your secrets.`,
                `          token: ${"$"}{{ secrets.METRICS_TOKEN }}`,
                `          # GITHUB_TOKEN is a special auto-generated token used for commits`,
                `          committer_token: ${"$"}{{ secrets.GITHUB_TOKEN }}`,
                ``,
                `          # Options`,
                `          user: ${this.user }`,
                `          template: ${this.templates.selected}`,
                `          base: ${Object.entries(this.plugins.enabled.base).filter(([key, value]) => value).map(([key]) => key).join(", ")||'""'}`,
                ...[
                  ...Object.entries(this.plugins.enabled).filter(([key, value]) => (key !== "base")&&(value)).map(([key]) => `          plugin_${key}: yes`),
                  ...Object.entries(this.plugins.options).filter(([key, value]) => value).filter(([key, value]) => this.plugins.enabled[key.split(".")[0]]).map(([key, value]) => `          plugin_${key.replace(/[.]/, "_")}: ${typeof value === "boolean" ? {true:"yes", false:"no"}[value] : value}`)
                ].sort(),
              ].join("\n")
            }
        },
      //Methods
        methods:{
          //Load and render image
            async load() {
              //Render placeholder
                const url = this.url.replace(new RegExp(`${this.user}(\\?|$)`), "placeholder$1")
                this.templates.placeholder = this.serialize((await axios.get(url)).data)
                this.generated.content = ""
              //Start GitHub rate limiter tracker
                this.ghlimit()
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
                  this.generated.content = this.serialize((await axios.get(this.url)).data)
                } catch {
                  this.generated.error = true
                }
                finally {
                  this.generated.pending = false
                }
                this.ghlimit({once:true})
            },
          //Serialize svg
            serialize(svg) {
              return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`
            },
          //Update reate limit requests
            async ghlimit({once = false} = {}) {
              const {data:requests} = await axios.get("/.requests")
              this.requests = requests
              if (!once)
                setTimeout(() => this.ghlimit(), 30*1000)
            }
        },
    })
})()