//Setup
export default async function({login, data, imports, rest, q, account}, {enabled = false, extras = false} = {}) {
  //Plugin execution
  try {
    //Check if plugin is enabled and requirements are met
    if ((!enabled) || (!q.lines) || (!imports.metadata.plugins.lines.extras("enabled", {extras})))
      return null

    //Load inputs
    let {skipped} = imports.metadata.plugins.lines.inputs({data, account, q})
    skipped.push(...data.shared["repositories.skipped"])

    //Context
    let context = {mode: "user"}
    if (q.repo) {
      console.debug(`metrics/compute/${login}/plugins > people > switched to repository mode`)
      context = {...context, mode: "repository"}
    }

    //Repositories
    const repositories = data.user.repositories.nodes.map(({name: repo, owner: {login: owner}}) => ({repo, owner})) ?? []

    //Get contributors stats from repositories
    console.debug(`metrics/compute/${login}/plugins > lines > querying api`)
    const lines = {added: 0, deleted: 0, changed: 0}
    const response = [...await Promise.allSettled(repositories.map(({repo, owner}) => (skipped.includes(repo.toLocaleLowerCase())) || (skipped.includes(`${owner}/${repo}`.toLocaleLowerCase())) ? {} : rest.repos.getContributorsStats({owner, repo})))].filter(({status}) => status === "fulfilled").map(({value}) => value)

    //Compute changed lines
    console.debug(`metrics/compute/${login}/plugins > lines > computing total diff`)
    response.map(({data: repository}) => {
      //Check if data are available
      if (!Array.isArray(repository))
        return
      //Compute editions
      const contributors = repository.filter(({author}) => context.mode === "repository" ? true : author?.login?.toLocaleLowerCase() === login.toLocaleLowerCase())
      for (const contributor of contributors)
        contributor.weeks.forEach(({a = 0, d = 0, c = 0}) => (lines.added += a, lines.deleted += d, lines.changed += c))
    })

    //Results
    return lines
  }
  //Handle errors
  catch (error) {
    throw imports.format.error(error)
  }
}
