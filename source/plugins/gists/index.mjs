//Setup
export default async function({login, data, graphql, q, imports, queries, account}, {enabled = false, extras = false} = {}) {
  //Plugin execution
  try {
    //Check if plugin is enabled and requirements are met
    if ((!enabled) || (!q.gists) || (!imports.metadata.plugins.gists.extras("enabled", {extras})))
      return null

    //Load inputs
    imports.metadata.plugins.gists.inputs({data, account, q})

    //Query gists from GitHub API
    const gists = []
    {
      //Iterate through gists
      let cursor = null
      let pushed = 0
      do {
        console.debug(`metrics/compute/${login}/plugins > gists > retrieving gists after ${cursor}`)
        const {user: {gists: {edges, nodes, totalCount}}} = await graphql(queries.gists({login, after: cursor ? `after: "${cursor}"` : ""}))
        cursor = edges?.[edges?.length - 1]?.cursor
        gists.push(...nodes)
        gists.totalCount = totalCount
        pushed = nodes.length
      } while ((pushed) && (cursor))
      console.debug(`metrics/compute/${login}/plugins > gists > loaded ${gists.length} gists`)
    }

    //Iterate through gists
    console.debug(`metrics/compute/${login}/plugins > gists > processing ${gists.length} gists`)
    let comments = 0, files = 0, forks = 0, stargazers = 0
    for (const gist of gists) {
      //Skip forks
      if (gist.isFork)
        continue
      //Compute stars, forks, comments and files count
      stargazers += gist.stargazerCount
      forks += gist.forks.totalCount
      comments += gist.comments.totalCount
      files += gist.files.length
    }

    //Results
    return {totalCount: gists.totalCount, stargazers, forks, files, comments}
  }
  //Handle errors
  catch (error) {
    throw imports.format.error(error)
  }
}
