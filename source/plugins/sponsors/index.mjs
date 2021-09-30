//Setup
export default async function({login, q, imports, data, graphql, queries, account}, {enabled = false} = {}) {
  //Plugin execution
  try {
    //Check if plugin is enabled and requirements are met
    if ((!enabled)||(!q.sponsors))
      return null

    //Load inputs
    const {sections} = await imports.metadata.plugins.sponsors.inputs({data, account, q})

    //Query sponsors and goal
    const {[account]:{sponsorsListing:{fullDescription, activeGoal}, sponsorshipsAsMaintainer:{nodes, totalCount:count}}} = await graphql(queries.sponsors({login, account}))
    const about = await imports.markdown(fullDescription, {mode:"multiline"})
    const goal = activeGoal ? {progress:activeGoal.percentComplete, title:activeGoal.title, description:await imports.markdown(activeGoal.description)} : null
    const list = nodes.map(({sponsorEntity:{login, avatarUrl}, tier}) => ({login, avatarUrl, amount:tier?.monthlyPriceInDollars}))
    await Promise.all(list.map(async user => user.avatar = await imports.imgb64(user.avatarUrl)))

    //Results
    return {sections, about, list, count, goal}
  }
  //Handle errors
  catch (error) {
    throw {error:{message:"An error occured", instance:error}}
  }
}
