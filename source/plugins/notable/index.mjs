//Setup
  export default async function({login, q, imports, graphql, data, account, queries}, {enabled = false} = {}) {
    //Plugin execution
      try {
        //Check if plugin is enabled and requirements are met
          if ((!enabled)||(!q.notable))
            return null

        //Load inputs
          let {filter, repositories} = imports.metadata.plugins.notable.inputs({data, account, q})

        //Initialization
          const organizations = new Map()

        //Iterate through contributed repositories from organizations
          {
            let cursor = null
            let pushed = 0
            do {
              console.debug(`metrics/compute/${login}/plugins > notable > retrieving contributed repositories after ${cursor}`)
              const {user:{repositoriesContributedTo:{edges}}} = await graphql(queries.notable.contributions({login, after:cursor ? `after: "${cursor}"` : "", repositories:100}))
              cursor = edges?.[edges?.length-1]?.cursor
              edges
                .filter(({node}) => node.isInOrganization)
                .filter(({node}) => imports.ghfilter(filter, {name:node.nameWithOwner, stars:node.stargazers.totalCount, watchers:node.watchers.totalCount, forks:node.forks.totalCount}))
                .map(({node}) => organizations.set(repositories ? node.nameWithOwner : node.owner.login, node.owner.avatarUrl))
              pushed = edges.length
            } while ((pushed)&&(cursor))
          }

        //Set contributions
          const contributions = (await Promise.all([...organizations.entries()].map(async([name, avatarUrl]) => ({name, avatar:await imports.imgb64(avatarUrl)})))).sort((a, b) => a.name.localeCompare(b.name))
          console.debug(`metrics/compute/${login}/plugins > notable > found contributions to ${organizations.length} organizations`)

        //Results
          return {contributions}
      }
    //Handle errors
      catch (error) {
        throw {error:{message:"An error occured", instance:error}}
      }
  }