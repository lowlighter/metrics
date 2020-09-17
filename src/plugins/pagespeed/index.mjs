//Imports
  import axios from "axios"

//Setup
  export default function ({url, computed, pending, q}, {enabled = false, token = null} = {}) {
    //Check if plugin is enabled and requirements are met
      if (!enabled)
        return computed.plugins.pagespeed = null
      if (!url)
        return computed.plugins.pagespeed = null
      if (!q.pagespeed)
        return computed.plugins.pagespeed = null

    //Plugin execution
      pending.push(new Promise(async solve => {
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
          solve()
      }))
  }