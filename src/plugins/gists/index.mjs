//Setup
  export default async function ({login, graphql, q}, {enabled = false} = {}) {
    //Plugin execution
      try {
        //Check if plugin is enabled and requirements are met
          if ((!enabled)||(!q.gists))
            return null
        //Retrieve gists from graphql api
          console.debug(`metrics/compute/${login}/plugins > gists > querying api`)
          const {user:{gists}} = await graphql(`
              query Gists {
                user(login: "${login}") {
                  gists(last: 100) {
                    totalCount
                    nodes {
                      stargazerCount
                      isFork
                      forks {
                        totalCount
                      }
                      comments {
                        totalCount
                      }
                    }
                  }
                }
              }
            `
          )
        //Iterate through gists
          console.debug(`metrics/compute/${login}/plugins > gists > processing ${gists.nodes.length} gists`)
          let stargazers = 0, forks = 0, comments = 0
          for (const gist of gists.nodes) {
            //Skip forks
              if (gist.isFork)
                continue
            //Compute stars, forks and comments
              stargazers += gist.stargazerCount
              forks += gist.forks.totalCount
              comments += gist.comments.totalCount
          }
        //Results
          return {totalCount:gists.totalCount, stargazers, forks, comments}
      }
    //Handle errors
      catch (error) {
        throw {error:{message:"An error occured", instance:error}}
      }
  }
