//Setup
export default async function({login, data, computed, imports, q, graphql, queries, account}, {enabled = false} = {}) {
  //Plugin execution
  try {
    //Check if plugin is enabled and requirements are met
    if ((!enabled) || (!q.followup))
      return null

    //Load inputs
    let {sections} = imports.metadata.plugins.followup.inputs({data, account, q})

    //Define getters
    const followup = {
      sections,
      issues:{
        get count() {
          return this.open + this.closed
        },
        get open() {
          return computed.repositories.issues_open
        },
        get closed() {
          return computed.repositories.issues_closed
        },
      },
      pr:{
        get count() {
          return this.open + this.closed + this.merged
        },
        get open() {
          return computed.repositories.pr_open
        },
        get closed() {
          return computed.repositories.pr_closed
        },
        get merged() {
          return computed.repositories.pr_merged
        },
      },
    }

    //Load user issues and pull requests
    if (sections.includes("user")) {
      const {user} = await graphql(queries.followup.user({login}))
      followup.user = {
        issues:{
          get count() {
            return this.open + this.closed
          },
          open:user.issues_open.totalCount,
          closed:user.issues_closed.totalCount,
        },
        pr:{
          get count() {
            return this.open + this.closed + this.merged
          },
          open:user.pr_open.totalCount,
          closed:user.pr_closed.totalCount,
          merged:user.pr_merged.totalCount,
        },
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
