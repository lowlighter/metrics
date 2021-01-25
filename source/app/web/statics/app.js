;(async function() {
  //Init
    const {data:templates} = await axios.get("/.templates")
    const {data:plugins} = await axios.get("/.plugins")
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
              people:"🧑‍🤝‍🧑 People",
              anilist:"🌸 Anilist",
              base:"🗃️ Base content",
              "base.header":"Header",
              "base.activity":"Account activity",
              "base.community":"Community stats",
              "base.repositories":"Repositories metrics",
              "base.metadata":"Metadata",
            },
            options:{
              descriptions:{
                "languages.ignored":{text:"Ignored languages", placeholder:"lang-0, lang-1, ..."},
                "languages.skipped":{text:"Skipped repositories", placeholder:"repo-0, repo-1, ..."},
                "languages.colors":{text:"Custom language colors", placeholder:"0:#ff0000, javascript:yellow, ..."},
                "pagespeed.detailed":{text:"Detailed audit", type:"boolean"},
                "pagespeed.screenshot":{text:"Audit screenshot", type:"boolean"},
                "pagespeed.url":{text:"Url", placeholder:"(default to GitHub attached)"},
                "habits.from":{text:"Events to use", type:"number", min:1, max:1000},
                "habits.days":{text:"Max events age", type:"number", min:1, max:30},
                "habits.facts":{text:"Display facts", type:"boolean"},
                "habits.charts":{text:"Display charts", type:"boolean"},
                "music.provider":{text:"Provider", placeholder:"spotify"},
                "music.playlist":{text:"Playlist url", placeholder:"https://embed.music.apple.com/en/playlist/"},
                "music.limit":{text:"Limit", type:"number", min:1, max:100},
                "music.user":{text:"Username", placeholder:"(default to GitHub login)"},
                "posts.limit":{text:"Limit", type:"number", min:1, max:30},
                "posts.user":{text:"Username", placeholder:"(default to GitHub login)"},
                "posts.source":{text:"Source", type:"select", values:["dev.to"]},
                "isocalendar.duration":{text:"Duration", type:"select", values:["half-year", "full-year"]},
                "projects.limit":{text:"Limit", type:"number", min:0, max:100},
                "projects.repositories":{text:"Repositories projects", placeholder:"user/repo/projects/1, ..."},
                "projects.descriptions":{text:"Projects descriptions", type:"boolean"},
                "topics.mode":{text:"Mode", type:"select", values:["starred", "mastered"]},
                "topics.sort":{text:"Sort by", type:"select", values:["starred", "activity", "stars", "random"]},
                "topics.limit":{text:"Limit", type:"number", min:0, max:20},
                "tweets.limit":{text:"Limit", type:"number", min:1, max:10},
                "tweets.user":{text:"Username", placeholder:"(default to GitHub attached)"},
                "stars.limit":{text:"Limit", type:"number", min:1, max:100},
                "activity.limit":{text:"Limit", type:"number", min:1, max:100},
                "activity.days":{text:"Max events age", type:"number", min:1, max:9999},
                "activity.filter":{text:"Events type", placeholder:"all"},
                "people.size":{text:"Limit", type:"number", min:16, max:64},
                "people.limit":{text:"Limit", type:"number", min:1, max:9999},
                "people.types":{text:"Types", placeholder:"followers, following"},
                "people.thanks":{text:"Special thanks", placeholder:"user1, user2, ..."},
                "people.identicons":{text:"Use identicons", type:"boolean"},
                "anilist.medias":{text:"Medias to display", placeholder:"anime, manga"},
                "anilist.sections":{text:"Sections to display", placeholder:"favorites, watching, reading, characters"},
                "anilist.limit":{text:"Limit", type:"number", min:0, max:9999},
                "anilist.shuffle":{text:"Shuffle data", type:"boolean"},
                "anilist.user":{text:"Username", placeholder:"(default to GitHub login)"},
              },
              "languages.ignored":"",
              "languages.skipped":"",
              "pagespeed.detailed":false,
              "pagespeed.screenshot":false,
              "habits.from":200,
              "habits.days":14,
              "habits.facts":true,
              "habits.charts":false,
              "music.provider":"",
              "music.playlist":"",
              "music.limit":4,
              "music.user":"",
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
              "people.thanks":"",
              "people.identicons":false,
              "anilist.medias":"anime, manga",
              "anilist.sections":"favorites",
              "anilist.limit":2,
              "anilist.shuffle":true,
              "anilist.user":"",
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