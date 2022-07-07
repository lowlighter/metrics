/**
 * Core plugin is a special plugin because of historical reasons.
 * It is used by templates to setup global configuration.
 */

//Setup
export default async function({login, q}, {conf, data, rest, graphql, plugins, queries, account, convert, template, callbacks}, {pending, imports}) {
  //Load inputs
  const {"config.animations": animations, "config.display": display, "config.timezone": _timezone, "config.base64": _base64, "debug.flags": dflags} = imports.metadata.plugins.core.inputs({data, account, q})
  imports.metadata.templates[template].check({q, account, format: convert})

  //Base64 images
  if (!_base64) {
    console.debug(`metrics/compute/${login} > base64 for images has been disabled`)
    imports.imgb64 = url => url
  }

  //Init
  const computed = {
    commits: 0,
    sponsorships: 0,
    licenses: {favorite: "", used: {}, about: {}},
    token: {},
    repositories: {watchers: 0, stargazers: 0, issues_open: 0, issues_closed: 0, pr_open: 0, pr_closed: 0, pr_merged: 0, forks: 0, forked: 0, releases: 0, deployments: 0, environments: 0},
  }
  const avatar = imports.imgb64(data.user.avatarUrl)
  data.computed = computed
  console.debug(`metrics/compute/${login} > formatting common metrics`)

  //Timezone config
  const offset = Number(new Date().toLocaleString("fr", {timeZoneName: "short"}).match(/UTC[+](?<offset>\d+)/)?.groups?.offset * 60 * 60 * 1000) || 0
  if (_timezone) {
    const timezone = {name: _timezone, offset: 0}
    data.config.timezone = timezone
    try {
      timezone.offset = offset - (Number(new Date().toLocaleString("fr", {timeZoneName: "short", timeZone: timezone.name}).match(/UTC[+](?<offset>\d+)/)?.groups?.offset * 60 * 60 * 1000) || 0)
      console.debug(`metrics/compute/${login} > timezone set to ${timezone.name} (${timezone.offset > 0 ? "+" : ""}${Math.round(timezone.offset / (60 * 60 * 1000))} hours)`)
    }
    catch {
      timezone.error = `Failed to use timezone "${timezone.name}"`
      console.debug(`metrics/compute/${login} > failed to use timezone "${timezone.name}"`)
    }
  }
  else if (process?.env?.TZ) {
    data.config.timezone = {name: process.env.TZ, offset}
  }

  //Display
  data.large = display === "large"
  data.columns = display === "columns"

  //Animations
  data.animated = animations
  console.debug(`metrics/compute/${login} > animations ${data.animated ? "enabled" : "disabled"}`)

  //Extras features
  const extras = conf.settings?.extras?.features ?? conf.settings?.extras?.default ?? false
  console.debug(`metrics/compute/${login} > extras > ${JSON.stringify(extras)}`)

  //Plugins
  for (const name of Object.keys(imports.plugins)) {
    if ((!plugins[name]?.enabled) || (!q[name]))
      continue
    pending.push((async () => {
      try {
        console.debug(`metrics/compute/${login}/plugins > ${name} > started`)
        data.plugins[name] = await imports.plugins[name]({login, q, imports, data, computed, rest, graphql, queries, account}, {extras, sandbox: conf.settings?.sandbox ?? false, ...plugins[name]})
        console.debug(`metrics/compute/${login}/plugins > ${name} > completed`)
      }
      catch (error) {
        console.debug(`metrics/compute/${login}/plugins > ${name} > completed (error)`)
        data.plugins[name] = error
      }
      finally {
        const result = {name, result: data.plugins[name]}
        console.debug(imports.util.inspect(result, {depth: Infinity, maxStringLength: 256, getters: true}))
        await callbacks?.plugin?.(login, name, !data.plugins[name].error, data.plugins[name]).catch(error => console.debug(`metrics/compute/${login}/plugins/callbacks > ${name} > ${error}`))
        return result
      }
    })())
  }

  //Iterate through user's repositories
  for (const repository of data.user.repositories.nodes) {
    //Simple properties with totalCount
    for (const property of ["watchers", "stargazers", "issues_open", "issues_closed", "pr_open", "pr_closed", "pr_merged", "releases", "deployments", "environments"])
      computed.repositories[property] += repository[property]?.totalCount ?? 0
    //Forks
    computed.repositories.forks += repository.forkCount
    if (repository.isFork)
      computed.repositories.forked++
    //License
    if (repository.licenseInfo) {
      computed.licenses.used[repository.licenseInfo.spdxId] = (computed.licenses.used[repository.licenseInfo.spdxId] ?? 0) + 1
      computed.licenses.about[repository.licenseInfo.spdxId] = repository.licenseInfo
    }
  }

  //Total disk usage
  computed.diskUsage = `${imports.format.bytes(data.user.repositories.totalDiskUsage * 1000)}`

  //Compute licenses stats
  computed.licenses.favorite = Object.entries(computed.licenses.used).sort(([_an, a], [_bn, b]) => b - a).slice(0, 1).map(([name, _value]) => name) ?? ""

  //Compute total commits
  computed.commits += data.user.contributionsCollection.totalCommitContributions + data.user.contributionsCollection.restrictedContributionsCount

  //Compute registration date
  const now = Date.now()
  const created = new Date(data.user.createdAt)
  const diff = new Date(now - created)
  const years = diff.getUTCFullYear() - new Date(0).getUTCFullYear()
  const months = diff.getUTCMonth() - new Date(0).getUTCMonth()
  const days = diff.getUTCDate() - new Date(0).getUTCDate()

  computed.registered = {years: years + days / 365.25, months}
  computed.registration = years ? `${years} year${imports.s(years)} ago` : months ? `${months} month${imports.s(months)} ago` : `${days} day${imports.s(days)} ago`
  computed.cakeday = (years >= 1 && months === 0 && days === 0) ? true : false

  //Compute calendar
  computed.calendar = data.user.calendar.contributionCalendar.weeks.flatMap(({contributionDays}) => contributionDays).slice(-14)

  //Avatar (base64)
  computed.avatar = await avatar || "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

  //Token scopes
  try {
    computed.token.scopes = conf.settings.notoken ? [] : (await rest.request("HEAD /")).headers["x-oauth-scopes"].split(", ")
  }
  catch (error) {
    console.debug(error)
    computed.token.scopes = []
  }

  //Meta
  data.meta = {
    version: conf.package.version,
    author: conf.package.author,
    generated: imports.format.date(new Date(), {date: true, time: true}),
  }

  //Debug flags
  if (dflags.includes("--cakeday")) {
    console.debug(`metrics/compute/${login} > applying dflag --cakeday`)
    computed.cakeday = true
  }
  if (dflags.includes("--halloween")) {
    console.debug(`metrics/compute/${login} > applying dflag --halloween`)
    //Haloween color replacer
    const halloween = content =>
      content
        .replace(/--color-calendar-graph/g, "--color-calendar-halloween-graph")
        .replace(/#9be9a8/gi, "var(--color-calendar-halloween-graph-day-L1-bg)")
        .replace(/#40c463/gi, "var(--color-calendar-halloween-graph-day-L2-bg)")
        .replace(/#30a14e/gi, "var(--color-calendar-halloween-graph-day-L3-bg)")
        .replace(/#216e39/gi, "var(--color-calendar-halloween-graph-day-L4-bg)")
    //Update contribution calendar colors
    computed.calendar.map(day => day.color = halloween(day.color))
    //Update isocalendar colors
    const waiting = [...pending]
    pending.push((async () => {
      await Promise.all(waiting)
      if (data.plugins.isocalendar?.svg)
        data.plugins.isocalendar.svg = halloween(data.plugins.isocalendar.svg)
      return {name: "dflag.halloween", result: true}
    })())
  }
  if (dflags.includes("--error")) {
    console.debug(`metrics/compute/${login} > applying dflag --error`)
    throw new Error("Failed as requested by --error flag")
  }

  //Results
  return null
}
