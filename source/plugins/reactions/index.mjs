//Setup
  export default async function({login, q, imports, data, graphql, queries, account}, {enabled = false} = {}) {
    //Plugin execution
      try {
        //Check if plugin is enabled and requirements are met
          if ((!enabled)||(!q.reactions))
            return null

        //Load inputs
          let {limit, days, details, display} = imports.metadata.plugins.reactions.inputs({data, account, q})

        //Load issue comments
          let cursor = null, pushed = 0
          const comments = []
          for (const type of ["issues", "issueComments"]) {
            do {
              //Load issue comments
                console.debug(`metrics/compute/${login}/plugins > reactions > retrieving ${type} after ${cursor}`)
                const {user:{[type]:{edges}}} = await graphql(queries.reactions({login, type, after:cursor ? `after: "${cursor}"` : ""}))
                cursor = edges?.[edges?.length-1]?.cursor
              //Save issue comments
                const filtered = edges.flatMap(({node:{createdAt:created, reactions:{nodes:reactions}}}) => ({created:new Date(created), reactions:reactions.map(({content}) => content)})).filter(comment => Number.isFinite(days) ? comment.created < new Date(Date.now()-days*24*60*60*1000) : true)
                pushed = filtered.length
                comments.push(...filtered)
                console.debug(`metrics/compute/${login}/plugins > reactions > currently at ${comments.length} comments`)
              //Early break
                if ((comments.length >= limit)||(filtered.length < edges.length))
                  break
            } while ((cursor)&&(pushed)&&(comments.length < limit))
          }

        //Applying limit
          if (limit) {
            comments.splice(limit)
            console.debug(`metrics/compute/${login}/plugins > reactions > keeping only ${comments.length} comments`)
          }

        //Format reactions list
          const list = {}
          const reactions = comments.flatMap(({reactions}) => reactions)
          for (const reaction of reactions)
            list[reaction] = (list[reaction] ?? 0) + 1
          const max = Math.max(...Object.values(list))
          for (const [key, value] of Object.entries(list))
            list[key] = {value, score:value/(display === "relative" ? max : reactions.length)}

        //Results
          return {list, comments:comments.length, details, days, twemoji:q["config.twemoji"]}
      }
    //Handle errors
      catch (error) {
        throw {error:{message:"An error occured", instance:error}}
      }
  }