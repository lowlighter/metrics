//Setup
  export default async function ({login, data, imports, rest, q}, {enabled = false} = {}) {
    //Plugin execution
      try {
        //Check if plugin is enabled and requirements are met
          if ((!enabled)||(!q.lines))
            return null
        //Repositories
          const repositories = data.user.repositories.nodes.map(({name}) => name) ?? []
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
          lines.added = imports.format(lines.added)
          lines.deleted = imports.format(lines.deleted)
        //Results
          return lines
      }
  //Handle errors
    catch (error) {
      console.debug(error)
      throw {error:{message:`An error occured`}}
    }
  }

