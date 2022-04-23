//Setup
export default async function({login, q, imports, graphql, queries, data, account}, {enabled = false} = {}) {
  //Plugin execution
  try {
    //Check if plugin is enabled and requirements are met
    if ((!enabled) || (!q.repositories))
      return null

    //Load inputs
    let {featured} = imports.metadata.plugins.repositories.inputs({data, account, q})

    //Initialization
    const repositories = {list: []}

    //Fetch repositories informations
    for (const repo of featured) {
      const {owner = login, name} = repo.match(/^(?:(?<owner>[\s\S]*)[/])?(?<name>[\s\S]+)$/)?.groups ?? {}
      const {repository} = await graphql(queries.repositories.repository({owner, name}))
      repositories.list.push(repository)

      //Format date
      const time = (Date.now() - new Date(repository.createdAt).getTime()) / (24 * 60 * 60 * 1000)
      let created = new Date(repository.createdAt).toDateString().substring(4)
      if (time < 1)
        created = `${Math.ceil(time * 24)} hour${Math.ceil(time * 24) >= 2 ? "s" : ""} ago`
      else if (time < 30)
        created = `${Math.floor(time)} day${time >= 2 ? "s" : ""} ago`
      repository.created = created
    }

    //Results
    return repositories
  }
  //Handle errors
  catch (error) {
    throw {error: {message: "An error occured", instance: error}}
  }
}
