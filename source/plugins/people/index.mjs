//Setup
  export default async function ({login, graphql, q, queries, imports}, {enabled = false} = {}) {
    //Plugin execution
      try {
        //Check if plugin is enabled and requirements are met
          if ((!enabled)||(!q.people))
            return null

        //Parameters override
          let {"people.limit":limit = 100} = q
          //Limit
            limit = Math.max(1, Math.min(100, Number(limit)))

        //Retrieve followers from graphql api
          console.debug(`metrics/compute/${login}/plugins > people > querying api`)
          const result = {followers:[], following:[]}
          for (const type of ["followers", "following"]) {
            //Iterate through followers and following
              console.debug(`metrics/compute/${login}/plugins > people > retrieving ${type}`)
              let cursor = null
              let pushed = 0
              do {
                console.debug(`metrics/compute/${login}/plugins > people > retrieving ${type} after ${cursor}`)
                const {user:{[type]:{edges}}} = await graphql(queries.people({login, type, after:cursor ? `after: "${cursor}"` : ""}))
                cursor = edges?.[edges?.length-1]?.cursor
                result[type].push(...edges.map(({node}) => node))
                pushed = edges.length
              } while ((pushed)&&(cursor))
            //Limit followers
              if (limit > 0) {
                console.debug(`metrics/compute/${login}/plugins > people > keeping only ${limit} ${type}`)
                result[type].splice(limit)
              }
            //Convert avatars to base64
              console.debug(`metrics/compute/${login}/plugins > people > loading avatars`)
              await Promise.all(result[type].map(async user => user.avatar = await imports.imgb64(user.avatarUrl)))
          }

        //Results
          return result
      }
    //Handle errors
      catch (error) {
        throw {error:{message:"An error occured", instance:error}}
      }
  }
