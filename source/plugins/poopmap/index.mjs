//Setup
export default async function({q, imports, data, account}, {enabled = false, token = ""} = {}) {
  //Plugin execution
  try {
    //Check if plugin is enabled and requirements are met
    if ((!enabled)||(!q.poopmap))
      return null

    const {token, days} = imports.metadata.plugins.poopmap.inputs({data, account, q})
    const {data:{poops}} = await imports.axios.get(`https://api.poopmap.net/api/v1/public_links/${token}`)

    const filteredPoops = poops.filter(poop => {
      const createdAt = new Date(poop.created_at)
      const now = new Date().getTime()
      //Days * hours * minutes * seconds * milliseconds
      const timeframe = now - days * 24 * 60 * 60 * 1000

      poop.created_at = createdAt.toString()

      return createdAt.getTime() > timeframe
    })

    const hours = {}
    for (let i = 0; i < filteredPoops.length; i++) {
      const poop = filteredPoops[i]
      const hour = new Date(poop.created_at).getHours()
      hours[hour] = (hours[hour] ?? 0) + 1
      else hours[hour] += 1

      if (!hours.max || hours[hour] > hours.max) hours.max = hours[hour]
    }

    //Results
    return {poops:hours, days}
  }
  //Handle errors
  catch (error) {
    throw {error:{message:"An error occured", instance:error}}
  }
}