;(async function() {
  //App
  return new Vue({
    //Initialization
    el: "main",
    async mounted() {
      //Palette
      try {
        this.palette = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
        if (localStorage.getItem("session.metrics")) {
          this.session = localStorage.getItem("session.metrics")
          axios.defaults.headers.common["x-metrics-session"] = localStorage.getItem("session.metrics")
        }
      }
      catch (error) {}
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
        //OAuth
        (async () => {
          const {data: enabled} = await axios.get("/.oauth/enabled")
          this.oauth = enabled
        })(),
        //OAuth
        (async () => {
          const {data: extras} = await axios.get("/.extras.logged")
          this.extras = extras
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
    //Computed properties
    computed: {
      params() {
        return new URLSearchParams({from: new URLSearchParams(location.search).get("from"), scopes: this.scopes.join(" ")})
      },
      preview() {
        return /-preview$/.test(this.version)
      },
      beta() {
        return /-beta$/.test(this.version)
      },
    },
    //Data initialization
    data: {
      version: "",
      hosted: null,
      requests: {rest: {limit: 0, used: 0, remaining: 0, reset: NaN}, graphql: {limit: 0, used: 0, remaining: 0, reset: NaN}, search: {limit: 0, used: 0, remaining: 0, reset: NaN}},
      palette: "light",
      oauth: false,
      scopes: [],
      extras: [],
      session: null,
    },
  })
})()
