//Setup
  export default async function ({login, rest, imports, q}, {enabled = false, from:defaults = 100} = {}) {
    //Plugin execution
      try {
        //Check if plugin is enabled and requirements are met
          if ((!enabled)||(!q.habits))
            return null
        //Parameters override
          let {"habits.from":from = defaults.from ?? 500, "habits.days":days = 30, "habits.facts":facts = true, "habits.charts":charts = false} = q
          //Events
            from = Math.max(1, Math.min(1000, Number(from)))
          //Days
            days = Math.max(1, Math.min(30, Number(from)))
        //Initialization
          const habits = {facts, charts, commits:{hour:NaN, hours:{}, day:NaN, days:{}}, indents:{style:"", spaces:0, tabs:0}, linguist:{available:false, ordered:[], languages:{}}}
          const pages = Math.ceil(from/100)
        //Get user recent activity
          const events = []
          try {
            for (let page = 0; page < pages; page++) {
              console.debug(`metrics/compute/${login}/plugins > habits > loaded page ${page}`)
              events.push(...(await rest.activity.listEventsForAuthenticatedUser({username:login, per_page:100, page})).data)
            }
          } catch { console.debug(`metrics/compute/${login}/plugins > habits > no more events to load`) }
          console.debug(`metrics/compute/${login}/plugins > habits > no more events to load (${events.length} loaded)`)
        //Get user recent commits
          const commits = events
            .filter(({type}) => type === "PushEvent")
            .filter(({actor}) => actor.login === login)
            .filter(({created_at}) => new Date(created_at) > new Date(Date.now()-days*24*60*60*1000))
          console.debug(`metrics/compute/${login}/plugins > habits > filtered out ${commits.length} commits`)
          const actor = commits[0]?.actor?.id ?? 0
        //Retrieve edited files and filter edited lines (those starting with +/-) from patches
          const patches = [...await Promise.allSettled(commits
            .flatMap(({payload}) => payload.commits).map(commit => commit.url)
            .map(async commit => (await rest.request(commit)).data.files)
          )]
            .filter(({status}) => status === "fulfilled")
            .map(({value}) => value)
            .flatMap(files => files.map(file => ({name:imports.paths.basename(file.filename), patch:file.patch ?? ""})))
            .map(({name, patch}) => ({name, patch:patch.split("\n").filter(line => /^[-+]/.test(line)).map(line => line.substring(1)).join("\n")}))
        //Commit day
          {
            //Compute commit days
              const days = commits.map(({created_at}) => (new Date(created_at)).getDay())
              for (const day of days)
                habits.commits.days[day] = (habits.commits.days[day] ?? 0) + 1
              habits.commits.days.max = Math.max(...Object.values(habits.commits.days))
            //Compute day with most commits
              habits.commits.day = days.length ? ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][Object.entries(habits.commits.days).sort(([an, a], [bn, b]) => b - a).map(([day, occurence]) => day)[0]] ?? NaN : NaN
          }
        //Commit hour
          {
            //Compute commit hours
              const hours = commits.map(({created_at}) => (new Date(created_at)).getHours())
              for (const hour of hours)
                habits.commits.hours[hour] = (habits.commits.hours[hour] ?? 0) + 1
              habits.commits.hours.max = Math.max(...Object.values(habits.commits.hours))
            //Compute hour with most commits
              habits.commits.hour = hours.length ? `${Object.entries(habits.commits.hours).sort(([an, a], [bn, b]) => b - a).map(([hour, occurence]) => hour)[0]}`.padStart(2, "0") : NaN
          }
        //Indent style
          {
            //Attempt to guess whether tabs or spaces are used in patches
              patches
                .map(({patch}) => patch.match(/((?:\t)|(?:  )) /gm) ?? [])
                .forEach(indent => habits.indents[/^\t/.test(indent) ? "tabs" : "spaces"]++)
              habits.indents.style = habits.indents.spaces > habits.indents.tabs ? "spaces" : habits.indents.tabs > habits.indents.spaces ? "tabs" : ""
          }
        //Linguist
          if (charts) {
            //Check if linguist exists
              const prefix = {win32:"wsl"}[process.platform] ?? ""
              if ((patches.length)&&(await imports.run(`${prefix} which github-linguist`))) {
                //Setup for linguist
                  habits.linguist.available = true
                  const path = imports.paths.join(imports.os.tmpdir(), `${actor}`)
                  //Create temporary directory and save patches
                    await imports.fs.mkdir(path, {recursive:true})
                    await Promise.all(patches.map(async ({name, patch}, i) => await imports.fs.writeFile(imports.paths.join(path, `${i}${imports.paths.extname(name)}`), patch)))
                    console.debug(`metrics/compute/${login}/plugins > habits > created temp dir ${path} with ${patches.length} files`)
                  //Create temporary git repository
                    await imports.run(`git init && git add . && git config user.name "linguist" && git config user.email "null@github.com" && git commit -m "linguist"`, {cwd:path}).catch(console.debug)
                    await imports.run(`git status`, {cwd:path})
                    console.debug(`metrics/compute/${login}/plugins > habits > created temp git repository`)
                //Spawn linguist process
                  console.debug(`metrics/compute/${login}/plugins > habits > running linguist`)
                  ;(await imports.run(`${prefix} github-linguist`, {cwd:path}))
                  //Parse linguist result
                    .split("\n").map(line => line.match(/(?<value>[\d.]+)%\s+(?<language>\w+)/)?.groups).filter(line => line)
                    .map(({value, language}) => habits.linguist.languages[language] = (habits.linguist.languages[language] ?? 0) + value/100)
                  habits.linguist.ordered = Object.entries(habits.linguist.languages).sort(([an, a], [bn, b]) => b - a)
              }
              else
                console.debug(`metrics/compute/${login}/plugins > habits > linguist is not available`)
          }
        //Results
          return habits
      }
    //Handle errors
      catch (error) {
        console.debug(error)
        throw {error:{message:`An error occured`}}
      }
  }