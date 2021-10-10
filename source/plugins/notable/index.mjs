//Setup
export default async function({login, q, imports, graphql, data, account, queries}, {enabled = false} = {}) {
  //Plugin execution
  try {
    //Check if plugin is enabled and requirements are met
    if ((!enabled) || (!q.notable))
      return null

    //Load inputs
    let {filter, repositories, from} = imports.metadata.plugins.notable.inputs({data, account, q})

    //Iterate through contributed repositories
    const notable = new Map()
    {
      let cursor = null
      let pushed = 0
      do {
        console.debug(`metrics/compute/${login}/plugins > notable > retrieving contributed repositories after ${cursor}`)
        const {user:{repositoriesContributedTo:{edges}}} = await graphql(queries.notable.contributions({login, after:cursor ? `after: "${cursor}"` : "", repositories:data.shared["repositories.batch"] || 100}))
        cursor = edges?.[edges?.length - 1]?.cursor
        edges
          .filter(({node}) => ({all:true, organization:node.isInOrganization, user:!node.isInOrganization}[from]))
          .filter(({node}) => imports.ghfilter(filter, {name:node.nameWithOwner, user:node.owner.login, stars:node.stargazers.totalCount, watchers:node.watchers.totalCount, forks:node.forks.totalCount}))
          .map(({node}) => notable.set((repositories || !node.isInOrganization) ? node.nameWithOwner : node.owner.login, {organization:node.isInOrganization, avatarUrl:node.owner.avatarUrl}))
        pushed = edges.length
      } while ((pushed) && (cursor))
    }

    //Set contributions
    const contributions = (await Promise.all([...notable.entries()].map(async ([name, {avatarUrl, organization}]) => ({name, avatar:await imports.imgb64(avatarUrl), organization})))).sort((a, b) => a.name.localeCompare(b.name))
    console.debug(`metrics/compute/${login}/plugins > notable > found ${contributions.length} notable contributions`)

    //Results
    return {contributions}
  }
  //Handle errors
  catch (error) {
    throw {error:{message:"An error occured", instance:error}}
  }
}
