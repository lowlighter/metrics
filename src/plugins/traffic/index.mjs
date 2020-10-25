//Setup
  export default function ({login, imports, repositories = [], rest, computed, pending, q}, {enabled = false} = {}) {
    //Check if plugin is enabled and requirements are met
      if (!enabled)
        return computed.plugins.traffic = null
      if (!q.traffic)
        return computed.plugins.traffic = null
      console.debug(`metrics/compute/${login}/plugins > traffic`)

    //Plugin execution
      pending.push(new Promise(async solve => {
        try {
          //Get views stats from repositories
            const views = {count:0, uniques:0}
            const response = await Promise.all(repositories.map(async repo => await rest.repos.getViews({owner:login, repo})))
          //Compute views
            response.filter(({data}) => data).map(({data:{count, uniques}}) => (views.count += count, views.uniques += uniques))
          //Format values
            views.count = imports.format(views.count)
            views.uniques = imports.format(views.uniques)
          //Save results
            computed.plugins.traffic = {views}
            console.debug(`metrics/compute/${login}/plugins > traffic > success`)
            console.debug(JSON.stringify(computed.plugins.traffic))
            solve()
        }
        catch (error) {
          //Thrown when token has unsufficient permissions
            if (error.status === 403) {
              computed.plugins.traffic = {error:`Insufficient token rights`}
              console.debug(`metrics/compute/${login}/plugins > error > 403 (insufficient token rights)`)
              return solve()
            }
          //Generic error
            computed.plugins.traffic = {error:`An error occured`}
            console.debug(`metrics/compute/${login}/plugins > error`)
            console.debug(error)
            solve()
        }
      }))
  }