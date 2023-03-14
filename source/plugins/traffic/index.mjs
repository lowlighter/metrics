//Setup
export default async function({login, imports, data, rest, q, account}, {enabled = false, extras = false} = {}) {
  //Plugin execution
  try {
    //Check if plugin is enabled and requirements are met
    if ((!q.traffic) || (!imports.metadata.plugins.traffic.enabled(enabled, {extras})))
      return null

    //Load inputs
    let {skipped} = imports.metadata.plugins.traffic.inputs({data, account, q})
    skipped.push(...data.shared["repositories.skipped"])

    //Repositories
    const repositories = data.user.repositories.nodes.map(({name: repo, owner: {login: owner}}) => ({repo, owner})) ?? []

    //Get views stats from repositories
    console.debug(`metrics/compute/${login}/plugins > traffic > querying api`)
    const views = {count: 0, uniques: 0}
    const promised = [...await Promise.allSettled(repositories.map(({repo, owner}) => imports.filters.repo(`${owner}/${repo}`, skipped) ? rest.repos.getViews({owner, repo}) : {}))]
    const response = promised.filter(({status}) => status === "fulfilled").map(({value}) => value)

    //Handle error if all promises were rejected
    if (promised.filter(({status}) => status === "rejected").length === promised.length) {
      if (promised.map(({reason}) => reason.message).every(error => /must have push access to repository/i.test(error)))
        throw {error: {message: "Insufficient token scopes"}}
      throw new Error(promised[0].reason.message)
    }

    //Compute views
    console.debug(`metrics/compute/${login}/plugins > traffic > computing stats`)
    response.filter(({data}) => data).map(({data: {count, uniques}}) => (views.count += count, views.uniques += uniques))

    //Results
    return {views}
  }
  //Handle errors
  catch (error) {
    throw imports.format.error(error, {descriptions: {"403": "Insufficient token scopes"}})
  }
}
