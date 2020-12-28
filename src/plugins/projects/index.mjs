//Setup
  export default async function ({login, graphql, q}, {enabled = false} = {}) {
    //Plugin execution
      try {
        //Check if plugin is enabled and requirements are met
          if ((!enabled)||(!q.projects))
            return null
        //Parameters override
          let {"projects.limit":limit = 4, "projects.repositories":repositories = ""} = q
          //Repositories projects
            repositories = repositories?.split(",").map(repository => repository.trim()).filter(repository => /[-\w]+[/][-\w]+[/]projects[/]\d+/.test(repository)) ?? []
          //Limit
            limit = Math.max(1+repositories.length, Math.min(100, Number(limit)))
        //Retrieve user owned projects from graphql api
          console.debug(`metrics/compute/${login}/plugins > projects > querying api`)
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
        //Retrieve repositories projects from graphql api
          for (const identifier of repositories) {
            //Querying repository project
              console.debug(`metrics/compute/${login}/plugins > projects > querying api for ${identifier}`)
              const {user, repository, id} = identifier.match(/(?<user>[-\w]+)[/](?<repository>[-\w]+)[/]projects[/](?<id>\d+)/)?.groups
              const {user:{repository:{project}}} = await graphql(`
                  query Projects {
                    user(login: "${user}") {
                      repository(name: "${repository}") {
                        project(number: ${id}) {
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
            //Adding it to projects list
              console.debug(`metrics/compute/${login}/plugins > projects > registering ${identifier}`)
              project.name = `${project.name} (${user}/${repository})`
              projects.nodes.unshift(project)
              projects.totalCount++
          }

        //Iterate through projects and format them
          console.debug(`metrics/compute/${login}/plugins > projects > processing ${projects.nodes.length} projects`)
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
        let message = "An error occured"
        if (error.errors?.map(({type}) => type)?.includes("INSUFFICIENT_SCOPES"))
          message = "Insufficient token rights"
        throw {error:{message, instance:error}}
      }
  }
