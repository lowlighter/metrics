//Setup
export default async function({login, q, imports, data, graphql, queries, account}, {enabled = false, extras = false} = {}) {
  //Plugin execution
  try {
    //Check if plugin is enabled and requirements are met
    if ((!enabled) || (!q.sponsors) || (!imports.metadata.plugins.sponsors.extras("enabled", {extras})))
      return null

    //Load inputs
    let {size, sections, past, title} = await imports.metadata.plugins.sponsors.inputs({data, account, q})

    //Query description and goal
    console.debug(`metrics/compute/${login}/plugins > sponsors > querying sponsors and goal`)
    const {[account]: {sponsorsListing: {fullDescription, activeGoal}}} = await graphql(queries.sponsors.description({login, account}))
    const about = await imports.markdown(fullDescription, {mode: "multiline"})
    const goal = activeGoal ? {progress: activeGoal.percentComplete, title: activeGoal.title, description: await imports.markdown(activeGoal.description)} : null
    const count = {total: {count: 0, user: 0, organization: 0}, active: {total: 0, user: 0, organization: 0}, past: {total: 0, user: 0, organization: 0}}
    if (!goal)
      sections = sections.filter(section => section.name !== "goal")

    //Query active sponsors
    let list = []
    {
      const fetched = []
      let cursor = null
      let pushed = 0
      do {
        console.debug(`metrics/compute/${login}/sponsors > retrieving sponsors after ${cursor}`)
        const {[account]: {sponsorshipsAsMaintainer: {edges, nodes}}} = await graphql(queries.sponsors.active({login, account, after: cursor ? `after: "${cursor}"` : "", size: Math.round(size * 1.5)}))
        cursor = edges?.[edges?.length - 1]?.cursor
        fetched.push(...nodes)
        pushed = nodes.length
        console.debug(`metrics/compute/${login}/sponsors > retrieved ${pushed} sponsors after ${cursor}`)
      } while ((pushed) && (cursor))
      list.push(...fetched.map(({privacyLevel: privacy, sponsorEntity: {login, avatarUrl, url: organization = null}, tier}) => ({login, avatarUrl, type: organization ? "organization" : "user", amount: tier?.monthlyPriceInDollars ?? null, past: false, private: privacy === "PRIVATE"})))
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
          const {[account]: {sponsorsActivities: {edges, nodes}}} = await graphql(queries.sponsors.all({login, account, after: cursor ? `after: "${cursor}"` : "", size: Math.round(size * 1.5)}))
          cursor = edges?.[edges?.length - 1]?.cursor
          fetched.push(...nodes)
          pushed = nodes.length
          console.debug(`metrics/compute/${login}/sponsors > retrieved ${pushed} sponsors events after ${cursor}`)
        } while ((pushed) && (cursor))
        users.push(...fetched.map(({sponsor: {login, avatarUrl, url: organization = null}, sponsorsTier}) => ({login, avatarUrl, type: organization ? "organization" : "user", amount: sponsorsTier?.monthlyPriceInDollars ?? null, past: true, private: false})))
      }
      for (const user of users) {
        if (!active.has(user.login)) {
          active.add(user.login)
          list.push({...user, avatar: await imports.imgb64(user.avatarUrl)})
          count.past.total++
          count.past[user.type]++
        }
      }
    }

    //Hide private sponsors avatars
    list.filter(user => user.private).map(user =>
      user.avatar =
        "data:image/png;base64,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"
    )

    //Update counters
    count.total.count = count.active.total + count.past.total
    count.total.user = count.active.user + count.past.user
    count.total.organization = count.active.organization + count.past.organization

    //Results
    list = list.sort((a, b) => a.private === b.private ? a.past === b.past ? b.amount - a.amount : a.past - b.past : a.private - b.private)
    return {sections, about, list, count, goal, size, past, title}
  }
  //Handle errors
  catch (error) {
    throw imports.format.error(error)
  }
}
