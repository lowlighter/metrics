//Setup
export default async function({login, q, imports, data, graphql, queries, account}, {enabled = false} = {}) {
  //Plugin execution
  try {
    //Check if plugin is enabled and requirements are met
    if ((!enabled) || (!q.sponsors))
      return null

    //Load inputs
    const {sections, past} = await imports.metadata.plugins.sponsors.inputs({data, account, q})

    //Query sponsors and goal
    console.debug(`metrics/compute/${login}/plugins > sponsors > querying sponsors and goal`)
    const {[account]:{sponsorsListing:{fullDescription, activeGoal}, sponsorshipsAsMaintainer:{nodes, totalCount:count}}} = await graphql(queries.sponsors({login, account}))
    const about = await imports.markdown(fullDescription, {mode:"multiline"})
    const goal = activeGoal ? {progress:activeGoal.percentComplete, title:activeGoal.title, description:await imports.markdown(activeGoal.description)} : null
    let list = nodes.map(({sponsorEntity:{login, avatarUrl}, tier}) => ({login, avatarUrl, amount:tier?.monthlyPriceInDollars ?? null, past:false}))
    await Promise.all(list.map(async user => user.avatar = await imports.imgb64(user.avatarUrl)))

    //Query past sponsors
    if (past) {
      console.debug(`metrics/compute/${login}/plugins > sponsors > querying past sponsors`)
      const active = new Set(list.map(({login}) => login))
      const {[account]:{sponsorsActivities:{nodes:events}}} = await graphql(queries.sponsors.all({login, account}))
      console.log(JSON.stringify(await graphql(queries.sponsors.all({login, account})), null, 2))
      const users =  events.map(({sponsor:{login, avatarUrl}, sponsorsTier}) => ({login, avatarUrl, amount:sponsorsTier?.monthlyPriceInDollars ?? null, past:true}))
      for (const user of users) {
        if (!active.has(user.login)) {
          active.add(user.login)
          list.push({...user, avatar:await imports.imgb64(user.avatarUrl)})
        }
      }
    }

    //Results
    list = list.sort((a, b) => a.past === b.past ? b.amount - a.amount : a.past - b.past)
    return {sections, about, list, count, goal}
  }
  //Handle errors
  catch (error) {
    throw {error:{message:"An error occured", instance:error}}
  }
}
