//Setup
  export default async function ({imports, data, q}, {enabled = false, token = null} = {}) {
    //Plugin execution
      try {
        //Check if plugin is enabled and requirements are met
          if ((!enabled)||(!q.pagespeed)||(!data.user.websiteUrl))
            return null
        //Format url if needed
          let url = data.user.websiteUrl
          if (!/^https?:[/][/]/.test(url))
            url = `https://${url}`
        //Load scores from API
          const scores = new Map()
          await Promise.all(["performance", "accessibility", "best-practices", "seo"].map(async category => {
            const {score, title} = (await imports.axios.get(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?category=${category}&url=${url}&key=${token}`)).data.lighthouseResult.categories[category]
            scores.set(category, {score, title})
          }))
        //Results
          return {url, scores:[scores.get("performance"), scores.get("accessibility"), scores.get("best-practices"), scores.get("seo")]}
      }
    //Handle errors
      catch (error) {
        if (error.response?.status)
          throw {error:{message:`PageSpeed token error (code ${error.response.status})`}, url}
        throw {error:{message:`An error occured`}}
      }
  }