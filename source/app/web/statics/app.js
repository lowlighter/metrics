;(async function() {
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
      tab: "overview",
      palette: "light",
      clipboard: null,
      requests: {rest: {limit: 0, used: 0, remaining: 0, reset: NaN}, graphql: {limit: 0, used: 0, remaining: 0, reset: NaN}},
      cached: new Map(),

      hosted: null,
    },
    //Computed data
    computed: {
      //Is in preview mode
      preview() {
        return /-preview$/.test(this.version)
      },
    },
  })
})()
