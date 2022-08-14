//Setup
export default async function({login, data, graphql, rest, q, queries, imports, account}, {enabled = false, extras = false} = {}) {
  //Plugin execution
  try {
    //Check if plugin is enabled and requirements are met
    if ((!enabled) || (!q.people) || (!imports.metadata.plugins.people.extras("enabled", {extras})))
      return null

    //Context
    let context = {
      mode: "user",
      types: account === "organization" ? ["sponsorshipsAsMaintainer", "sponsorshipsAsSponsor", "membersWithRole", "thanks"] : ["followers", "following", "sponsorshipsAsMaintainer", "sponsorshipsAsSponsor", "thanks"],
      default: "followers, following",
      alias: {followed: "following", sponsors: "sponsorshipsAsMaintainer", sponsored: "sponsorshipsAsSponsor", sponsoring: "sponsorshipsAsSponsor", members: "membersWithRole"},
      sponsorships: {sponsorshipsAsMaintainer: "sponsorEntity", sponsorshipsAsSponsor: "sponsorable"},
    }
    if (q.repo) {
      console.debug(`metrics/compute/${login}/plugins > people > switched to repository mode`)
      const {owner, repo} = data.user.repositories.nodes.map(({name: repo, owner: {login: owner}}) => ({repo, owner})).shift()
      context = {...context, mode: "repository", types: ["contributors", "stargazers", "watchers", "sponsorshipsAsMaintainer", "thanks"], default: "stargazers, watchers", owner, repo}
    }

    //Load inputs
    let {limit, types, size, identicons, "identicons.hide": _identicons_hide, thanks, shuffle, "sponsors.custom": _sponsors} = imports.metadata.plugins.people.inputs({data, account, q}, {types: context.default})
    //Filter types
    types = [...new Set([...types].map(type => (context.alias[type] ?? type)).filter(type => context.types.includes(type)) ?? [])]
    if ((types.includes("sponsorshipsAsMaintainer")) && (_sponsors?.length)) {
      types.unshift("sponsorshipsCustom")
      data.user.sponsorshipsAsMaintainer.totalCount += _sponsors.length
    }

    //Retrieve followers from graphql api
    console.debug(`metrics/compute/${login}/plugins > people > querying api`)
    const result = Object.fromEntries(types.map(type => [type, []]))
    for (const type of types) {
      //Iterate through people
      console.debug(`metrics/compute/${login}/plugins > people > retrieving ${type}`)
      //Rest
      if (type === "contributors") {
        const {owner, repo} = context
        const {data: nodes} = await rest.repos.listContributors({owner, repo})
        result[type].push(...nodes.map(({login, avatar_url}) => ({login, avatarUrl: avatar_url})))
      }
      else if ((type === "thanks") || (type === "sponsorshipsCustom")) {
        const users = {thanks, sponsorshipsCustom: _sponsors}[type] ?? []
        const nodes = await Promise.all(users.map(async username => (await rest.users.getByUsername({username})).data))
        result[{sponsorshipsCustom: "sponsorshipsAsMaintainer"}[type] ?? type].push(...nodes.map(({login, avatar_url}) => ({login, avatarUrl: avatar_url})))
      }
      //GraphQL
      else {
        let cursor = null
        let pushed = 0
        do {
          console.debug(`metrics/compute/${login}/plugins > people > retrieving ${type} after ${cursor}`)
          const {[type]: {edges}} = (
            type in context.sponsorships
              ? (await graphql(queries.people.sponsors({login: context.owner ?? login, type, size, after: cursor ? `after: "${cursor}"` : "", target: context.sponsorships[type], account})))[account]
              : context.mode === "repository"
              ? (await graphql(queries.people.repository({login: context.owner, repository: context.repo, type, size, after: cursor ? `after: "${cursor}"` : "", account})))[account].repository
              : (await graphql(queries.people({login, type, size, after: cursor ? `after: "${cursor}"` : "", account})))[account]
          )
          cursor = edges?.[edges?.length - 1]?.cursor
          result[type].push(...edges.map(({node}) => node[context.sponsorships[type]] ?? node))
          pushed = edges.length
        } while ((pushed) && (cursor) && ((limit === 0) || (result[type].length <= (shuffle ? 10 * limit : limit))))
      }
      //Shuffle
      if (shuffle) {
        console.debug(`metrics/compute/${login}/plugins > people > shuffling`)
        imports.shuffle(result[type])
      }
      //Filter out identicons if not wanted
      if (_identicons_hide) {
        console.debug(`metrics/compute/${login}/plugins > people > filtering out user without custom avatarUrl`)
        result[type] = result[type].filter(user => user.avatarUrl?.includes("&u="))
      }
      //Limit people
      if (limit > 0) {
        console.debug(`metrics/compute/${login}/plugins > people > keeping only ${limit} ${type}`)
        result[type].splice(limit)
      }
      //Hide real avatar with identicons if enabled
      if (identicons) {
        console.debug(`metrics/compute/${login}/plugins > people > using identicons`)
        result[type].map(user => user.avatarUrl = `https://github.com/identicons/${user.login}.png`)
      }
      //Convert avatars to base64
      console.debug(`metrics/compute/${login}/plugins > people > loading avatars`)
      await Promise.all(result[type].map(async user => user.avatar = await imports.imgb64(user.avatarUrl)))
    }

    //Special type handling
    if (types.includes("sponsorshipsCustom")) {
      types.splice(types.indexOf("sponsorshipsCustom"), 1)
      const unique = [...new Map(result.sponsorshipsAsMaintainer.reverse().map(user => [user.login, user])).values()].reverse()
      data.user.sponsorshipsAsMaintainer.totalCount -= result.sponsorshipsAsMaintainer.length - unique.length
      result.sponsorshipsAsMaintainer = unique
    }

    //Results
    return {types, size, ...result}
  }
  //Handle errors
  catch (error) {
    throw imports.format.error(error)
  }
}
