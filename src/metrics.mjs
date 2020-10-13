//Imports
  import imgb64 from "image-to-base64"
  import SVGO from "svgo"
  import Plugins from "./plugins/index.mjs"

//Setup
  export default async function metrics({login, q}, {template, style, query, graphql, rest, plugins}) {
    //Compute rendering
      try {

        //Query data from GitHub API
          console.debug(`metrics/metrics/${login} > query`)
          const data = await graphql(query
            .replace(/[$]login/, `"${login}"`)
            .replace(/[$]calendar.to/, `"${(new Date()).toISOString()}"`)
            .replace(/[$]calendar.from/, `"${(new Date(Date.now()-14*24*60*60*1000)).toISOString()}"`)
          )

        //Init
          const languages = {colors:{}, total:0, stats:{}}
          const licenses = {favorite:"", used:{}}
          const computed = data.computed = {commits:0, languages, licenses, repositories:{watchers:0, stargazers:0, issues_open:0, issues_closed:0, pr_open:0, pr_merged:0, forks:0}, plugins:{}}
          const avatar = imgb64(data.user.avatarUrl)
          const pending = []

        //Plugins
          if (data.user.websiteUrl)
            Plugins.pagespeed({login, url:data.user.websiteUrl, computed, pending, q}, plugins.pagespeed)
          Plugins.lines({login, repositories:data.user.repositories.nodes.map(({name}) => name), rest, computed, pending, q}, plugins.lines)
          Plugins.traffic({login, repositories:data.user.repositories.nodes.map(({name}) => name), rest, computed, pending, q}, plugins.traffic)

        //Iterate through user's repositories
          for (const repository of data.user.repositories.nodes) {
            //Simple properties with totalCount
              for (const property of ["watchers", "stargazers", "issues_open", "issues_closed", "pr_open", "pr_merged"])
                computed.repositories[property] += repository[property].totalCount
            //Forks
              computed.repositories.forks += repository.forkCount
            //Languages
              for (const {size, node:{color, name}} of Object.values(repository.languages.edges)) {
                languages.stats[name] = (languages.stats[name] || 0) + size
                languages.colors[name] = color || "#ededed"
                languages.total += size
              }
            //License
              if (repository.licenseInfo)
                licenses.used[repository.licenseInfo.spdxId] = (licenses.used[repository.licenseInfo.spdxId] || 0) + 1
          }

        //Compute count for issues and pull requests
          for (const property of ["issues", "pr"])
            computed.repositories[`${property}_count`] = computed.repositories[`${property}_open`] + computed.repositories[`${property}_${property === "pr" ? "merged" : "closed"}`]

        //Compute total commits and sponsorships
          computed.commits = data.user.contributionsCollection.totalCommitContributions + data.user.contributionsCollection.restrictedContributionsCount
          computed.sponsorships = data.user.sponsorshipsAsSponsor.totalCount + data.user.sponsorshipsAsMaintainer.totalCount

        //Compute registration date
          const diff = (Date.now()-(new Date(data.user.createdAt)).getTime())/(365*24*60*60*1000)
          const years = Math.floor(diff)
          const months = Math.ceil((diff-years)*12)
          computed.registration = years ? `${years} year${years > 1 ? "s" : ""} ago` : `${months} month${months > 1 ? "s" : ""} ago`

        //Compute languages stats
          Object.keys(languages.stats).map(name => languages.stats[name] /= languages.total)
          languages.favorites = Object.entries(languages.stats).sort(([an, a], [bn, b]) => b - a).slice(0, 8).map(([name, value]) => ({name, value, color:languages.colors[name], x:0}))
          for (let i = 1; i < languages.favorites.length; i++)
            languages.favorites[i].x = languages.favorites[i-1].x + languages.favorites[i-1].value

        //Compute licenses stats
          licenses.favorite = Object.entries(licenses.used).sort(([an, a], [bn, b]) => b - a).slice(0, 1).map(([name, value]) => name) || ""

        //Compute calendar
          computed.calendar = data.user.calendar.contributionCalendar.weeks.flatMap(({contributionDays}) => contributionDays).slice(0, 14).reverse()

        //Avatar (base64)
          computed.avatar = await avatar || "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

        //Wait for pending promises
          await Promise.all(pending)

        //Eval rendering
          console.debug(`metrics/metrics/${login} > computed`)
          const templated = eval(`\`${template}\``)
          console.debug(`metrics/metrics/${login} > templated`)

        //Optimize rendering
          const svgo = new SVGO({plugins:[{cleanupAttrs:true}, {inlineStyles:false}]})
          const {data:optimized} = await svgo.optimize(templated)
          console.debug(`metrics/metrics/${login} > optimized`)

        //Result
          const rendered = optimized
          return rendered
      }
    //Internal error
      catch (error) { throw (((Array.isArray(error.errors))&&(error.errors[0].type === "NOT_FOUND")) ? new Error("user not found") : error) }
  }