//Setup
export default async function({q, imports, data, account}, {enabled = false, token = ""} = {}) {
  //Plugin execution
  try {
    //Check if plugin is enabled and requirements are met
    if ((!enabled) || (!q.poopmap))
      return null

    if (!token)
      return {poops: [], days: 7}

    const {days} = imports.metadata.plugins.poopmap.inputs({data, account, q})
    const {data: {poops}} = await imports.axios.get(`https://api.poopmap.net/api/v1/public_links/${token}`)

    const filteredPoops = poops.filter(poop => {
      const createdAt = new Date(poop.created_at)
      poop.created_at = createdAt.toString()
      return createdAt > new Date().getTime() - days * 24 * 60 * 60 * 1000
    })

    const hours = {max: 0}
    for (let i = 0; i < filteredPoops.length; i++) {
      const poop = filteredPoops[i]
      const hour = new Date(poop.created_at).getHours()
      hours[hour] = (hours[hour] ?? 0) + 1

      hours.max = Math.max(hours[hour], hours.max)
    }

    //Results
    return {poops: hours, days}
  }
  //Handle errors
  catch (error) {
    throw {error: {message: "An error occured", instance: error}}
  }
}
