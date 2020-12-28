/** Template common processor */
  export default async function ({login, q, dflags}, {conf, data, rest, graphql, plugins, queries}, {s, pending, imports}) {

    //Init
      const computed = data.computed = {commits:0, sponsorships:0, licenses:{favorite:"", used:{}}, token:{}, repositories:{watchers:0, stargazers:0, issues_open:0, issues_closed:0, pr_open:0, pr_merged:0, forks:0, releases:0}}
      const avatar = imports.imgb64(data.user.avatarUrl)
      console.debug(`metrics/compute/${login} > formatting common metrics`)

    //Timezone config
      if (q["config.timezone"]) {
        const timezone = data.config.timezone = {name:q["config.timezone"], offset:0}
        try {
          timezone.offset = Number(new Date().toLocaleString("fr", {timeZoneName:"short", timeZone:timezone.name}).match(/UTC[+](?<offset>\d+)/)?.groups?.offset*60*60*1000) || 0
          console.debug(`metrics/compute/${login} > timezone set to ${timezone.name} (${timezone.offset > 0 ? "+" : ""}${Math.round(timezone.offset/(60*60*1000))} hours)`)
        } catch {
          timezone.error = `Failed to use timezone "${timezone.name}"`
          console.debug(`metrics/compute/${login} > failed to use timezone "${timezone.name}"`)
        }
      }

    //Plugins
      for (const name of Object.keys(imports.plugins)) {
        pending.push((async () => {
          try {
            console.debug(`metrics/compute/${login}/plugins > ${name} > started`)
            data.plugins[name] = await imports.plugins[name]({login, q, imports, data, computed, rest, graphql, queries}, plugins[name])
            console.debug(`metrics/compute/${login}/plugins > ${name} > completed (${data.plugins[name] !== null ? "success" : "skipped"})`)
          }
          catch (error) {
            console.debug(`metrics/compute/${login}/plugins > ${name} > completed (error)`)
            data.plugins[name] = error
          }
          finally {
            const result = {name, result:data.plugins[name]}
            console.debug(imports.util.inspect(result, {depth:Infinity, maxStringLength:256}))
            return result
          }
        })())
      }

    //Iterate through user's repositories
      for (const repository of data.user.repositories.nodes) {
        //Simple properties with totalCount
          for (const property of ["watchers", "stargazers", "issues_open", "issues_closed", "pr_open", "pr_merged", "releases"])
            computed.repositories[property] += repository[property].totalCount
        //Forks
          computed.repositories.forks += repository.forkCount
        //License
          if (repository.licenseInfo)
            computed.licenses.used[repository.licenseInfo.spdxId] = (computed.licenses.used[repository.licenseInfo.spdxId] ?? 0) + 1
      }

    //Total disk usage
      computed.diskUsage = `${imports.bytes(data.user.repositories.totalDiskUsage*1000)}`

    //Compute licenses stats
      computed.licenses.favorite = Object.entries(computed.licenses.used).sort(([an, a], [bn, b]) => b - a).slice(0, 1).map(([name, value]) => name) ?? ""

    //Compute total commits
      computed.commits += data.user.contributionsCollection.totalCommitContributions + data.user.contributionsCollection.restrictedContributionsCount

    //Compute registration date
      const diff = (Date.now()-(new Date(data.user.createdAt)).getTime())/(365*24*60*60*1000)
      const years = Math.floor(diff)
      const months = Math.ceil((diff-years)*12)
      computed.registration = years ? `${years} year${s(years)} ago` : `${months} month${s(months)} ago`
      computed.cakeday = [new Date(), new Date(data.user.createdAt)].map(date => date.toISOString().match(/(?<mmdd>\d{2}-\d{2})(?=T)/)?.groups?.mmdd).every((v, _, a) => v === a[0])

    //Compute calendar
      computed.calendar = data.user.calendar.contributionCalendar.weeks.flatMap(({contributionDays}) => contributionDays).slice(0, 14).reverse()

    //Avatar (base64)
      computed.avatar = await avatar || "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

    //Token scopes
      computed.token.scopes = (await rest.request("HEAD /")).headers["x-oauth-scopes"].split(", ")

    //Meta
      data.meta = {version:conf.package.version, author:conf.package.author}

    //Debug flags
      if ((dflags.includes("--cakeday"))||(q["dflag.cakeday"])) {
        console.debug(`metrics/compute/${login} > applying dflag --cakeday`)
        computed.cakeday = true
      }
      if ((dflags.includes("--hireable"))||(q["dflag.hireable"])) {
        console.debug(`metrics/compute/${login} > applying dflag --hireable`)
        data.user.isHireable = true
      }

  }