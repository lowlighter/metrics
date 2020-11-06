;(async function() {
  //Init
    const url = new URLSearchParams(window.location.search)
    const {data:templates} = await axios.get("/templates.list")
    const {data:plugins} = await axios.get("/plugins.list")
    const {data:base} = await axios.get("/plugins.base.parts.list")
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
          user:url.get("user") || "",
          palette:url.get("palette") || "light",
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
              selfskip:"Skip metrics commits",
              music:"Music plugin",
              posts:"Recent posts",
              isocalendar:"Isometric commit calendar",
              gists:"Gists metrics",
              "base.header":"Header",
              "base.activity":"Account activity",
              "base.community":"Community stats",
              "base.repositories":"Repositories metrics",
              "base.metadata":"Metadata",
            },
            options:{
              "habits.from":100,
              "music.playlist":"",
              "music.mode":"playlist",
              "music.limit":4,
              "posts.limit":4,
              "posts.source":"dev.to",
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
              return `[![GitHub metrics](${this.url})](https://github.com/lowlighter/metrics)`
            },
          //GitHub action auto-generated code
            action() {
              return [
                `# Visit https://github.com/lowlighter/metrics for full reference`,
                `name: GitHub metrics as SVG image`,
                `on:`,
                `  schedule: [{cron: "0 * * * *"}]`,
                `  push: {branches: "master"}`,
                `jobs:`,
                `  github-metrics:`,
                `    runs-on: ubuntu-latest`,
                `    steps:`,
                `      - uses: lowlighter/metrics@latest`,
                `        with:`,
                `          # Setup a personal token in your secrets.`,
                `          token: ${"$"}{{ secrets.METRICS_TOKEN }}`,
                `          # You can also setup a bot token for commits`,
                `          # committer_token: ${"$"}{{ secrets.METRICS_BOT_TOKEN }}`,
                ``,
                `          # Options`,
                `          user: ${this.user }`,
                `          template: ${this.templates.selected}`,
                `          base: ${Object.keys(this.plugins.enabled.base).join(", ") }`,
                ...Object.entries(this.plugins.enabled).filter(([key, value]) => (key !== "base")&&(value)).map(([key]) => `          plugin_${key}: yes`)
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
            },
          //Generate metrics and flush cache
            async generate() {
              //Avoid requests spamming
                if (this.generated.pending)
                  return
                this.generated.pending = true
              //Compute metrics
                try {
                  await axios.get(`/action.flush?&token=${(await axios.get(`/action.flush?user=${this.user}`)).data.token}`)
                  this.generated.content = this.serialize((await axios.get(this.url)).data)
                } catch {
                  this.generated.error = true
                }
                finally {
                  this.generated.pending = false
                }
            },
          //Serialize svg
            serialize(svg) {
              return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`
            },
        },
    })
})()