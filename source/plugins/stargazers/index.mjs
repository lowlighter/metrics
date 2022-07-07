//Setup
export default async function({login, graphql, data, imports, q, queries, account}, {enabled = false, extras = false} = {}) {
  //Plugin execution
  try {
    //Check if plugin is enabled and requirements are met
    if ((!enabled) || (!q.stargazers) || (!imports.metadata.plugins.stargazers.extras("enabled", {extras})))
      return null

    //Load inputs
    let {"charts.type": _charts} = imports.metadata.plugins.stargazers.inputs({data, account, q})

    //Retrieve stargazers from graphql api
    console.debug(`metrics/compute/${login}/plugins > stargazers > querying api`)
    const repositories = data.user.repositories.nodes.map(({name: repository, owner: {login: owner}}) => ({repository, owner})) ?? []
    const dates = []
    for (const {repository, owner} of repositories) {
      //Iterate through stargazers
      console.debug(`metrics/compute/${login}/plugins > stargazers > retrieving stargazers of ${repository}`)
      let cursor = null
      let pushed = 0
      do {
        console.debug(`metrics/compute/${login}/plugins > stargazers > retrieving stargazers of ${repository} after ${cursor}`)
        const {repository: {stargazers: {edges}}} = await graphql(queries.stargazers({login: owner, repository, after: cursor ? `after: "${cursor}"` : ""}))
        cursor = edges?.[edges?.length - 1]?.cursor
        dates.push(...edges.map(({starredAt}) => new Date(starredAt)))
        pushed = edges.length
      } while ((pushed) && (cursor))
      //Limit repositories
      console.debug(`metrics/compute/${login}/plugins > stargazers > loaded ${dates.length} stargazers for ${repository}`)
    }
    console.debug(`metrics/compute/${login}/plugins > stargazers > loaded ${dates.length} stargazers in total`)

    //Compute stargazers increments
    const days = 14 * (1 + data.large / 2)
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
    let charts = null
    if ((_charts === "chartist") && (imports.metadata.plugins.stargazers.extras("charts.type", {extras}))) {
      console.debug(`metrics/compute/${login}/plugins > stargazers > generating charts`)
      charts = await Promise.all([{data: total, low: total.min, high: total.max}, {data: increments, ref: 0, low: increments.min, high: increments.max, sign: true}].map(({data: {dates: set}, high, low, ref, sign = false}) =>
        imports.chartist("line", {
          width: 480 * (1 + data.large),
          height: 160,
          showPoint: true,
          axisX: {showGrid: false},
          axisY: {showLabel: false, offset: 20, labelInterpolationFnc: value => imports.format(value, {sign}), high, low, referenceValue: ref},
          showArea: true,
          fullWidth: true,
        }, {
          labels: Object.keys(set).map((date, i, a) => {
            const day = date.substring(date.length - 2)
            if ((i === 0) || ((a[i - 1]) && (date.substring(0, 7) !== a[i - 1].substring(0, 7))))
              return `${day} ${months[Number(date.substring(5, 7))]}`
            return day
          }),
          series: [Object.values(set)],
        })
      ))
      data.postscripts.push(`(${function(format) {
        document.querySelectorAll(".stargazers .chartist").forEach((chart, sign) => {
          chart.querySelectorAll(".stargazers .chartist .ct-point").forEach(node => {
            const [x, y, value] = ["x1", "y1", "ct:value"].map(attribute => node.getAttribute(attribute))
            const text = document.createElementNS("http://www.w3.org/2000/svg", "text")
            text.setAttributeNS(null, "x", x)
            text.setAttributeNS(null, "y", y - 5)
            text.setAttributeNS(null, "class", "ct-post")
            text.appendChild(document.createTextNode(format(value, {sign})))
            node.parentNode.append(text)
          })
        })
      }})(${imports.format.toString()})`)
    }

    //Results
    return {total, increments, months, charts}
  }
  //Handle errors
  catch (error) {
    throw imports.format.error(error)
  }
}
