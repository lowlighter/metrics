//Imports
import { indepth as indepth_analyzer, recent as recent_analyzer } from "./analyzers.mjs"

//Setup
export default async function({login, data, imports, q, rest, account}, {enabled = false} = {}) {
  //Plugin execution
  try {
    //Check if plugin is enabled and requirements are met
    if ((!enabled) || (!q.languages))
      return null

    //Context
    let context = {mode:"user"}
    if (q.repo) {
      console.debug(`metrics/compute/${login}/plugins > activity > switched to repository mode`)
      context = {...context, mode:"repository"}
    }

    //Load inputs
    let {ignored, skipped, colors, details, threshold, limit, indepth, sections} = imports.metadata.plugins.languages.inputs({data, account, q})
    threshold = (Number(threshold.replace(/%$/, "")) || 0) / 100
    skipped.push(...data.shared["repositories.skipped"])
    if (!limit)
      limit = Infinity

    //Custom colors
    const colorsets = JSON.parse(`${await imports.fs.readFile(`${imports.__module(import.meta.url)}/colorsets.json`)}`)
    if ((`${colors}` in colorsets) && (limit <= 8))
      colors = colorsets[`${colors}`]
    colors = Object.fromEntries(decodeURIComponent(colors).split(",").map(x => x.trim().toLocaleLowerCase()).filter(x => x).map(x => x.split(":").map(x => x.trim())))
    console.debug(`metrics/compute/${login}/plugins > languages > custom colors ${JSON.stringify(colors)}`)

    //Unique languages
    const repositories = [...data.user.repositories.nodes, ...data.user.repositoriesContributedTo.nodes]
    const unique = new Set(repositories.flatMap(repository => repository.languages.edges.map(({node:{name}}) => name))).size

    //Iterate through user's repositories and retrieve languages data
    console.debug(`metrics/compute/${login}/plugins > languages > processing ${data.user.repositories.nodes.length} repositories`)
    const languages = {unique, sections, details, colors:{}, total:0, stats:{}, "stats.recent":{}}
    for (const repository of data.user.repositories.nodes) {
      //Skip repository if asked
      if ((skipped.includes(repository.name.toLocaleLowerCase())) || (skipped.includes(`${repository.owner.login}/${repository.name}`.toLocaleLowerCase()))) {
        console.debug(`metrics/compute/${login}/plugins > languages > skipped repository ${repository.owner.login}/${repository.name}`)
        continue
      }
      //Process repository languages
      for (const {size, node:{color, name}} of Object.values(repository.languages.edges)) {
        languages.stats[name] = (languages.stats[name] ?? 0) + size
        languages.colors[name] = colors[name.toLocaleLowerCase()] ?? color ?? "#ededed"
        languages.total += size
      }
    }

    //Recently used languages
    if ((sections.includes("recently-used"))&&(context.mode === "user")) {
      console.debug(`metrics/compute/${login}/plugins > languages > using recent analyzer`)
      languages["stats.recent"] = await recent_analyzer({login, data, imports, rest, account}, {skipped})
    }

    //Indepth mode
    if (indepth) {
      console.debug(`metrics/compute/${login}/plugins > languages > switching to indepth mode (this may take some time)`)
      Object.assign(languages, await indepth_analyzer({login, data, imports, repositories}, {skipped}))
    }

    //Compute languages stats
    for (const {section, stats = {}, lines = {}, total = 0} of [{section:"favorites", stats:languages.stats, lines:languages.lines, total:languages.total}, {section:"recent", ...languages["stats.recent"]}]) {
      console.debug(`metrics/compute/${login}/plugins > languages > computing stats ${section}`)
      languages[section] = Object.entries(stats).filter(([name]) => !ignored.includes(name.toLocaleLowerCase())).sort(([_an, a], [_bn, b]) => b - a).slice(0, limit).map(([name, value]) => ({name, value, size:value, color:languages.colors[name], x:0})).filter(({value}) => value / total > threshold)
      const visible = {total:Object.values(languages[section]).map(({size}) => size).reduce((a, b) => a + b, 0)}
      for (let i = 0; i < languages[section].length; i++) {
        languages[section][i].value /= visible.total
        languages[section][i].x = (languages[section][i - 1]?.x ?? 0) + (languages[section][i - 1]?.value ?? 0)
        languages[section][i].lines = lines[languages[section][i].name] ?? 0
        if ((colors[i]) && (!colors[languages[section][i].name.toLocaleLowerCase()]))
          languages[section][i].color = colors[i]
      }
    }

    //Results
    return languages
  }
  //Handle errors
  catch (error) {
    throw {error:{message:"An error occured", instance:error}}
  }
}
