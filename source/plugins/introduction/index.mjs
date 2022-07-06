//Setup
export default async function({login, q, imports, data, graphql, queries, account}, {enabled = false, extras = false} = {}) {
  //Plugin execution
  try {
    //Check if plugin is enabled and requirements are met
    if ((!enabled) || (!q.introduction) || (!imports.metadata.plugins.introduction.extras("enabled", {extras})))
      return null

    //Load inputs
    let {title} = imports.metadata.plugins.introduction.inputs({data, account, q})

    //Context
    let context = {mode: account, login}
    if (q.repo) {
      console.debug(`metrics/compute/${login}/plugins > people > switched to repository mode`)
      const {owner, repo} = data.user.repositories.nodes.map(({name: repo, owner: {login: owner}}) => ({repo, owner})).shift()
      context = {...context, mode: "repository", owner, repo}
    }

    //Querying API
    console.debug(`metrics/compute/${login}/plugins > introduction > querying api`)
    const text = (await graphql(queries.introduction[context.mode](context)))[context.mode][{user: "bio", organization: "description", repository: "description"}[context.mode]]

    //Results
    return {mode: context.mode, title, text}
  }
  //Handle errors
  catch (error) {
    throw imports.format.error(error)
  }
}
