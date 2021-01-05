//Setup
  export default async function ({login, graphql, data, q, queries, imports}, {enabled = false} = {}) {
    //Plugin execution
      try {
        //Check if plugin is enabled and requirements are met
          if ((!enabled)||(!q.stargazers))
            return null
        //Retrieve stargazers from graphql api
          console.debug(`metrics/compute/${login}/plugins > stargazers > querying api`)
          const repositories = data.user.repositories.nodes.map(({name}) => name).slice(0, 2)
          const dates = []
          for (const repository of repositories) {
            //Iterate through stargazers
              console.debug(`metrics/compute/${login}/plugins > stargazers > retrieving stargazers of ${repository}`)
              let cursor = null
              let pushed = 0
              do {
                console.debug(`metrics/compute/${login}/plugins > stargazers > retrieving stargazers of ${repository} after ${cursor}`)
                const {repository:{stargazers:{edges}}} = await graphql(queries.stargazers({login, repository, after:cursor ? `after: "${cursor}"` : ""}))
                cursor = edges?.[edges?.length-1]?.cursor
                dates.push(...edges.map(({starredAt}) => new Date(starredAt)))
                pushed = edges.length
              } while ((pushed)&&(cursor))
            //Limit repositories
              console.debug(`metrics/compute/${login}/plugins > stargazers > loaded ${dates.length} stargazers for ${repository}`)
          }
          console.debug(`metrics/compute/${login}/plugins > stargazers > loaded ${dates.length} stargazers in total`)
        //Compute stargazers increments
          const days = 14
          const increments = {dates:Object.fromEntries([...new Array(days).fill(null).map((_, i) => [new Date(Date.now()-i*24*60*60*1000).toISOString().slice(0, 10), 0]).reverse()]), max:NaN, min:NaN}
          dates
            .map(date => date.toISOString().slice(0, 10))
            .filter(date => date in increments.dates)
            .map(date => increments.dates[date]++)
          increments.min = Math.min(...Object.values(increments.dates))
          increments.max = Math.max(...Object.values(increments.dates))
        //Compute total stargazers
          let stargazers = data.computed.repositories.stargazers
          const total = {dates:{...increments.dates}, max:NaN, min:NaN}
          {
            const dates = Object.keys(total.dates)
            for (let i = dates.length-1; i >= 0; i--) {
              const date = dates[i], tomorrow = dates[i+1]
              stargazers -= (increments.dates[tomorrow] ?? 0)
              total.dates[date] = stargazers
            }
          }
          total.min = Math.min(...Object.values(total.dates))
          total.max = Math.max(...Object.values(total.dates))
        //Format values
          for (const date in increments.dates)
            increments.dates[date] = `${increments.dates[date] > 0 ? "+" : ""}${imports.format(increments.dates[date])}`
          for (const date in total.dates)
            total.dates[date] = imports.format(total.dates[date])
        //Months name
          const months = ["", "Jan.", "Feb.", "Mar.", "Apr.", "May", "June", "July", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."]
        //Results
          return {total, increments, months}
      }
    //Handle errors
      catch (error) {
        throw {error:{message:"An error occured", instance:error}}
      }
  }
