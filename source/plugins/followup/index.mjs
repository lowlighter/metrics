//Setup
export default async function({login, data, computed, imports, q, graphql, queries, account}, {enabled = false, extras = false} = {}) {
  //Plugin execution
  try {
    //Check if plugin is enabled and requirements are met
    if ((!enabled) || (!q.followup))
      return null

    //Load inputs
    let {sections, indepth} = imports.metadata.plugins.followup.inputs({data, account, q})

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
        collaborators:{
          open:0,
          closed:0,
        }
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

    //Extras features
    if (extras) {

      //Indepth mode
      if (indepth) {
        console.debug(`metrics/compute/${login}/plugins > followup > indepth`)
        followup.indepth = {repositories:{}}

        //Process repositories
        for (const {name:repo, owner:{login:owner}} of data.user.repositories.nodes) {
          console.debug(`metrics/compute/${login}/plugins > followup > processing ${owner}/${repo}`)
          followup.indepth.repositories[`${owner}/${repo}`] = {from:{}}
          //Fetch users with push access
          const {repository:{collaborators:{nodes:collaborators}}} = await graphql(queries.followup["repository.collaborators"]({repo, owner}))
          console.debug(`metrics/compute/${login}/plugins > followup > found ${collaborators.length} collaborators`)
          followup.indepth.repositories[`${owner}/${repo}`].collaborators = collaborators.map(({login}) => login)
          //Fetch issues and pull requests created by collaborators
          for (const {login:user} of collaborators)
            followup.indepth.repositories[`${owner}/${repo}`].from[user] = (await graphql(queries.followup.repository({repo, owner, user}))).repository
        }

        //Aggregate collaborators stats
        console.debug(`metrics/compute/${login}/plugins > followup > computing collaborators stats across repositories`)
        for (const [repository, {from:users}] of Object.entries(followup.indepth.repositories)) {
          console.debug(`metrics/compute/${login}/plugins > followup > processing ${repository}`)
          for (const user of Object.values(users)) {
            followup.issues.collaborators.open += user.issues_open.totalCount
            followup.issues.collaborators.closed += user.issues_closed.totalCount
          }
        }
      }
    }

    //Load user issues and pull requests
    if ((account === "user")&&(sections.includes("user"))) {
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
