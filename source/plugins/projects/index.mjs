//Setup
export default async function({login, data, imports, graphql, q, queries, account}, {enabled = false, extras = false} = {}) {
  //Plugin execution
  try {
    //Check if plugin is enabled and requirements are met
    if ((!enabled) || (!q.projects) || (!imports.metadata.plugins.projects.extras("enabled", {extras})))
      return null

    //Load inputs
    let {limit, repositories, descriptions} = imports.metadata.plugins.projects.inputs({data, account, q})
    //Repositories projects
    repositories = repositories.filter(repository => /[-\w]+[/][-\w]+[/]projects[/]\d+/.test(repository))
    //Update limit if repositories projects were specified manually
    limit = Math.max(repositories.length, limit)

    //Retrieve user owned projects from graphql api
    console.debug(`metrics/compute/${login}/plugins > projects > querying api`)
    const {[account]: {projects}} = await graphql(queries.projects["user.legacy"]({login, limit, account}))
    const {[account]: {projectsV2}} = await graphql(queries.projects.user({login, limit, account}))
    projects.nodes.unshift(...projectsV2.nodes)
    projects.totalCount += projectsV2.totalCount

    //Retrieve repositories projects from graphql api
    for (const identifier of repositories) {
      //Querying repository project
      console.debug(`metrics/compute/${login}/plugins > projects > querying api for ${identifier}`)
      const {user, repository, id} = identifier.match(/(?<user>[-\w]+)[/](?<repository>[-\w]+)[/]projects[/](?<id>\d+)/)?.groups ?? {}
      let project = null
      for (const account of ["user", "organization"]) {
        //Try projects beta
        try {
          project = (await graphql(queries.projects.repository({user, repository, id, account})))[account].repository.projectV2
          if (project)
            break
        }
        catch (error) {
          console.debug(error)
        }
        //Try projects classic
        try {
          console.debug(`metrics/compute/${login}/plugins > projects > falling back to projects classic for ${identifier}`)
          ;({project} = (await graphql(queries.projects["repository.legacy"]({user, repository, id, account})))[account].repository)
          if (project)
            break
        }
        catch (error) {
          console.debug(error)
        }
      }
      if (!project)
        throw new Error(`Could not load project ${user}/${repository}`)
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
      const time = (Date.now() - new Date(project.updatedAt).getTime()) / (24 * 60 * 60 * 1000)
      let updated = new Date(project.updatedAt).toDateString().substring(4)
      if (time < 1)
        updated = "less than 1 day ago"
      else if (time < 30)
        updated = `${Math.floor(time)} day${time >= 2 ? "s" : ""} ago`
      //Format progress
      const {enabled = false, todoCount: todo = NaN, inProgressCount: doing = NaN, doneCount: done = NaN} = project.progress ?? {}
      let total = todo + doing + done
      //Format items (v2)
      const items = []
      if (project.items) {
        items.push(...project.items.nodes.map(({type, fieldValues: {nodes: fields}}) => ({type, text: fields.filter(field => field.text).shift()?.text ?? ""})))
        total = project.items.totalCount
      }
      //Append
      list.push({name: project.name, updated, description: project.body, progress: {enabled, todo, doing, done, total}, items})
    }

    //Limit
    console.debug(`metrics/compute/${login}/plugins > projects > keeping only ${limit} projects`)
    list.splice(limit)

    //Results
    return {list, totalCount: projects.totalCount, descriptions}
  }
  //Handle errors
  catch (error) {
    throw imports.format.error(error, {
      descriptions: {
        custom(error) {
          if (error.errors?.map(({type}) => type)?.includes("INSUFFICIENT_SCOPES"))
            return "Insufficient token scopes"
          return null
        },
      },
    })
  }
}
