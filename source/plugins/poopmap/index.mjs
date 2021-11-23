//Setup
export default async function({_login, q, imports, _data, _computed, _rest, _graphql, _queries, _account}, {enabled = false} = {}) {
  //Plugin execution
  try {
    //Check if plugin is enabled and requirements are met
    if ((!enabled)||(!q.poopmap))
      return null

    const {data:{poops}} = imports.axios.get(`https://api.poopmap.net/api/v1/public_links/${q.token}`)

    const filteredPoops = poops.filter(poop => {
      const createdAt = new Date(poop.created_at)
      const now = new Date().getTime()
      //Days * hours * minutes * seconds * milliseconds
      const timeframe = now - (q.days ?? 7) * 24 * 60 * 60 * 1000

      poop.created_at = createdAt.toString()

      return createdAt.getTime() > timeframe
    })

    //Results
    return filteredPoops
  }
  //Handle errors
  catch (error) {
    throw {error:{message:"An error occured", instance:error}}
  }
}