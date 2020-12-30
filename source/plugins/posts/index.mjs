//Setup
  export default async function ({imports, data, q}, {enabled = false} = {}) {
    //Plugin execution
      try {
        //Check if plugin is enabled and requirements are met
          if ((!enabled)||(!q.posts))
            return null
        //Parameters override
          const login = data.user.login
          let {"posts.source":source = "", "posts.limit":limit = 4} = q
          //Limit
            limit = Math.max(1, Math.min(30, Number(limit)))
        //Retrieve posts
          console.debug(`metrics/compute/${login}/plugins > posts > processing with source ${source}`)
          let posts = null
          switch (source) {
            //Dev.to
              case "dev.to":{
                console.debug(`metrics/compute/${login}/plugins > posts > querying api`)
                posts = (await imports.axios.get(`https://dev.to/api/articles?username=${login}&state=fresh`)).data.map(({title, readable_publish_date:date}) => ({title, date}))
                break
              }
            //Unsupported
              default:
                throw {error:{message:`Unsupported source "${source}"`}}
          }
        //Format posts
          if (Array.isArray(posts)) {
            //Limit tracklist
              if (limit > 0) {
                console.debug(`metrics/compute/${login}/plugins > posts > keeping only ${limit} posts`)
                posts.splice(limit)
              }
            //Results
              return {source, list:posts}
          }
        //Unhandled error
          throw {error:{message:`An error occured (could not retrieve posts)`}}
      }
    //Handle errors
      catch (error) {
        if (error.error?.message)
          throw error
        throw {error:{message:"An error occured", instance:error}}
      }
  }