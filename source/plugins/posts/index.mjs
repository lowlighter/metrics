//Setup
export default async function({login, data, imports, q, queries, account}, {enabled = false} = {}) {
  //Plugin execution
  try {
    //Check if plugin is enabled and requirements are met
    if ((!enabled) || (!q.posts))
      return null

    //Load inputs
    let {source, descriptions, covers, limit, user} = imports.metadata.plugins.posts.inputs({data, account, q})

    //Retrieve posts
    console.debug(`metrics/compute/${login}/plugins > posts > processing with source ${source}`)
    let posts = null
    let link = null
    switch (source) {
      //Dev.to
      case "dev.to": {
        console.debug(`metrics/compute/${login}/plugins > posts > querying api`)
        posts = (await imports.axios.get(`https://dev.to/api/articles?username=${user}&state=fresh`)).data.map(({title, description, published_at: date, cover_image: image, url: link}) => ({title, description, date, image, link}))
        link = `https://dev.to/${user}`
        break
      }
      //Hashnode
      case "hashnode": {
        posts = (await imports.axios.post("https://api.hashnode.com", {query: queries.posts.hashnode({user})}, {headers: {"Content-type": "application/json"}})).data.data.user.publication.posts.map((
          {title, brief: description, dateAdded: date, coverImage: image, slug},
        ) => ({title, description, date, image, link: `https://hashnode.com/post/${slug}`}))
        link = `https://hashnode.com/@${user}`
        break
      }
      //Unsupported
      default:
        throw {error: {message: `Unsupported source "${source}"`}}
    }

    //Format posts
    if (Array.isArray(posts)) {
      //Limit posts
      if (limit > 0) {
        console.debug(`metrics/compute/${login}/plugins > posts > keeping only ${limit} posts`)
        posts.splice(limit)
      }
      //Cover images
      if (covers) {
        console.debug(`metrics/compute/${login}/plugins > posts > formatting cover images`)
        posts = await Promise.all(posts.map(async ({image, ...post}) => ({image: await imports.imgb64(image, {width: 144, height: -1}), ...post})))
      }
      //Results
      return {user, source, link, descriptions, covers, list: posts}
    }

    //Unhandled error
    throw {error: {message: "An error occured (could not retrieve posts)"}}
  }
  //Handle errors
  catch (error) {
    if (error.error?.message)
      throw error
    throw {error: {message: "An error occured", instance: error}}
  }
}
