;(async function() {
  //App
    return new Vue({
      //Initialization
        el:"main",
        async mounted() {
          //Palette
            try {
              this.palette = (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
            } catch (error) {}
          //User
            const user = location.pathname.split("/").pop()
            if ((user)&&(user !== "about")) {
              this.user = user
              await this.search()
            }
            else
              this.searchable = true
          //Embed
            this.embed = !!(new URLSearchParams(location.search).get("embed"))
          //Init
            await Promise.all([
              //GitHub limit tracker
                (async () => {
                  const {data:requests} = await axios.get("/.requests")
                  this.requests = requests
                })(),
              //Version
                (async () => {
                  const {data:version} = await axios.get("/.version")
                  this.version = `v${version}`
                })(),
              //Hosted
                (async () => {
                  const {data:hosted} = await axios.get("/.hosted")
                  this.hosted = hosted
                })(),
            ])
        },
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
      //Methods
        methods:{
          format(type, value, options) {
            switch (type) {
              case "number":
                return new Intl.NumberFormat(navigator.lang, options).format(value)
              case "date":
                return new Intl.DateTimeFormat(navigator.lang, options).format(new Date(value))
            }
            return value
          },
          async search() {
            try {
              this.error = null
              this.metrics = null
              this.pending = true
              this.metrics = (await axios.get(`/about/query/${this.user}`)).data
            }
            catch (error) {
              this.error = {code:error.response.status, message:error.response.data}
            }
            finally {
              this.pending = false
            }
          }
        },
      //Computed properties
        computed:{
          ranked() {
            return this.metrics?.rendered.plugins.achievements.list?.filter(({leaderboard}) => leaderboard).sort((a, b) => a.leaderboard.type.localeCompare(b.leaderboard.type)) ?? []
          },
          achievements() {
            return this.metrics?.rendered.plugins.achievements.list?.filter(({leaderboard}) => !leaderboard).filter(({title}) => !/(?:automater|octonaut|infographile)/i.test(title)) ?? []
          },
          isocalendar() {
            return (this.metrics?.rendered.plugins.isocalendar.svg ?? "")
              .replace(/#ebedf0/gi, "var(--color-calendar-graph-day-bg)")
              .replace(/#9be9a8/gi, "var(--color-calendar-graph-day-L1-bg)")
              .replace(/#40c463/gi, "var(--color-calendar-graph-day-L2-bg)")
              .replace(/#30a14e/gi, "var(--color-calendar-graph-day-L3-bg)")
              .replace(/#216e39/gi, "var(--color-calendar-graph-day-L4-bg)")
          },
          languages() {
            return this.metrics?.rendered.plugins.languages.favorites ?? []
          },
          activity() {
            return this.metrics?.rendered.plugins.activity.events ?? []
          },
          contributions() {
            return this.metrics?.rendered.plugins.notable.contributions ?? []
          },
          account() {
            if (!this.metrics)
              return null
            const {login, name} = this.metrics.rendered.user
            return {login, name, avatar:this.metrics.rendered.computed.avatar, type:this.metrics?.rendered.account}
          },
          url() {
            return `${window.location.protocol}//${window.location.host}/about/${this.user}`
          },
        },
      //Data initialization
        data:{
          version:"",
          hosted:null,
          user:"",
          embed:false,
          searchable:false,
          requests:{limit:0, used:0, remaining:0, reset:0},
          palette:"light",
          metrics:null,
          pending:false,
          error:null,
        }
      })
})()