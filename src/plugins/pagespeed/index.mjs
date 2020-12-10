//Setup
  export default async function ({login, imports, data, q}, {enabled = false, token = null} = {}) {
    //Plugin execution
      try {
        //Check if plugin is enabled and requirements are met
          if ((!enabled)||(!q.pagespeed)||(!data.user.websiteUrl))
            return null
        //Parameters override
          let {"pagespeed.detailed":detailed = false} = q
          //Duration in days
            detailed = !!detailed
        //Format url if needed
          let url = data.user.websiteUrl
          if (!/^https?:[/][/]/.test(url))
            url = `https://${url}`
          const result = {url, detailed, scores:[], metrics:{}}
        //Load scores from API
          const scores = new Map()
          await Promise.all(["performance", "accessibility", "best-practices", "seo"].map(async category => {
            const {score, title} = (await imports.axios.get(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?category=${category}&url=${url}&key=${token}`)).data.lighthouseResult.categories[category]
            scores.set(category, {score, title})
            console.debug(`metrics/compute/${login}/plugins > pagespeed > ${category} audit performed`)
          }))
          result.scores = [scores.get("performance"), scores.get("accessibility"), scores.get("best-practices"), scores.get("seo")]
        //Detailed metrics
          if (detailed)
            Object.assign(result.metrics, ...(await imports.axios.get(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?&url=${url}&key=${token}`)).data.lighthouseResult.audits.metrics.details.items)
        //Integrity check
          if (result.scores.filter(score => score).length < 4)
            throw {error:{message:"Incomplete PageSpeed results"}, url}
        //Results
          return result
      }
    //Handle errors
      catch (error) {
        if (error.response?.status)
          throw {error:{message:`PageSpeed token error (code ${error.response.status})`}, url}
        if (error.error?.message)
          throw error
        console.debug(error)
        throw {error:{message:`An error occured`}}
      }
  }