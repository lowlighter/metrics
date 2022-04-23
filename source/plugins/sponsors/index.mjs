//Setup
export default async function({login, q, imports, data, graphql, queries, account}, {enabled = false} = {}) {
  //Plugin execution
  try {
    //Check if plugin is enabled and requirements are met
    if ((!enabled) || (!q.sponsors))
      return null

    //Load inputs
    const {size, sections, past} = await imports.metadata.plugins.sponsors.inputs({data, account, q})

    //Query description and goal
    console.debug(`metrics/compute/${login}/plugins > sponsors > querying sponsors and goal`)
    const {[account]:{sponsorsListing:{fullDescription, activeGoal}}} = await graphql(queries.sponsors.description({login, account}))
    const about = await imports.markdown(fullDescription, {mode:"multiline"})
    const goal = activeGoal ? {progress:activeGoal.percentComplete, title:activeGoal.title, description:await imports.markdown(activeGoal.description)} : null
    const count = {total:{count:0, user:0, organization:0}, active:{total:0, user:0, organization:0}, past:{total:0, user:0, organization:0}}

    //Query active sponsors
    let list = []
    {
      const fetched = []
      let cursor = null
      let pushed = 0
      do {
        console.debug(`metrics/compute/${login}/sponsors > retrieving sponsors after ${cursor}`)
        const {[account]:{sponsorshipsAsMaintainer:{edges, nodes}}} = await graphql(queries.sponsors.active({login, account, after:cursor ? `after: "${cursor}"` : "", size:Math.round(size*1.5)}))
        cursor = edges?.[edges?.length - 1]?.cursor
        fetched.push(...nodes)
        pushed = nodes.length
        console.debug(`metrics/compute/${login}/sponsors > retrieved ${pushed} sponsors after ${cursor}`)
      } while ((pushed) && (cursor))
      list.push(...fetched.map(({sponsorEntity:{login, avatarUrl, url:organization = null}, tier}) => ({login, avatarUrl, type:organization ? "organization" : "user", amount:tier?.monthlyPriceInDollars ?? null, past:false})))
      await Promise.all(list.map(async user => user.avatar = await imports.imgb64(user.avatarUrl)))
      count.active.total = list.length
      count.active.user = list.filter(user => user.type === "user").length
      count.active.organization = list.filter(user => user.type === "organization").length
    }

    //Query past sponsors
    if (past) {
      console.debug(`metrics/compute/${login}/plugins > sponsors > querying past sponsors`)
      const active = new Set(list.map(({login}) => login))
      const users = []
      {
        const fetched = []
        let cursor = null
        let pushed = 0
        do {
          console.debug(`metrics/compute/${login}/sponsors > retrieving sponsors events after ${cursor}`)
          const {[account]:{sponsorsActivities:{edges, nodes}}} = await graphql(queries.sponsors.all({login, account, after:cursor ? `after: "${cursor}"` : "", size:Math.round(size*1.5)}))
          cursor = edges?.[edges?.length - 1]?.cursor
          fetched.push(...nodes)
          pushed = nodes.length
          console.debug(`metrics/compute/${login}/sponsors > retrieved ${pushed} sponsors events after ${cursor}`)
        } while ((pushed) && (cursor))
        users.push(...fetched.map(({sponsor:{login, avatarUrl, url:organization = null}, sponsorsTier}) => ({login, avatarUrl, type:organization ? "organization" : "user", amount:sponsorsTier?.monthlyPriceInDollars ?? null, past:true})))
      }
      for (const user of users) {
        if (!active.has(user.login)) {
          active.add(user.login)
          list.push({...user, avatar:await imports.imgb64(user.avatarUrl)})
          count.past.total++
          count.past[user.type]++
        }
      }
    }

    //Update counters
    count.total.count = count.active.total + count.past.total
    count.total.user = count.active.user + count.past.user
    count.total.organization = count.active.organization + count.past.organization

    //Results
    list = list.sort((a, b) => a.past === b.past ? b.amount - a.amount : a.past - b.past)
    return {sections, about, list, count, goal, size}
  }
  //Handle errors
  catch (error) {
    throw {error:{message:"An error occured", instance:error}}
  }
}
