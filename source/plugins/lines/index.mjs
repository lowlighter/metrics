//Setup
  export default async function ({login, data, imports, rest, q, account}, {enabled = false} = {}) {
    //Plugin execution
      try {
        //Check if plugin is enabled and requirements are met
          if ((!enabled)||(!q.lines))
            return null

        //Load inputs
          imports.metadata.plugins.lines.inputs({data, account, q})

        //Context
          let context = {mode:"user"}
          if (q.repo) {
            console.debug(`metrics/compute/${login}/plugins > people > switched to repository mode`)
            context = {...context, mode:"repository"}
          }

        //Repositories
          const repositories = data.user.repositories.nodes.map(({name:repo, owner:{login:owner}}) => ({repo, owner})) ?? []

        //Get contributors stats from repositories
          console.debug(`metrics/compute/${login}/plugins > lines > querying api`)
          const lines = {added:0, deleted:0}
          const response = await Promise.all(repositories.map(async ({repo, owner}) => await rest.repos.getContributorsStats({owner, repo})))

        //Compute changed lines
          console.debug(`metrics/compute/${login}/plugins > lines > computing total diff`)
          response.map(({data:repository}) => {
            //Check if data are available
              if (!Array.isArray(repository))
                return
            //Extract author
              const [contributor] = repository.filter(({author}) => context.mode === "repository" ? true : author.login === login)
            //Compute editions
              if (contributor)
                contributor.weeks.forEach(({a, d}) => (lines.added += a, lines.deleted += d))
          })

        //Results
          return lines
      }
  //Handle errors
    catch (error) {
      throw {error:{message:"An error occured", instance:error}}
    }
  }

