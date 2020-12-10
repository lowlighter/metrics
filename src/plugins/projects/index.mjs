//Setup
  export default async function ({login, graphql, q}, {enabled = false} = {}) {
    //Plugin execution
      try {
        //Check if plugin is enabled and requirements are met
          if ((!enabled)||(!q.projects))
            return null
        //Parameters override
          let {"projects.limit":limit = 4} = q
          //Limit
            limit = Math.max(1, Math.min(100, Number(limit)))
        //Retrieve contribution calendar from graphql api
          const {user:{projects}} = await graphql(`
              query Projects {
                user(login: "${login}") {
                  projects(last: ${limit}, states: OPEN, orderBy: {field: UPDATED_AT, direction: DESC}) {
                    totalCount
                    nodes {
                      name
                      updatedAt
                      progress {
                        doneCount
                        inProgressCount
                        todoCount
                        enabled
                      }
                    }
                  }
                }
              }
            `
          )
        //Iterate through projects and format them
          const list = []
          for (const project of projects.nodes) {
            //Format date
              const time = (Date.now()-new Date(project.updatedAt).getTime())/(24*60*60*1000)
              let updated
              if (time < 1)
                updated = "less than 1 day ago"
              else if (time < 30)
                updated = `${Math.floor(time)} day${time >= 2 ? "s" : ""} ago`
              else
                updated = new Date(project.updatedAt).toDateString().substring(4)
            //Format progress
              const {enabled, todoCount:todo, inProgressCount:doing, doneCount:done} = project.progress
            //Append
              list.push({name:project.name, updated, progress:{enabled, todo, doing, done, total:todo+doing+done}})
          }
        //Results
          return {list, totalCount:projects.totalCount}
      }
    //Handle errors
      catch (error) {
        console.debug(error)
        throw {error:{message:`An error occured`}}
      }
  }
