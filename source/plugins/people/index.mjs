//Setup
  export default async function ({login, graphql, q, queries, imports}, {enabled = false} = {}) {
    //Plugin execution
      try {
        //Check if plugin is enabled and requirements are met
          if ((!enabled)||(!q.people))
            return null

        //Parameters override
          let {"people.limit":limit = 28, "people.types":types = "followers, following", "people.size":size = 28, "people.identicons":identicons = false} = q
          //Limit
            limit = Math.max(1, limit)
          //Repositories projects
            types = decodeURIComponent(types ?? "").split(",").map(type => type.trim()).filter(type => ["followers", "following"].includes(type)) ?? []

        //Retrieve followers from graphql api
          console.debug(`metrics/compute/${login}/plugins > people > querying api`)
          const result = {followers:[], following:[]}
          for (const type of types) {
            //Iterate through people
              console.debug(`metrics/compute/${login}/plugins > people > retrieving ${type}`)
              let cursor = null
              let pushed = 0
              do {
                console.debug(`metrics/compute/${login}/plugins > people > retrieving ${type} after ${cursor}`)
                const {user:{[type]:{edges}}} = await graphql(queries.people({login, type, size, after:cursor ? `after: "${cursor}"` : ""}))
                cursor = edges?.[edges?.length-1]?.cursor
                result[type].push(...edges.map(({node}) => node))
                pushed = edges.length
              } while ((pushed)&&(cursor))
            //Limit people
              if (limit > 0) {
                console.debug(`metrics/compute/${login}/plugins > people > keeping only ${limit} ${type}`)
                result[type].splice(limit)
              }
            //Hide real avator with identicons if enabled
              if (identicons) {
                console.debug(`metrics/compute/${login}/plugins > people > using identicons`)
                result[type].map(user => user.avatarUrl = `https://github.com/identicons/${user.login}.png`)
              }
            //Convert avatars to base64
              console.debug(`metrics/compute/${login}/plugins > people > loading avatars`)
              await Promise.all(result[type].map(async user => user.avatar = user.avatarUrl ? await imports.imgb64(user.avatarUrl) : "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mOcOnfpfwAGfgLYttYINwAAAABJRU5ErkJggg=="))
          }

        //Results
          return {types, size, ...result}
      }
    //Handle errors
      catch (error) {
        throw {error:{message:"An error occured", instance:error}}
      }
  }
