//Setup
  export default async function ({login, graphql, q, queries}, {enabled = false} = {}) {
    //Plugin execution
      try {
        //Check if plugin is enabled and requirements are met
          if ((!enabled)||(!q.gists))
            return null
        //Retrieve gists from graphql api
          console.debug(`metrics/compute/${login}/plugins > gists > querying api`)
          const {user:{gists}} = await graphql(queries.gists({login}))
        //Iterate through gists
          console.debug(`metrics/compute/${login}/plugins > gists > processing ${gists.nodes.length} gists`)
          let stargazers = 0, forks = 0, comments = 0, files = 0
          for (const gist of gists.nodes) {
            //Skip forks
              if (gist.isFork)
                continue
            //Compute stars, forks, comments and files count
              stargazers += gist.stargazerCount
              forks += gist.forks.totalCount
              comments += gist.comments.totalCount
              files += gist.files.length
          }
        //Results
          return {totalCount:gists.totalCount, stargazers, forks, files, comments}
      }
    //Handle errors
      catch (error) {
        throw {error:{message:"An error occured", instance:error}}
      }
  }
