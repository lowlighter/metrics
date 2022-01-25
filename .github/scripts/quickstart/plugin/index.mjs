//Setup
export default async function({login, q, imports, data, computed, rest, graphql, queries, account}, {enabled = false} = {}) {
  //Plugin execution
  try {
    //Check if plugin is enabled and requirements are met
    if ((!enabled)||(!q.<%= name %>))
      return null
    //Results
    return {}
  }
  //Handle errors
  catch (error) {
    throw {error:{message:"An error occured", instance:error}}
  }
}