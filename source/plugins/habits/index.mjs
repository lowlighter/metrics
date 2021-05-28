//Setup
export default async function({login, data, rest, imports, q, account}, {enabled = false, ...defaults} = {}) {
  //Plugin execution
  try {
    //Check if plugin is enabled and requirements are met
    if ((!enabled) || (!q.habits))
      return null

    //Load inputs
    let {from, days, facts, charts} = imports.metadata.plugins.habits.inputs({data, account, q}, defaults)

    //Initialization
    const habits = {facts, charts, lines:{average:{chars:0}}, commits:{hour:NaN, hours:{}, day:NaN, days:{}}, indents:{style:"", spaces:0, tabs:0}, linguist:{available:false, ordered:[], languages:{}}}
    const pages = Math.ceil(from / 100)
    const offset = data.config.timezone?.offset ?? 0

    //Get user recent activity
    console.debug(`metrics/compute/${login}/plugins > habits > querying api`)
    const events = []
    try {
      for (let page = 1; page <= pages; page++) {
        console.debug(`metrics/compute/${login}/plugins > habits > loading page ${page}`)
        events.push(...(await rest.activity.listEventsForAuthenticatedUser({username:login, per_page:100, page})).data)
      }
    }
    catch {
      console.debug(`metrics/compute/${login}/plugins > habits > no more page to load`)
    }
    console.debug(`metrics/compute/${login}/plugins > habits > ${events.length} events loaded`)

    //Get user recent commits
    const commits = events
      .filter(({type}) => type === "PushEvent")
      .filter(({actor}) => account === "organization" ? true : actor.login === login)
      .filter(({created_at}) => new Date(created_at) > new Date(Date.now() - days * 24 * 60 * 60 * 1000))
    console.debug(`metrics/compute/${login}/plugins > habits > filtered out ${commits.length} push events over last ${days} days`)

    //Retrieve edited files and filter edited lines (those starting with +/-) from patches
    console.debug(`metrics/compute/${login}/plugins > habits > loading patches`)
    const patches = [
      ...await Promise.allSettled(
        commits
          .flatMap(({payload}) => payload.commits)
          .filter(({author}) => data.shared["commits.authoring"].filter(authoring => author.email.includes(authoring)||author.name.includes(authoring)).length)
          .map(async commit => (await rest.request(commit)).data.files),
      ),
    ]
      .filter(({status}) => status === "fulfilled")
      .map(({value}) => value)
      .flatMap(files => files.map(file => ({name:imports.paths.basename(file.filename), patch:file.patch ?? ""})))
      .map(({name, patch}) => ({name, patch:patch.split("\n").filter(line => /^[+]/.test(line)).map(line => line.substring(1)).join("\n")}))

    //Commit day
    {
      //Compute commit days
      console.debug(`metrics/compute/${login}/plugins > habits > searching most active day of week`)
      const days = commits.map(({created_at}) => (new Date(new Date(created_at).getTime() + offset)).getDay())
      for (const day of days)
        habits.commits.days[day] = (habits.commits.days[day] ?? 0) + 1
      habits.commits.days.max = Math.max(...Object.values(habits.commits.days))
      //Compute day with most commits
      habits.commits.day = days.length ? ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][Object.entries(habits.commits.days).sort(([_an, a], [_bn, b]) => b - a).map(([day, _occurence]) => day)[0]] ?? NaN : NaN
    }

    //Commit hour
    {
      //Compute commit hours
      console.debug(`metrics/compute/${login}/plugins > habits > searching most active time of day`)
      const hours = commits.map(({created_at}) => (new Date(new Date(created_at).getTime() + offset)).getHours())
      for (const hour of hours)
        habits.commits.hours[hour] = (habits.commits.hours[hour] ?? 0) + 1
      habits.commits.hours.max = Math.max(...Object.values(habits.commits.hours))
      //Compute hour with most commits
      habits.commits.hour = hours.length ? `${Object.entries(habits.commits.hours).sort(([_an, a], [_bn, b]) => b - a).map(([hour, _occurence]) => hour)[0]}`.padStart(2, "0") : NaN
    }

    //Indent style
    {
      //Attempt to guess whether tabs or spaces are used in patches
      console.debug(`metrics/compute/${login}/plugins > habits > searching indent style`)
      patches
        .map(({patch}) => patch.match(/((?:\t)|(?:[ ]{2})) /gm) ?? [])
        .forEach(indent => habits.indents[/^\t/.test(indent) ? "tabs" : "spaces"]++)
      habits.indents.style = habits.indents.spaces > habits.indents.tabs ? "spaces" : habits.indents.tabs > habits.indents.spaces ? "tabs" : ""
    }

    //Average characters per line
    {
      //Compute average number of characters per line of code fetched
      console.debug(`metrics/compute/${login}/plugins > habits > computing average number of characters per line of code`)
      const lines = patches.flatMap(({patch}) => patch.split("\n").map(line => line.length))
      habits.lines.average.chars = lines.reduce((a, b) => a + b, 0)/lines.length
    }

    //Linguist
    if (charts) {
      //Check if linguist exists
      console.debug(`metrics/compute/${login}/plugins > habits > searching recently used languages using linguist`)
      if ((patches.length) && (await imports.which("github-linguist"))) {
        //Setup for linguist
        habits.linguist.available = true
        const path = imports.paths.join(imports.os.tmpdir(), `${commits[0]?.actor?.id ?? 0}`)
        //Create temporary directory and save patches
        console.debug(`metrics/compute/${login}/plugins > habits > creating temp dir ${path} with ${patches.length} files`)
        await imports.fs.mkdir(path, {recursive:true})
        await Promise.all(patches.map(({name, patch}, i) => imports.fs.writeFile(imports.paths.join(path, `${i}${imports.paths.extname(name)}`), patch)))
        //Create temporary git repository
        console.debug(`metrics/compute/${login}/plugins > habits > creating temp git repository`)
        const git = await imports.git(path)
        await git.init().add(".").addConfig("user.name", "linguist").addConfig("user.email", "<>").commit("linguist").status()
        //Spawn linguist process
        console.debug(`metrics/compute/${login}/plugins > habits > running linguist`)
        ;(await imports.run("github-linguist --breakdown", {cwd:path}))
          //Parse linguist result
          .split("\n").map(line => line.match(/(?<value>[\d.]+)%\s+(?<language>[\s\S]+)$/)?.groups).filter(line => line)
          .map(({value, language}) => habits.linguist.languages[language] = (habits.linguist.languages[language] ?? 0) + value / 100)
        habits.linguist.ordered = Object.entries(habits.linguist.languages).sort(([_an, a], [_bn, b]) => b - a)
        //Cleaning
        console.debug(`metrics/compute/${login}/plugins > habits > cleaning temp dir ${path}`)
        await imports.fs.rmdir(path, {recursive:true})
      }
      else
        console.debug(`metrics/compute/${login}/plugins > habits > linguist not available`)

    }

    //Results
    return habits
  }
  //Handle errors
  catch (error) {
    if (error.error?.message)
      throw error
    throw {error:{message:"An error occured", instance:error}}
  }
}
