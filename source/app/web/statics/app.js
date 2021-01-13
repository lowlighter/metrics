;(async function() {
  //Init
    const {data:templates} = await axios.get("/.templates")
    const {data:plugins} = await axios.get("/.plugins")
    const {data:base} = await axios.get("/.plugins.base")
    const {data:version} = await axios.get("/.version")
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
            setInterval(async function () {
              const {data:requests} = await axios.get("/.requests")
              this.requests = requests
            }, 15*1000)
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
          config:{
            timezone:"",
            animated:true,
          },
          plugins:{
            base,
            list:plugins,
            enabled:{base:Object.fromEntries(base.map(key => [key, true]))},
            descriptions:{
              pagespeed:"⏱️ Website performances",
              languages:"🈷️ Most used languages",
              followup:"🎟️ Issues and pull requests",
              traffic:"🧮 Pages views",
              lines:"👨‍💻 Lines of code changed",
              habits:"💡 Coding habits",
              music:"🎼 Music plugin",
              posts:"✒️ Recent posts",
              isocalendar:"📅 Isometric commit calendar",
              gists:"🎫 Gists metrics",
              topics:"📌 Starred topics",
              projects:"🗂️ Projects",
              tweets:"🐤 Latest tweets",
              stars:"🌟 Recently starred repositories",
              stargazers:"✨ Stargazers over last weeks",
              activity:"📰 Recent activity",
              people:"🧑‍🤝‍🧑 Followers and followed",
              "base.header":"Header",
              "base.activity":"Account activity",
              "base.community":"Community stats",
              "base.repositories":"Repositories metrics",
              "base.metadata":"Metadata",
              options:{

              }
            },
            options:{
              "languages.ignored":"",
              "languages.skipped":"",
              "pagespeed.detailed":false,
              "pagespeed.screenshot":false,
              "habits.from":200,
              "habits.days":14,
              "habits.facts":true,
              "habits.charts":false,
              "music.playlist":"",
              "music.limit":4,
              "posts.limit":4,
              "posts.user":"",
              "posts.source":"dev.to",
              "isocalendar.duration":"half-year",
              "projects.limit":4,
              "projects.repositories":"",
              "topics.mode":"starred",
              "topics.sort":"stars",
              "topics.limit":12,
              "tweets.limit":2,
              "tweets.user":"",
              "stars.limit":4,
              "activity.limit":5,
              "activity.days":14,
              "activity.filter":"all",
              "people.size":28,
              "people.limit":28,
              "people.types":"followers, following",
              "people.identicons":false,
            },
          },
          templates:{
            list:templates,
            selected:templates[0]?.name||"classic",
            placeholder:"",
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
              return `https://github.com/lowlighter.png`
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
                `  # Schedule updates`,
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
            }
        },
      //Methods
        methods:{
          //Load and render placeholdimage
            async load() {
              //Render placeholder
                this.templates.placeholder = ""//await placeholder(this)
                this.generated.content = ""
                this.generated.error = false
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