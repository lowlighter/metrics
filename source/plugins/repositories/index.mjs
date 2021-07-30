//Setup
export default async function({login, q, graphql, queries, data, account}, {enabled = false} = {}) {
  //Plugin execution
  try {
    //Check if plugin is enabled and requirements are met
    if ((!enabled)||(!q.repositories))
      return null

    //Load inputs
    let {featured} = imports.metadata.plugins.repositories.inputs({data, account, q})

    //Initialization
    const repositories = {list:[]}

    //Fetch repositories informations
    for (const repo of featured) {
      const {owner = login, name} = repo.match(/^(?:(?<owner>[\s\S]*)[/])?(?<name>[\s\S]+)$/)?.groups ?? {}
      const {repository} = await graphql(queries.repositories.repository({owner, name}))
      repositories.list.push(repository)
    }

    //Results
    return repositories
  }
  //Handle errors
  catch (error) {
    throw {error:{message:"An error occured", instance:error}}
  }
}