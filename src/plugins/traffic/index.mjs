//Formatter
  function format(n) {
    for (const {u, v} of [{u:"b", v:10**9}, {u:"m", v:10**6}, {u:"k", v:10**3}])
      if (n/v >= 1)
        return `${(n/v).toFixed(2).substr(0, 4).replace(/[.]0*$/, "")}${u}`
    return n
  }

//Setup
  export default function ({login, repositories = [], rest, computed, pending, q}, {enabled = false} = {}) {
    //Check if plugin is enabled and requirements are met
      if (!enabled)
        return computed.plugins.traffic = null
      if (!q.traffic)
        return computed.plugins.traffic = null
      console.debug(`metrics/plugins/traffic/${login} > started`)

    //Plugin execution
      pending.push(new Promise(async solve => {
        try {
          //Get views stats from repositories
            const views = {count:0, uniques:0}
            const response = await Promise.all(repositories.map(async repo => await rest.repos.getViews({owner:login, repo})))
          //Compute views
            response.filter(({data}) => data).map(({data:{count, uniques}}) => (views.count += count, views.uniques += uniques))
          //Format values
            views.count = format(views.count)
            views.uniques = format(views.uniques)
          //Save results
            computed.plugins.traffic = {views}
            console.debug(`metrics/plugins/traffic/${login} > ${JSON.stringify(computed.plugins.traffic)}`)
            solve()
        }
        catch (error) {
          //Thrown when token has unsufficient permissions
            if (error.status === 403) {
              computed.plugins.traffic = {error:`Insufficient token rights`}
              console.debug(`metrics/plugins/traffic/${login} > ${error.status}`)
              return solve()
            }
          //Generic error
            computed.plugins.traffic = {error:`An error occured`}
            console.debug(error)
            solve()
        }
      }))
  }