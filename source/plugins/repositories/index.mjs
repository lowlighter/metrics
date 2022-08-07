//Setup
export default async function({login, q, imports, graphql, queries, data, account}, {enabled = false, extras = false} = {}) {
  //Plugin execution
  try {
    //Check if plugin is enabled and requirements are met
    if ((!enabled) || (!q.repositories) || (!imports.metadata.plugins.repositories.extras("enabled", {extras})))
      return null

    //Load inputs
    let {featured, pinned, starred, random, order, affiliations: _affiliations} = imports.metadata.plugins.repositories.inputs({data, account, q})
    const affiliations = _affiliations?.length ? `ownerAffiliations: [${_affiliations.map(x => x.toLocaleUpperCase()).join(", ")}]` : ""

    //Initialization
    const repositories = {list: []}
    const processed = new Set()

    //Featured repositories
    for (const repo of featured) {
      const {owner = login, name} = repo.match(/^(?:(?<owner>[\s\S]*)[/])?(?<name>[\s\S]+)$/)?.groups ?? {}
      const {repository} = await graphql(queries.repositories.repository({owner, name}))
      repositories.list.push(format(repository, {sorting: "featured"}))
      processed.add(repository.nameWithOwner)
    }

    //Fetch pinned repositories
    if (pinned) {
      const {user: {pinnedItems: {edges}}} = await graphql(queries.repositories.pinned({login, limit: 6}))
      repositories.list.push(
        ...edges.map(({node}) => {
          if (processed.has(node.nameWithOwner))
            return null
          processed.add(node.nameWithOwner)
          return format(node, {sorting: "pinned"})
        }).filter(repository => repository).slice(0, pinned),
      )
    }

    //Fetch starred repositories
    if (starred) {
      const {user: {repositories: {nodes}}} = await graphql(queries.repositories.starred({login, limit: Math.min(starred + 10, 100), affiliations}))
      let count = 0
      for (const node of nodes) {
        if (processed.has(node.nameWithOwner))
          continue
        const [owner, name] = node.nameWithOwner.split("/")
        const {repository} = await graphql(queries.repositories.repository({owner, name}))
        repositories.list.push(format(repository, {sorting: "starred"}))
        processed.add(repository.nameWithOwner)
        if (++count >= starred)
          break
      }
    }

    //Fetch random repositories
    if (random) {
      const {user: {repositories: {nodes}}} = await graphql(queries.repositories.random({login, affiliations}))
      let count = 0
      for (const node of imports.shuffle(nodes)) {
        if (processed.has(node.nameWithOwner))
          continue
        const [owner, name] = node.nameWithOwner.split("/")
        const {repository} = await graphql(queries.repositories.repository({owner, name}))
        repositories.list.push(format(repository, {sorting: "random"}))
        processed.add(repository.nameWithOwner)
        if (++count >= random)
          break
      }
    }

    //Sorting
    repositories.list = repositories.list.sort((a, b) => order.indexOf(a.sorting) - order.indexOf(b.sorting))

    //Results
    return repositories
  }
  //Handle errors
  catch (error) {
    throw imports.format.error(error)
  }
}

/**Format repository data */
function format(repository, {sorting} = {}) {
  //Format date
  const time = (Date.now() - new Date(repository.createdAt).getTime()) / (24 * 60 * 60 * 1000)
  let created = new Date(repository.createdAt).toDateString().substring(4)
  if (time < 1)
    created = `${Math.ceil(time * 24)} hour${Math.ceil(time * 24) >= 2 ? "s" : ""} ago`
  else if (time < 30)
    created = `${Math.floor(time)} day${time >= 2 ? "s" : ""} ago`
  repository.created = created

  //Sorting
  if (sorting)
    repository.sorting = sorting

  return repository
}
