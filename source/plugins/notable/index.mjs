//Setup
  export default async function({login, q, imports, graphql, data, account, queries}, {enabled = false} = {}) {
    //Plugin execution
      try {
        //Check if plugin is enabled and requirements are met
          if ((!enabled)||(!q.notable))
            return null

        //Load inputs
          imports.metadata.plugins.notable.inputs({data, account, q})

        //Initialization
          const organizations = new Map()

        //Load organization memberships
          try {
            const {user:{organizations:{nodes}}} = await graphql(queries.notable.organizations({login}))
            nodes.map(({login, avatarUrl}) => organizations.set(login, avatarUrl))
          }
          catch (error) {
            console.debug(`metrics/compute/${login}/plugins > notable > failed to load organizations memberships: ${error}`)
          }

        //Iterate through contributed repositories from organizations
          {
            let cursor = null
            let pushed = 0
            do {
              console.debug(`metrics/compute/${login}/plugins > notable > retrieving contributed repositories after ${cursor}`)
              const {user:{repositoriesContributedTo:{edges}}} = await graphql(queries.notable.contributions({login, after:cursor ? `after: "${cursor}"` : "", repositories:100}))
              cursor = edges?.[edges?.length-1]?.cursor
              edges.map(({node}) => node.isInOrganization ? organizations.set(node.owner.login, node.owner.avatarUrl) : null)
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