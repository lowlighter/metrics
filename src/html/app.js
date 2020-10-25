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
              "base.header":"Header",
              "base.activity":"Account activity",
              "base.community":"Community stats",
              "base.repositories":"Repositories metrics",
              "base.metadata":"Metadata",
            },
            options:{},
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
              //Load template
                const template = this.templates.selected
                if (!this.templates.loaded[template]) {
                  const {data:{image, style, fonts}} = await axios.get(`/placeholder.svg?template=${template}`)
                  this.templates.loaded[template] = {image, style, fonts}
                }
                const {image = "", style = "", fonts = ""} = this.templates.loaded[this.templates.selected] || {}
                if (!image)
                  return this.templates.placeholder = "#"
              //Proxifier
                const proxify = (target) => typeof target === "object" ? new Proxy(target, {
                  get(target, property) {
                    //Primitive conversion
                      if (property === Symbol.toPrimitive)
                        return () => "##"
                    //Iterables
                      if (property === Symbol.iterator)
                        return Reflect.get(target, property)
                    //Plugins should not be proxified by default as they can be toggled by user
                      if (/^plugins$/.test(property))
                        return Reflect.get(target, property)
                    //Consider no errors on plugins
                      if (/^error/.test(property))
                        return undefined
                    //Proxify recursively
                    return proxify(property in target ? Reflect.get(target, property) : {})
                  }
                }) : target
              //Placeholder data
                const data = {
                  style,
                  fonts,
                  s(_, letter) { return letter === "y" ? "ies" : "s" },
                  base:this.plugins.enabled.base,
                  meta:{version:"0.0.0", author:"lowlighter", placeholder:true},
                  user:proxify({name:`############`, websiteUrl:`########################`}),
                  computed:proxify({
                    avatar:"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mOcOnfpfwAGfgLYttYINwAAAABJRU5ErkJggg==",
                    registration:"## years ago",
                    calendar:new Array(14).fill({color:"#ebedf0"}),
                    licenses:{favorite:`########`},
                    plugins:Object.fromEntries(Object.entries(this.plugins.enabled).filter(([key, enabled]) => (key !== "base")&&(enabled)).map(([key]) => {
                      return [key, proxify({
                        music:{provider:"########", tracks:new Array(4).fill({name:"##########", artist:"######", artwork:"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mOcOnfpfwAGfgLYttYINwAAAABJRU5ErkJggg=="})},
                        pagespeed:{scores:["Performance", "Accessibility", "Best Practices", "SEO"].map(title => ({title, score:NaN}))},
                        followup:{issues:{count:0}, pr:{count:0}},
                        habits:{indents:{style:`########`}},
                        languages:{favorites:new Array(7).fill(null).map((_, x) => ({x, name:`######`, color:"#ebedf0", value:1/(x+1)}))},
                      }[key]||{})]
                    })),
                    token:{scopes:[]},
                  }),
                }
              //Render placeholder
                this.templates.placeholder = this.serialize(ejs.render(image, data))
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