//Setup
  export default async function({login, q, imports, graphql, queries}, {enabled = false} = {}) {
    //Plugin execution
      try {
        //Check if plugin is enabled and requirements are met
          if ((!enabled)||(!q.notable))
            return null

        //Iterate through contributed repositories
          let cursor = null
          let pushed = 0
          const organizations = new Map()
          do {
            console.debug(`metrics/compute/${login}/base > retrieving contributed repositories after ${cursor}`)
            const {user:{repositoriesContributedTo:{edges}}} = await graphql(queries.notable.contributions({login, after:cursor ? `after: "${cursor}"` : "", repositories:100}))
            cursor = edges?.[edges?.length-1]?.cursor
            edges.map(({node}) => node.isInOrganization ? organizations.set(node.owner.login, node.owner.avatarUrl) : null)
            pushed = edges.length
          } while ((pushed)&&(cursor))
          const contributions = await Promise.all([...organizations.entries()].map(async([name, avatarUrl]) => ({name, avatar:await imports.imgb64(avatarUrl)})))
          console.debug(`metrics/compute/${login}/base > found contributions to ${organizations.length} organizations`)

        //Results
          return {contributions}
      }
    //Handle errors
      catch (error) {
        throw {error:{message:"An error occured", instance:error}}
      }
  }