;(async function() {
  //App
  return new Vue({
    //Initialization
    el: "main",
    async mounted() {
      //Interpolate config from browser
      try {
        this.palette = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
        if (localStorage.getItem("session.metrics"))
          axios.defaults.headers.common["x-metrics-session"] = localStorage.getItem("session.metrics")
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
        //Modes
        (async () => {
          const {data: modes} = await axios.get("/.modes")
          this.modes = modes
        })(),
        //OAuth
        (async () => {
          const {data: enabled} = await axios.get("/.oauth/enabled")
          this.oauth = enabled
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
    //Data initialization
    data: {
      version: "",
      user1: "",
      user2: "",
      palette: "light",
      requests: {rest: {limit: 0, used: 0, remaining: 0, reset: NaN}, graphql: {limit: 0, used: 0, remaining: 0, reset: NaN}, search: {limit: 0, used: 0, remaining: 0, reset: NaN}},
      hosted: null,
      modes: [],
      oauth: false,
    },
    //Computed data
    computed: {
      //URL parameters
      params() {
        return new URLSearchParams({from: location.href})
      },
      //Is in preview mode
      preview() {
        return /-preview$/.test(this.version)
      },
      //Is in beta mode
      beta() {
        return /-beta$/.test(this.version)
      },
      //Rate limit reset
      rlreset() {
        const reset = new Date(Math.max(this.requests.graphql.reset, this.requests.rest.reset))
        return `${reset.getHours()}:${reset.getMinutes()}`
      },
    },
    //Methods
    methods: {
      //Metrics insights
      async insights() {
        window.location.href = `/insights?user=${this.user1}`
      },
      //Metrics embed
      async embed() {
        window.location.href = `/embed?user=${this.user2}`
      },
    },
  })
})()
