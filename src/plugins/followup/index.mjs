//Setup
  export default function ({login, data, computed, pending, q}, {enabled = false} = {}) {
    //Check if plugin is enabled and requirements are met
      if (!enabled)
        return computed.plugins.followup = null
      if (!q.followup)
        return computed.plugins.followup = null
      console.debug(`metrics/compute/${login}/plugins > followup`)

    //Plugin execution
      pending.push(new Promise(async solve => {
        try {
          //Define getters
            const followup = {
              issues:{
                get count() { return this.open + this.closed },
                get open() { return computed.repositories.issues_open },
                get closed() { return computed.repositories.issues_closed },
              },
              pr:{
                get count() { return this.open + this.merged },
                get open() { return computed.repositories.pr_open },
                get merged() { return computed.repositories.pr_merged }
              }
            }
          //Save results
            computed.plugins.followup = followup
            console.debug(`metrics/compute/${login}/plugins > followup > success`)
            console.debug(JSON.stringify(computed.plugins.followup))
            solve()
        }
        catch (error) {
          //Generic error
            computed.plugins.followup = {error:`An error occured`}
            console.debug(`metrics/compute/${login}/plugins > followup > error`)
            console.debug(error)
            solve()
        }
      }))
  }