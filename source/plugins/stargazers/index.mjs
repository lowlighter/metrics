//Setup
export default async function({login, graphql, data, imports, q, queries, account}, {enabled = false, extras = false, "worldmap.token": _worldmap_token} = {}) {
  //Plugin execution
  try {
    //Check if plugin is enabled and requirements are met
    if ((!q.stargazers) || (!imports.metadata.plugins.stargazers.enabled(enabled, {extras})))
      return null

    //Load inputs
    let {days, charts: _charts, "charts.type": _charts_type, worldmap: _worldmap, "worldmap.sample": _worldmap_sample} = imports.metadata.plugins.stargazers.inputs({data, account, q})
    if (!days) {
      days = Math.abs(parseInt((new Date() - new Date(data.user.createdAt))/1000/60/60/24))
      console.debug(`metrics/compute/${login}/plugins > stargazers > set days to ${days}`)
    }

    //Retrieve stargazers from graphql api
    console.debug(`metrics/compute/${login}/plugins > stargazers > querying api`)
    const repositories = data.user.repositories.nodes.map(({name: repository, owner: {login: owner}}) => ({repository, owner})) ?? []
    const dates = []
    const locations = []
    for (const {repository, owner} of repositories) {
      //Iterate through stargazers
      console.debug(`metrics/compute/${login}/plugins > stargazers > retrieving stargazers of ${repository}`)
      let cursor = null
      let pushed = 0
      do {
        console.debug(`metrics/compute/${login}/plugins > stargazers > retrieving stargazers of ${repository} after ${cursor}`)
        const {repository: {stargazers: {edges}}} = await graphql(queries.stargazers({login: owner, repository, after: cursor ? `after: "${cursor}"` : "", location: _worldmap ? "node { location }" : ""}))
        cursor = edges?.[edges?.length - 1]?.cursor
        dates.push(...edges.map(({starredAt}) => new Date(starredAt)))
        if (_worldmap)
          locations.push(...edges.map(({node: {location}}) => location))
        pushed = edges.length
      }
      while ((pushed) && (cursor))
      console.debug(`metrics/compute/${login}/plugins > stargazers > loaded ${dates.length} stargazers for ${repository}`)
    }
    console.debug(`metrics/compute/${login}/plugins > stargazers > loaded ${dates.length} stargazers in total`)

    //Compute stargazers increments
    const increments = {dates: Object.fromEntries([...new Array(days).fill(null).map((_, i) => [new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), 0]).reverse()]), max: NaN, min: NaN}
    dates
      .map(date => date.toISOString().slice(0, 10))
      .filter(date => date in increments.dates)
      .map(date => increments.dates[date]++)
    increments.min = Math.min(...Object.values(increments.dates))
    increments.max = Math.max(...Object.values(increments.dates))

    //Compute total stargazers
    let {stargazers} = data.computed.repositories
    const total = {dates: {...increments.dates}, max: NaN, min: NaN}
    {
      const dates = Object.keys(total.dates)
      for (let i = dates.length - 1; i >= 0; i--) {
        const date = dates[i], tomorrow = dates[i + 1]
        stargazers -= increments.dates[tomorrow] ?? 0
        total.dates[date] = stargazers
      }
    }
    total.min = Math.min(...Object.values(total.dates))
    total.max = Math.max(...Object.values(total.dates))

    //Months name
    const months = ["", "Jan.", "Feb.", "Mar.", "Apr.", "May", "June", "July", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."]

    //Generating charts
    let charts = _charts ? true : null
    if ((["graph", "chartist"].includes(_charts_type)) && (imports.metadata.plugins.stargazers.extras("charts.type", {extras})))  {
      console.debug(`metrics/compute/${login}/plugins > stargazers > generating charts`)
      charts = await Promise.all([{data: total, low: total.min, high: total.max}, {data: increments, low: 0, high: increments.max, sign: true}].map(({data: {dates: set}, low, high, sign = false}) => 
        imports.Graph.timeline(Object.entries(set).map(([x, y]) => ({x:new Date(x), y, text:imports.format(y, {sign})})), {low, high,
          match:(data, ticks) => data.filter(([x]) => ticks.map(t => t.toISOString().slice(0, 10)).includes(x.toISOString().slice(0, 10))),
        })
      ))
    }

    //Generating worldmap
    let worldmap = null
    if ((_worldmap) && (imports.metadata.plugins.stargazers.extras("worldmap", {extras}))) {
      const {default: generate} = await import("./worldmap/index.mjs")
      worldmap = await generate(login, {locations, imports, token: _worldmap_token, sample: _worldmap_sample})
    }

    //Results
    return {total, increments, months, charts, worldmap, days}
  }
  //Handle errors
  catch (error) {
    throw imports.format.error(error)
  }
}
