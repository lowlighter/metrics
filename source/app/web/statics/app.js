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
          //Load instance
            await this.load()
          //Interpolate config from browser
            try {
              this.config.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
            } catch (error) {}
        },
        components:{Prism:PrismComponent},
      //Data initialization
        data:{
          version,
          user:url.get("user") || "",
          tab:"overview",
          palette:url.get("palette") || (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") || "light",
          requests:{limit:0, used:0, remaining:0, reset:0},
          config:{
            timezone:"",
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
              "base.header":`
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16"><path fill-rule="evenodd" d="M0 8a8 8 0 1116 0v5.25a.75.75 0 01-1.5 0V8a6.5 6.5 0 10-13 0v5.25a.75.75 0 01-1.5 0V8zm5.5 4.25a.75.75 0 01.75-.75h3.5a.75.75 0 010 1.5h-3.5a.75.75 0 01-.75-.75zM3 6.75C3 5.784 3.784 5 4.75 5h6.5c.966 0 1.75.784 1.75 1.75v1.5A1.75 1.75 0 0111.25 10h-6.5A1.75 1.75 0 013 8.25v-1.5zm1.47-.53a.75.75 0 011.06 0l.97.97.97-.97a.75.75 0 011.06 0l.97.97.97-.97a.75.75 0 111.06 1.06l-1.5 1.5a.75.75 0 01-1.06 0L8 7.81l-.97.97a.75.75 0 01-1.06 0l-1.5-1.5a.75.75 0 010-1.06z"></path></svg>
                Header`,
              "base.activity":`
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16"><path fill-rule="evenodd" d="M1.5 1.75a.75.75 0 00-1.5 0v12.5c0 .414.336.75.75.75h14.5a.75.75 0 000-1.5H1.5V1.75zm14.28 2.53a.75.75 0 00-1.06-1.06L10 7.94 7.53 5.47a.75.75 0 00-1.06 0L3.22 8.72a.75.75 0 001.06 1.06L7 7.06l2.47 2.47a.75.75 0 001.06 0l5.25-5.25z"></path></svg>
                Account activity`,
              "base.community":`
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16"><path fill-rule="evenodd" d="M1.326 1.973a1.2 1.2 0 011.49-.832c.387.112.977.307 1.575.602.586.291 1.243.71 1.7 1.296.022.027.042.056.061.084A13.22 13.22 0 018 3c.67 0 1.289.037 1.861.108l.051-.07c.457-.586 1.114-1.004 1.7-1.295a9.654 9.654 0 011.576-.602 1.2 1.2 0 011.49.832c.14.493.356 1.347.479 2.29.079.604.123 1.28.07 1.936.541.977.773 2.11.773 3.301C16 13 14.5 15 8 15s-8-2-8-5.5c0-1.034.238-2.128.795-3.117-.08-.712-.034-1.46.052-2.12.122-.943.34-1.797.479-2.29zM8 13.065c6 0 6.5-2 6-4.27C13.363 5.905 11.25 5 8 5s-5.363.904-6 3.796c-.5 2.27 0 4.27 6 4.27z"></path><path d="M4 8a1 1 0 012 0v1a1 1 0 01-2 0V8zm2.078 2.492c-.083-.264.146-.492.422-.492h3c.276 0 .505.228.422.492C9.67 11.304 8.834 12 8 12c-.834 0-1.669-.696-1.922-1.508zM10 8a1 1 0 112 0v1a1 1 0 11-2 0V8z"></path></svg>
                Community stats`,
              "base.repositories":`
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16"><path fill-rule="evenodd" d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z"></path></svg>
                Repositories metrics`,
              "base.metadata":`
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16"><path fill-rule="evenodd" d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8zm6.5-.25A.75.75 0 017.25 7h1a.75.75 0 01.75.75v2.75h.25a.75.75 0 010 1.5h-2a.75.75 0 010-1.5h.25v-2h-.25a.75.75 0 01-.75-.75zM8 6a1 1 0 100-2 1 1 0 000 2z"></path></svg>
                Metadata`,
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
              "posts.source":"dev.to",
              "isocalendar.duration":"half-year",
              "projects.limit":4,
              "projects.repositories":"",
              "topics.mode":"starred",
              "topics.sort":"stars",
              "topics.limit":12,
              "tweets.limit":2,
              "stars.limit":4,
            },
          },
          templates:{
            list:templates,
            selected:url.get("template") || templates[0].name,
            loaded:{},
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
              return `https://github.com/${this.user}.png`
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
                  ...Object.entries(this.plugins.options).filter(([key, value]) => value).filter(([key, value]) => this.plugins.enabled[key.split(".")[0]]).map(([key, value]) => `          plugin_${key.replace(/[.]/, "_")}: ${typeof value === "boolean" ? {true:"yes", false:"no"}[value] : value}`),
                  ...Object.entries(this.config).filter(([key, value]) => value).map(([key, value]) => `          config_${key.replace(/[.]/, "_")}: ${typeof value === "boolean" ? {true:"yes", false:"no"}[value] : value}`),
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