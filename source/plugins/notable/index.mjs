//Setup
export default async function({login, q, imports, rest, graphql, data, account, queries}, {enabled = false, extras = false} = {}) {
  //Plugin execution
  try {
    //Check if plugin is enabled and requirements are met
    if ((!enabled) || (!q.notable))
      return null

    //Load inputs
    let {filter, repositories, from, indepth} = imports.metadata.plugins.notable.inputs({data, account, q})

    //Iterate through contributed repositories
    const commits = []
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
          .map(({node}) => commits.push({handle:node.nameWithOwner, stars:node.stargazers.totalCount, organization:node.isInOrganization, avatarUrl:node.owner.avatarUrl}))
        pushed = edges.length
      } while ((pushed) && (cursor))
    }

    //Set contributions
    let contributions = (await Promise.all(commits.map(async ({handle, stars, avatarUrl, organization}) => ({name:handle.split("/").shift(), handle, stars, avatar:await imports.imgb64(avatarUrl), organization})))).sort((a, b) => a.name.localeCompare(b.name))
    console.debug(`metrics/compute/${login}/plugins > notable > found ${contributions.length} notable contributions`)

    //Extras features
    if (extras) {
      //Indepth
      if (indepth) {
        console.debug(`metrics/compute/${login}/plugins > notable > indepth`)
        for (const contribution of contributions) {
          //Prepare data
          const {handle, stars} = contribution
          const [owner, repo] = handle.split("/")
          try {
            //Count total commits on repository
            const {repository:{defaultBranchRef:{target:{history}}}} = await graphql(queries.notable.commits({owner, repo}))
            contribution.history = history.totalCount

            //Load maintainers (errors probably means that token is not allowed to list contributors hence not a maintainer of said repo)
            const {data:collaborators} = await rest.repos.listCollaborators({owner, repo}).catch(() => ({data:[]}))
            const maintainers = collaborators.filter(({role_name:role}) => ["admin", "maintain", "write"].includes(role)).map(({login}) => login)

            //Count total commits of user
            const {data:contributions = []} = await rest.repos.getContributorsStats({owner, repo})
            const commits = contributions.filter(({author}) => author.login.toLocaleLowerCase() === login.toLocaleLowerCase()).reduce((a, {total:b}) => a + b, 0)

            //Save user data
            contribution.user = {
              commits,
              percentage:commits/contribution.history,
              maintainer:maintainers.includes(login),
              get stars() {
                return this.maintainer ? stars : this.percentage*stars
              }
            }
            console.debug(`metrics/compute/${login}/plugins > notable > indepth > successfully processed ${owner}/${repo}`)
          }
          catch (error) {
            console.debug(error)
            console.debug(`metrics/compute/${login}/plugins > notable > indepth > failed to compute for ${owner}/${repo}`)
          }
        }
      }
    }

    //Aggregate contributions
    console.debug(`metrics/compute/${login}/plugins > notable > aggregating results`)
    const aggregated = new Map()
    for (const {name, handle, avatar, organization = handle.split("/").shift() ?? "", stars, ..._extras} of contributions) {
      const key = repositories ? handle : name
      if (aggregated.has(key)) {
        const aggregate = aggregated.get(key)
        aggregate.aggregated++
        if (extras) {
          const {history = 0, user:{commits = 0, percentage = 0, maintainer = false} = {}} = _extras
          aggregate.history = aggregate.history ?? 0
          aggregate.history += history
          aggregate.user = aggregate.user ?? {}
          aggregate.user.commits += commits
          aggregate.user.percentage += percentage
          aggregate.user.maintainer = aggregate.user.maintainer || maintainer
        }
      }
      else
        aggregated.set(key, {name:key, handle, avatar, organization, stars, aggregated:1, ..._extras})
    }
    contributions = [...aggregated.values()]
    if (extras) {
      //Normalize contribution percentage
      contributions.map(aggregate => aggregate.user ? aggregate.user.percentage /= aggregate.aggregated : null)
      //Sort contribution by maintainer first and then by contribution percentage
      contributions = contributions.sort((a, b) => ((b.user?.percentage + b.user?.maintainer) || 0) - ((a.user?.percentage + a.user?.maintainer) || 0))
    }


    //Results
    return {contributions}
  }
  //Handle errors
  catch (error) {
    throw {error:{message:"An error occured", instance:error}}
  }
}
