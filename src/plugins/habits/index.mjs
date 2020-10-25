//Setup
  export default function ({login, imports, rest, computed, pending, q}, {enabled = false, from:_from = 100} = {}) {
    //Check if plugin is enabled and requirements are met
      if (!enabled)
        return computed.plugins.habits = null
      if (!q.habits)
        return computed.plugins.habits = null
      console.debug(`metrics/compute/${login}/plugins > habits`)

    //Parameters override
      //Events
        const from = Math.max(1, Math.min(100, "habits.from" in q ? Number(q["habits.from"])||0 : _from))
        console.debug(`metrics/compute/${login}/plugins > habits > events = ${from}`)

    //Plugin execution
      pending.push(new Promise(async solve => {
        try {
          //Initialization
            const habits = {commits:{hour:NaN, hours:{}}, indents:{style:"", spaces:0, tabs:0}}
          //Get user recent commits from events
            const events = await rest.activity.listEventsForAuthenticatedUser({username:login, per_page:from})
            const commits = events.data
              .filter(({type}) => type === "PushEvent")
              .filter(({actor}) => actor.login === login)
          //Commit hour
            {
              //Compute commit hours
                const hours = commits.map(({created_at}) => (new Date(created_at)).getHours())
                for (const hour of hours)
                  habits.commits.hours[hour] = (habits.commits.hours[hour] || 0) + 1
              //Compute hour with most commits
                habits.commits.hour = hours.length ? Object.entries(habits.commits.hours).sort(([an, a], [bn, b]) => b - a).map(([hour, occurence]) => hour)[0] : NaN
            }
          //Indent style
            {
              //Retrieve edited files
                const edited = await Promise.allSettled(commits
                  .flatMap(({payload}) => payload.commits).map(commit => commit.url)
                  .map(async commit => (await rest.request(commit)).data.files)
                )
              //Attemp to guess whether tabs or spaces are used from patch
                edited
                  .filter(({status}) => status === "fulfilled")
                  .map(({value}) => value)
                  .flatMap(files => files.flatMap(file => (file.patch||"").match(/(?<=^[+])((?:\t)|(?:  )) /gm)||[]))
                  .forEach(indent => habits.indents[/^\t/.test(indent) ? "tabs" : "spaces"]++)
              //Compute indent style
                habits.indents.style = habits.indents.spaces > habits.indents.tabs ? "spaces" : habits.indents.tabs > habits.indents.spaces ? "tabs" : ""
            }
          //Save results
            computed.plugins.habits = habits
            console.debug(`metrics/compute/${login}/plugins > habits > success`)
            console.debug(JSON.stringify(computed.plugins.habits))
            solve()
        }
        catch (error) {
          //Generic error
            computed.plugins.habits = {error:`An error occured`}
            console.debug(`metrics/compute/${login}/plugins > habits > error`)
            console.debug(error)
            solve()
        }
      }))
  }