//Legacy import
import {recent as recent_analyzer} from "./../languages/analyzers.mjs"

//Setup
export default async function({login, data, rest, imports, q, account}, {enabled = false, extras = false, ...defaults} = {}) {
  //Plugin execution
  try {
    //Check if plugin is enabled and requirements are met
    if ((!enabled) || (!q.habits))
      return null

    //Load inputs
    let {from, days, facts, charts, "charts.type":_charts, trim} = imports.metadata.plugins.habits.inputs({data, account, q}, defaults)

    //Initialization
    const habits = {facts, charts, trim, lines:{average:{chars:0}}, commits:{fetched:0, hour:NaN, hours:{}, day:NaN, days:{}}, indents:{style:"", spaces:0, tabs:0}, linguist:{available:false, ordered:[], languages:{}}}
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
      .filter(({actor}) => account === "organization" ? true : actor.login?.toLocaleLowerCase() === login.toLocaleLowerCase())
      .filter(({created_at}) => new Date(created_at) > new Date(Date.now() - days * 24 * 60 * 60 * 1000))
    console.debug(`metrics/compute/${login}/plugins > habits > filtered out ${commits.length} push events over last ${days} days`)
    habits.commits.fetched = commits.length

    //Retrieve edited files and filter edited lines (those starting with +/-) from patches
    console.debug(`metrics/compute/${login}/plugins > habits > loading patches`)
    const patches = [
      ...await Promise.allSettled(
        commits
          .flatMap(({payload}) => payload.commits)
          .filter(({author}) => data.shared["commits.authoring"].filter(authoring => author?.login?.toLocaleLowerCase().includes(authoring) || author?.email?.toLocaleLowerCase().includes(authoring) || author?.name?.toLocaleLowerCase().includes(authoring)).length)
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
      habits.lines.average.chars = lines.reduce((a, b) => a + b, 0) / lines.length
    }

    //Linguist
    if ((extras) && (charts)) {
      //Check if linguist exists
      console.debug(`metrics/compute/${login}/plugins > habits > searching recently used languages using linguist`)
      if (patches.length) {
        //Call language analyzer (note: using content from other plugin is usually disallowed, this is mostly for legacy purposes)
        habits.linguist.available = true
        const {total, stats} = await recent_analyzer({login, data, imports, rest, account}, {days, load:from || 1000, tempdir:"habits"})
        habits.linguist.languages = Object.fromEntries(Object.entries(stats).map(([language, value]) => [language, value / total]))
        habits.linguist.ordered = Object.entries(habits.linguist.languages).sort(([_an, a], [_bn, b]) => b - a)
      }
      else
        console.debug(`metrics/compute/${login}/plugins > habits > linguist not available`)
    }

    //Generating charts with chartist
    if (_charts === "chartist") {
      console.debug(`metrics/compute/${login}/plugins > habits > generating charts`)
      habits.charts = await Promise.all([
        {type:"line", data:Object.fromEntries(Object.entries(habits.commits.hours).filter(([k]) => !Number.isNaN(+k))), low:0, high:habits.commits.hours.max},
        {type:"line", data:Object.fromEntries(Object.entries(habits.commits.days).filter(([k]) => !Number.isNaN(+k))), low:0, high:habits.commits.days.max},
        {type:"pie", data:habits.linguist.languages},
      ].map(({type, data, high, low, ref, sign = false}) => imports.chartist(type, {
          width:480,
          height:160,
          showPoint:true,
          axisX:{showGrid:false},
          axisY:{showLabel:false, offset:20, labelInterpolationFnc:value => imports.format(value, {sign}), high, low, referenceValue:ref},
          showArea:true,
          fullWidth:true,
        }, {
          labels:Object.keys(data),
          series:[Object.values(data)],
        })
      ))
      data.postscripts.push(`(${function(format) {
        document.querySelectorAll(".stargazers .chartist").forEach((chart, sign) => {
          chart.querySelectorAll(".stargazers .chartist .ct-point").forEach(node => {
            const [x, y, value] = ["x1", "y1", "ct:value"].map(attribute => node.getAttribute(attribute))
            const text = document.createElementNS("http://www.w3.org/2000/svg", "text")
            text.setAttributeNS(null, "x", x)
            text.setAttributeNS(null, "y", y - 5)
            text.setAttributeNS(null, "class", "ct-post")
            text.appendChild(document.createTextNode(format(value, {sign})))
            node.parentNode.append(text)
          })
        })
      }})(${imports.format.toString()})`)
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
