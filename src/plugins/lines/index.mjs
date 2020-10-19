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
        return computed.plugins.lines = null
      if (!q.lines)
        return computed.plugins.lines = null
      console.debug(`metrics/compute/${login}/plugins > lines`)
      computed.svg.height += 20

    //Plugin execution
      pending.push(new Promise(async solve => {
        try {
          //Get contributors stats from repositories
            const lines = {added:0, deleted:0}
            const response = await Promise.all(repositories.map(async repo => await rest.repos.getContributorsStats({owner:login, repo})))
          //Compute changed lines
            response.map(({data:repository}) => {
              //Check if data are available
                if (!Array.isArray(repository))
                  return
              //Extract author
                const [contributor] = repository.filter(({author}) => author.login === login)
              //Compute editions
                if (contributor)
                  contributor.weeks.forEach(({a, d}) => (lines.added += a, lines.deleted += d))
            })
          //Format values
            lines.added = format(lines.added)
            lines.deleted = format(lines.deleted)
          //Save results
            computed.plugins.lines = {...lines}
            console.debug(`metrics/compute/${login}/plugins > lines > success`)
            console.debug(JSON.stringify(computed.plugins.lines))
            solve()
        }
        catch (error) {
          //Generic error
            computed.plugins.lines = {error:`An error occured`}
            console.debug(`metrics/compute/${login}/plugins > lines > error`)
            console.debug(error)
            solve()
        }
      }))
  }

