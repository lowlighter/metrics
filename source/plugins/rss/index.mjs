//Setup
export default async function({login, q, imports, data, account}, {enabled = false} = {}) {
  //Plugin execution
  try {
    //Check if plugin is enabled and requirements are met
    if ((!enabled) || (!q.rss))
      return null

    //Load inputs
    let {source, limit} = imports.metadata.plugins.rss.inputs({data, account, q})
    if (!source)
      throw {error: {message: "A RSS feed is required"}}

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
    if (error.error?.message)
      throw error
    throw {error: {message: "An error occured", instance: error}}
  }
}
