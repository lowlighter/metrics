//Setup
  export default async function ({login, imports, data, rest, q}, {enabled = false} = {}) {
    //Plugin execution
      try {
        //Check if plugin is enabled and requirements are met
          if ((!enabled)||(!q.traffic))
            return null
        //Repositories
          const repositories = data.user.repositories.nodes.map(({name}) => name) ?? []
        //Get views stats from repositories
          console.debug(`metrics/compute/${login}/plugins > traffic > querying api`)
          const views = {count:0, uniques:0}
          const response = await Promise.all(repositories.map(async repo => await rest.repos.getViews({owner:login, repo})))
        //Compute views
          console.debug(`metrics/compute/${login}/plugins > traffic > computing stats`)
          response.filter(({data}) => data).map(({data:{count, uniques}}) => (views.count += count, views.uniques += uniques))
        //Format values
          views.count = imports.format(views.count)
          views.uniques = imports.format(views.uniques)
        //Results
          return {views}
      }
    //Handle errors
      catch (error) {
        let message = "An error occured"
        if (error.status === 403)
          message = "Insufficient token rights"
        throw {error:{message, instance:error}}
      }
  }