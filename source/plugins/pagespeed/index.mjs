//Setup
export default async function({login, imports, data, q, account}, {enabled = false, token = null, extras = false} = {}) {
  //Plugin execution
  try {
    //Check if plugin is enabled and requirements are met
    if ((!enabled) || (!q.pagespeed) || (!imports.metadata.plugins.pagespeed.extras("enabled", {extras})))
      return null

    //Load inputs
    let {detailed, screenshot, url, pwa} = imports.metadata.plugins.pagespeed.inputs({data, account, q})
    if (!imports.metadata.plugins.pagespeed.extras("token", {extras, error: false}))
      token = ""

    //Format url if needed
    if (!url)
      throw {error: {message: "Website URL is not set"}}
    if (!/^https?:[/][/]/.test(url))
      url = `https://${url}`
    const {protocol, host} = imports.url.parse(url)
    const result = {url: `${protocol}//${host}`, detailed, scores: [], metrics: {}}

    //Load scores from API
    console.debug(`metrics/compute/${login}/plugins > pagespeed > querying api for ${result.url}`)
    const categories = ["performance", "accessibility", "best-practices", "seo"]
    if (pwa)
      categories.push("pwa")
    let categories_required = ""
    for (const category of categories)
      categories_required += `&category=${category}`

    //Perform audit
    console.debug(`metrics/compute/${login}/plugins > pagespeed > performing audit ${categories_required}`)
    const request = await imports.axios.get(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${url}${categories_required}${token ? `&key=${token}` : ""}`)
    for (const category of categories) {
      const {score, title} = request.data.lighthouseResult.categories[category]
      result.scores.push({score, title})
      console.debug(`metrics/compute/${login}/plugins > pagespeed > performed audit ${category} (status code ${request.status})`)
    }

    //Store screenshot
    if (screenshot)
      result.screenshot = request.data.lighthouseResult.audits["final-screenshot"].details.data

    //Detailed metrics
    if (detailed) {
      console.debug(`metrics/compute/${login}/plugins > pagespeed > performing detailed audit`)
      const request = await imports.axios.get(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?&url=${url}${token ? `&key=${token}` : ""}`)
      Object.assign(result.metrics, ...request.data.lighthouseResult.audits.metrics.details.items)
      console.debug(`metrics/compute/${login}/plugins > pagespeed > performed detailed audit (status code ${request.status})`)
    }

    //Results
    return result
  }
  //Handle errors
  catch (error) {
    throw imports.format.error(error, {
      descriptions: {
        "429": '(consider using "plugin_pagespeed_token")',
        custom(error) {
          const description = error.response?.data?.error?.message?.match(/Lighthouse returned error: (?<description>[A-Z_]+)/)?.groups?.description ?? null
          if (description) {
            const status = error.response?.status
            return `API error: ${status} (${description})`
          }
          return null
        },
      },
    })
  }
}
