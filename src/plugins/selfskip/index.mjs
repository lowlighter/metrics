//Setup
  export default async function ({login, rest, computed, q}, {enabled = false} = {}) {
    //Plugin execution
      try {
        //Check if plugin is enabled and requirements are met
          if ((!enabled)||(!q.selfskip))
            return null
        //Search for auto-generated commits
          let commits = 0
          for (let page = 0;;page++) {
            const {data} = await rest.repos.listCommits({owner:login, repo:login, author:login, per_page:100, page})
            commits += data.filter(({commit}) => /\[Skip GitHub Action\]/.test(commit.message)).length
            if (!data.length)
              break
          }
        //Results
          computed.commits -= commits
          return {commits}
      }
    //Handle errors
      catch (error) {
        console.debug(error)
        throw {error:{message:`An error occured`}}
      }
  }