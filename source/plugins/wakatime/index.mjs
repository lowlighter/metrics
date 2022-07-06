//Setup
export default async function({login, q, imports, data, account}, {enabled = false, token, extras = false} = {}) {
  //Plugin execution
  try {
    //Check if plugin is enabled and requirements are met
    if ((!enabled) || (!q.wakatime) || (!imports.metadata.plugins.wakatime.extras("enabled", {extras})))
      return null

    //Load inputs
    let {sections, days, limit, url, user, "languages.other": others, "languages.ignored": _ignored, "repositories.visibility": repositoriesVisibility} = imports.metadata.plugins.wakatime.inputs({data, account, q})

    if (!limit)
      limit = void limit

    const showOnlyGithubPublicRepos = repositoriesVisibility === "public"

    const range = {
      "7": "last_7_days",
      "30": "last_30_days",
      "180": "last_6_months",
      "365": "last_year",
    }[days] ?? "last_7_days"

    //Querying api and format result (https://wakatime.com/developers#stats)
    console.debug(`metrics/compute/${login}/plugins > wakatime > querying api`)
    const {data: {data: stats}} = await imports.axios.get(`${url}/api/v1/users/${user}/stats/${range}?api_key=${token}`)

    const projectStats = stats.projects?.map(({name, percent, total_seconds: total}) => ({name, percent: percent / 100, total})).sort((a, b) => b.percent - a.percent)
    const projects = showOnlyGithubPublicRepos ? await pickOnlyGithubPublicRepos({limit, login, axios: imports.axios, projects: projectStats}) : projectStats?.slice(0, limit)

    const result = {
      sections,
      days,
      projects,
      time: {
        total: (others ? stats.total_seconds_including_other_language : stats.total_seconds) / (60 * 60),
        daily: (others ? stats.daily_average_including_other_language : stats.daily_average) / (60 * 60),
      },
      languages: stats.languages?.map(({name, percent, total_seconds: total}) => ({name, percent: percent / 100, total})).filter(({name}) => _ignored.length ? !_ignored.includes(name.toLocaleLowerCase()) : true).sort((a, b) => b.percent - a.percent).slice(0, limit),
      os: stats.operating_systems?.map(({name, percent, total_seconds: total}) => ({name, percent: percent / 100, total})).sort((a, b) => b.percent - a.percent).slice(0, limit),
      editors: stats.editors?.map(({name, percent, total_seconds: total}) => ({name, percent: percent / 100, total})).sort((a, b) => b.percent - a.percent).slice(0, limit),
    }

    //Result
    return result
  }
  //Handle errors
  catch (error) {
    throw imports.format.error(error)
  }
}

async function pickOnlyGithubPublicRepos({projects, axios, login, limit}) {
  const result = []

  for await (const project of projects) {
    if (result.length >= limit)
      break
    try {
      console.debug(`metrics/compute/${login}/plugins > wakatime > checking 'https://github.com/${login}/${project.name}'`)
      await axios.head(`https://github.com/${login}/${project.name}`)

      result.push(project)
    }
    catch {
      continue
    }
  }

  if (result.length === 0)
    return undefined
  return result
}
