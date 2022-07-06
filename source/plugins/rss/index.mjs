//Setup
export default async function({login, q, imports, data, account}, {enabled = false, extras = false} = {}) {
  //Plugin execution
  try {
    //Check if plugin is enabled and requirements are met
    if ((!enabled) || (!q.rss) || (!imports.metadata.plugins.rss.extras("enabled", {extras})))
      return null

    //Load inputs
    let {source, limit} = imports.metadata.plugins.rss.inputs({data, account, q})
    if (!source)
      throw {error: {message: "RSS feed URL is not set"}}

    //Load rss feed
    const {title, description, link, items} = await (new imports.rss()).parseURL(source) //eslint-disable-line new-cap
    const feed = items.map(({title, link, isoDate: date}) => ({title, link, date: new Date(date)}))

    //Limit feed
    if (limit > 0) {
      console.debug(`metrics/compute/${login}/plugins > rss > keeping only ${limit} items`)
      feed.splice(limit)
    }

    //Results
    return {source: title, description, link, feed}
  }
  //Handle errors
  catch (error) {
    throw imports.format.error(error)
  }
}
