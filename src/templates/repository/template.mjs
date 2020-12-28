//Imports
  import common from "./../common.mjs"

/** Template processor */
  export default async function ({login, q}, {conf, data, rest, graphql, plugins, queries}, {s, pending, imports}) {
    //Check arguments
      const {repo} = q
      if (!repo) {
        console.debug(`metrics/compute/${login}/${repo} > error, repo was undefined`)
        data.errors.push({error:{message:`You must pass a "repo" argument to use this template`}})
        return await common(...arguments)
      }

    //Retrieving single repository
      console.debug(`metrics/compute/${login}/${repo} > retrieving single repository ${repo}`)
      const {user:{repository}} = await graphql(queries.repository({login, repo}))
      data.user.repositories.nodes = [repository]

    //Get commit activity
      console.debug(`metrics/compute/${login}/${repo} > querying api for commits`)
      const commits = []
      for (let page = 0; page < 100; page++) {
        console.debug(`metrics/compute/${login}/${repo} > loading page ${page}`)
        const {data} = await rest.repos.listCommits({owner:login, repo, per_page:100, page})
        if (!data.length) {
          console.debug(`metrics/compute/${login}/${repo} > no more page to load`)
          break
        }
        commits.push(...data)
      }
      console.debug(`metrics/compute/${login}/${repo} > ${commits.length} commits loaded`)

    //Override creation date and disk usage
      data.user.createdAt = repository.createdAt
      data.user.repositories.totalDiskUsage = repository.diskUsage

    //Override contributions calendar
      const days = 14
      //Compute relative date for each contribution
        const now = new Date()
        now.setHours(0, 0, 0, 0)
        const contributions = commits.map(({commit}) => Math.abs(Math.ceil((now - new Date(commit.committer.date))/(24*60*60*1000))))
      //Count contributions per relative day
        const calendar = new Array(days).fill(0)
        for (const day of contributions)
          calendar[day]++
        calendar.splice(days)
        const max = Math.max(...calendar)
      //Override contributions calendar
        data.user.calendar.contributionCalendar.weeks = calendar.map(commit => ({contributionDays:{color:commit ? `var(--color-calendar-graph-day-L${Math.ceil(commit/max/0.25)}-bg)` : "var(--color-calendar-graph-day-bg)"}}))

    //Override plugins parameters
      q["projects.limit"] = 0

    //Common
      await common(...arguments)
      await Promise.all(pending)

    //Reformat projects names
      if (data.plugins.projects)
        data.plugins.projects.list?.map(project => project.name = project.name.replace(`(${login}/${repo})`, "").trim())
  }