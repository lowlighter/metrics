//Imports
  import axios from "axios"

//Setup
  export default function ({login, url, computed, pending, q}, {enabled = false, token = null} = {}) {
    //Check if plugin is enabled and requirements are met
      if (!enabled)
        return computed.plugins.pagespeed = null
      if (!url)
        return computed.plugins.pagespeed = null
      if (!q.pagespeed)
        return computed.plugins.pagespeed = null
      console.debug(`metrics/compute/${login}/plugins > pagespeed`)
      computed.svg.height += 130

    //Plugin execution
      pending.push(new Promise(async solve => {
        try {
          //Format url if needed
            if (!/^https?:[/][/]/.test(url))
              url = `https://${url}`
          //Load scores from API
            const scores = new Map()
            await Promise.all(["performance", "accessibility", "best-practices", "seo"].map(async category => {
              const {score, title} = (await axios.get(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?category=${category}&url=${url}&key=${token}`)).data.lighthouseResult.categories[category]
              scores.set(category, {score, title})
            }))
          //Save results
            computed.plugins.pagespeed = {url, scores:[scores.get("performance"), scores.get("accessibility"), scores.get("best-practices"), scores.get("seo")]}
            console.debug(`metrics/compute/${login}/plugins > pagespeed > success`)
            console.debug(JSON.stringify(computed.plugins.pagespeed))
            solve()
        }
        catch (error) {
          //Thrown when token is incorrect
            if ((error.response)&&(error.response.status)) {
              computed.plugins.pagespeed = {url, error:`PageSpeed token error (code ${error.response.status})`}
              console.debug(`metrics/plugins/pagespeed/${login} > ${error.response.status}`)
              return solve()
            }
          //Generic error
            computed.plugins.pagespeed = {error:`An error occured`}
            console.debug(`metrics/compute/${login}/plugins > pagespeed > error`)
            console.debug(error)
            solve()
        }
      }))
  }