//Setup
export default async function({login, q, imports, data, account}, {enabled = false, token} = {}) {
  //Plugin execution
  try {
    //Check if plugin is enabled and requirements are met
    if (!enabled || !q.wakatime)
      return null

    //Load inputs
    let {sections, days, limit, url, user} = imports.metadata.plugins.wakatime.inputs({data, account, q})
    if (!limit)
      limit = void limit
    const range = {
      "7":"last_7_days",
      "30":"last_30_days",
      "180":"last_6_months",
      "365":"last_year",
    }[days] ?? "last_7_days"

    //Querying api and format result (https://wakatime.com/developers#stats)
    console.debug(`metrics/compute/${login}/plugins > wakatime > querying api`)
    const {data:{data:stats}} = await imports.axios.get(`${url}/api/v1/users/${user}/stats/${range}?api_key=${token}`)
    const result = {
      sections,
      days,
      time:{
        total:stats.total_seconds / (60 * 60),
        daily:stats.daily_average / (60 * 60),
      },
      projects:stats.projects?.map(({name, percent, total_seconds:total}) => ({name, percent:percent / 100, total})).sort((a, b) => b.percent - a.percent).slice(0, limit),
      languages:stats.languages?.map(({name, percent, total_seconds:total}) => ({name, percent:percent / 100, total})).sort((a, b) => b.percent - a.percent).slice(0, limit),
      os:stats.operating_systems?.map(({name, percent, total_seconds:total}) => ({name, percent:percent / 100, total})).sort((a, b) => b.percent - a.percent).slice(0, limit),
      editors:stats.editors?.map(({name, percent, total_seconds:total}) => ({name, percent:percent / 100, total})).sort((a, b) => b.percent - a.percent).slice(0, limit),
    }

    //Result
    return result
  }
  //Handle errors
  catch (error) {
    let message = "An error occured"
    if (error.isAxiosError) {
      const status = error.response?.status
      message = `API returned ${status}`
      error = error.response?.data ?? null
    }
    throw {error:{message, instance:error}}
  }
}
