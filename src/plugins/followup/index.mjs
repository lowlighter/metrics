//Setup
  export default async function ({computed, q}, {enabled = false} = {}) {
    //Plugin execution
      try {
        //Check if plugin is enabled and requirements are met
          if ((!enabled)||(!q.followup))
            return null
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
        //Results
          return followup
      }
    //Handle errors
      catch (error) {
        throw {error:{message:"An error occured", instance:error}}
      }
  }