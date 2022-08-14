//Setup
export default async function({login, data, imports, rest, q, account}, {enabled = false, extras = false} = {}) {
  //Plugin execution
  try {
    //Check if plugin is enabled and requirements are met
    if ((!enabled) || (!q.lines) || (!imports.metadata.plugins.lines.extras("enabled", {extras})))
      return null

    //Load inputs
    let {skipped, sections, "repositories.limit": _repositories_limit, "history.limit": _history_limit} = imports.metadata.plugins.lines.inputs({data, account, q})
    skipped.push(...data.shared["repositories.skipped"])

    //Context
    let context = {mode: "user"}
    if (q.repo) {
      console.debug(`metrics/compute/${login}/plugins > people > switched to repository mode`)
      context = {...context, mode: "repository"}
    }

    //Repositories
    const repositories = data.user.repositories.nodes.map(({name: repo, owner: {login: owner}}) => ({repo, owner})) ?? []

    //Get contributors stats from repositories
    console.debug(`metrics/compute/${login}/plugins > lines > querying api`)
    const repos = {}, weeks = {}
    const response = [...await Promise.allSettled(repositories.map(async ({repo, owner}) => (skipped.includes(repo.toLocaleLowerCase())) || (skipped.includes(`${owner}/${repo}`.toLocaleLowerCase())) ? {} : {handle: `${owner}/${repo}`, stats: (await rest.repos.getContributorsStats({owner, repo})).data}))].filter(({status}) => status === "fulfilled").map((
      {value},
    ) => value)

    //Compute changed lines
    console.debug(`metrics/compute/${login}/plugins > lines > computing total diff`)
    response.map(({handle, stats}) => {
      //Check if data are available
      if (!Array.isArray(stats))
        return
      //Compute changes
      repos[handle] = {added: 0, deleted: 0, changed: 0}
      const contributors = stats.filter(({author}) => context.mode === "repository" ? true : author?.login?.toLocaleLowerCase() === login.toLocaleLowerCase())
      for (const contributor of contributors) {
        let added = 0, changed = 0, deleted = 0
        contributor.weeks.forEach(({a = 0, d = 0, c = 0, w}) => {
          added += a
          deleted += d
          changed += c
          //Compute changes per week
          const date = new Date(w * 1000).toISOString().substring(0, 10)
          if (!weeks[date])
            weeks[date] = {added: 0, deleted: 0, changed: 0}
          weeks[date].added += a
          weeks[date].deleted += d
          weeks[date].changed += c
        })
        console.debug(`metrics/compute/${login}/plugins > lines > ${handle}: @${contributor.author.login} +${added} -${deleted} ~${changed}`)
        repos[handle].added += added
        repos[handle].deleted += deleted
        repos[handle].changed += changed
      }
    })

    //Results
    const result = {
      sections,
      added: Object.entries(repos).map(([_, {added}]) => added).reduce((a, b) => a + b, 0),
      deleted: Object.entries(repos).map(([_, {deleted}]) => deleted).reduce((a, b) => a + b, 0),
      changed: Object.entries(repos).map(([_, {changed}]) => changed).reduce((a, b) => a + b, 0),
      repos: Object.entries(repos).map(([handle, stats]) => ({handle, ...stats})).sort((a, b) => (b.added + b.deleted + b.changed) - (a.added + a.deleted + a.changed)).slice(0, _repositories_limit),
      weeks: Object.entries(weeks).map(([date, stats]) => ({date, ...stats})).filter(({added, deleted, changed}) => added + deleted + changed).sort((a, b) => new Date(a.date) - new Date(b.date)),
    }

    //Diff graphs
    if (sections.includes("history")) {
      //Generate SVG
      const height = 315, width = 480
      const margin = 5, offset = 34
      const {d3} = imports
      const weeks = result.weeks.filter(({date}) => !_history_limit ? true : new Date(date) > new Date(new Date().getFullYear() - _history_limit, 0, 0))
      const d3n = new imports.D3node()
      const svg = d3n.createSVG(width, height)

      //Time range
      const start = new Date(weeks.at(0).date)
      const end = new Date(weeks.at(-1).date)
      const x = d3.scaleTime()
        .domain([start, end])
        .range([margin + offset, width - (offset + margin)])
      svg.append("g")
        .attr("transform", `translate(0,${height - (offset + margin)})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-5,5) rotate(-45)")
        .style("text-anchor", "end")
        .style("font-size", 20)

      //Diff range
      const points = weeks.flatMap(({added, deleted, changed}) => [added + changed, deleted + changed])
      const extremum = Math.max(...points)
      const y = d3.scaleLinear()
        .domain([extremum, -extremum])
        .range([margin, height - (offset + margin)])
      svg.append("g")
        .attr("transform", `translate(${margin + offset},0)`)
        .call(d3.axisLeft(y).ticks(7).tickFormat(d3.format(".2s")))
        .selectAll("text")
        .style("font-size", 20)

      //Generate history
      for (const {type, sign, fill} of [{type: "added", sign: +1, fill: "rgb(63, 185, 80)"}, {type: "deleted", sign: -1, fill: "rgb(218, 54, 51)"}]) {
        svg.append("path")
          .datum(weeks.map(({date, ...diff}) => [new Date(date), sign * (diff[type] + diff.changed)]))
          .attr(
            "d",
            d3.area()
              .x(d => x(d[0]))
              .y0(d => y(d[1]))
              .y1(() => y(0)),
          )
          .attr("fill", fill)
      }
      result.history = d3n.svgString()
    }

    //Results
    return result
  }
  //Handle errors
  catch (error) {
    throw imports.format.error(error)
  }
}
