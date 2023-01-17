//Setup
export default async function({login, q, imports, data, graphql, queries, account}, {enabled = false, extras = false} = {}) {
  //Plugin execution
  try {
    //Check if plugin is enabled and requirements are met
    if ((!q.sponsorships) || (!imports.metadata.plugins.sponsorships.enabled(enabled, {extras})))
      return null

    //Load inputs
    let {sections, size} = await imports.metadata.plugins.sponsorships.inputs({data, account, q})

    //Query description and goal
    let amount = NaN, image = null, started = null
    if (sections.includes("amount")) {
      console.debug(`metrics/compute/${login}/plugins > sponsorships > querying total amount spend`)
      const {totalSponsorshipAmountAsSponsorInCents, sponsorshipsAsSponsor} = (await graphql(queries.sponsorships({login, account})))[account]
      amount = totalSponsorshipAmountAsSponsorInCents/100
      image = "https://github.githubassets.com/images/icons/emoji/hearts_around.png"
      started = sponsorshipsAsSponsor.nodes[0]?.createdAt ? new Date(sponsorshipsAsSponsor.nodes[0]?.createdAt) : null
    }
    image = await imports.imgb64(image)

    //Query sponsorships
    const list = []
    if (sections.includes("sponsorships")) {
      console.debug(`metrics/compute/${login}/plugins > sponsorships > querying sponsorships`)
      {
        const fetched = []
        let cursor = null
        let pushed = 0
        do {
          console.debug(`metrics/compute/${login}/sponsorships > retrieving sponsorships after ${cursor}`)
          const {[account]: {sponsorshipsAsSponsor: {edges, nodes}}} = await graphql(queries.sponsorships.all({login, account, after: cursor ? `after: "${cursor}"` : "", size: Math.round(size * 1.5)}))
          cursor = edges?.[edges?.length - 1]?.cursor
          fetched.push(...nodes)
          pushed = nodes.length
          console.debug(`metrics/compute/${login}/sponsorships > retrieved ${pushed} sponsorships events after ${cursor}`)
        } while ((pushed) && (cursor))
        list.push(...fetched.map(({sponsorable: {login, avatarUrl, url: organization = null}, tier:{name:tier}, privacyLevel:privacy, isActive:active}) => ({login, avatarUrl, type: organization ? "organization" : "user", tier, private: privacy !== "PUBLIC", past:!active})))
      }
      await Promise.all(list.map(async user => user.avatar = await imports.imgb64(user.avatarUrl)))
    }

    //Results
    return {amount, list, sections, size, image, started}
  }
  //Handle errors
  catch (error) {
    throw imports.format.error(error)
  }
}