//Setup
export default async function({login, imports, data, rest, q, account}, {enabled = false} = {}) {
  //Plugin execution
  try {
    //Check if plugin is enabled and requirements are met
    if ((!enabled) || (!q.traffic))
      return null

    //Load inputs
    let {skipped} = imports.metadata.plugins.traffic.inputs({data, account, q})
    skipped.push(...data.shared["repositories.skipped"])

    //Repositories
    const repositories = data.user.repositories.nodes.map(({name: repo, owner: {login: owner}}) => ({repo, owner})) ?? []

    //Get views stats from repositories
    console.debug(`metrics/compute/${login}/plugins > traffic > querying api`)
    const views = {count: 0, uniques: 0}
    const response = [...await Promise.allSettled(repositories.map(({repo, owner}) => (skipped.includes(repo.toLocaleLowerCase())) || (skipped.includes(`${owner}/${repo}`.toLocaleLowerCase())) ? {} : rest.repos.getViews({owner, repo})))].filter(({status}) => status === "fulfilled").map(({value}) => value)

    //Compute views
    console.debug(`metrics/compute/${login}/plugins > traffic > computing stats`)
    response.filter(({data}) => data).map(({data: {count, uniques}}) => (views.count += count, views.uniques += uniques))

    //Results
    return {views}
  }
  //Handle errors
  catch (error) {
    let message = "An error occured"
    if (error.status === 403)
      message = "Insufficient token rights"
    throw {error: {message, instance: error}}
  }
}
