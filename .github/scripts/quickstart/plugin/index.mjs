//Setup
export default async function({login, q, imports, data, computed, rest, graphql, queries, account}, {enabled = false, extras = false} = {}) {
  //Plugin execution
  try {
    //Check if plugin is enabled and requirements are met
    if ((!enabled) || (!q.<%= name %>) || (!imports.metadata.plugins.<%= name %>.extras("enabled", {extras})))
      return null
    //Results
    return {}
  }
  //Handle errors
  catch (error) {
    throw imports.format.error(error)
  }
}