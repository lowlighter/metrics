//Imports
import indepth_analyzer from "./indepth.mjs"

//Setup
export default async function({login, data, imports, q, account}, {enabled = false} = {}) {
  //Plugin execution
  try {
    //Check if plugin is enabled and requirements are met
    if ((!enabled) || (!q.languages))
      return null

    //Load inputs
    let {ignored, skipped, colors, details, threshold, limit, indepth} = imports.metadata.plugins.languages.inputs({data, account, q})
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

    //Iterate through user's repositories and retrieve languages data
    console.debug(`metrics/compute/${login}/plugins > languages > processing ${data.user.repositories.nodes.length} repositories`)
    const languages = {details, colors:{}, total:0, stats:{}}
    for (const repository of data.user.repositories.nodes) {
      //Skip repository if asked
      if ((skipped.includes(repository.name.toLocaleLowerCase())) || (skipped.includes(`${repository.owner.login}/${repository.name}`.toLocaleLowerCase()))) {
        console.debug(`metrics/compute/${login}/plugins > languages > skipped repository ${repository.owner.login}/${repository.name}`)
        continue
      }
      //Process repository languages
      for (const {size, node:{color, name}} of Object.values(repository.languages.edges)) {
        //Ignore language if asked
        if (ignored.includes(name.toLocaleLowerCase())) {
          console.debug(`metrics/compute/${login}/plugins > languages > ignored language ${name}`)
          continue
        }
        //Update language stats
        languages.stats[name] = (languages.stats[name] ?? 0) + size
        languages.colors[name] = colors[name.toLocaleLowerCase()] ?? color ?? "#ededed"
        languages.total += size
      }
    }

    //Indepth mode
    if (indepth) {
      console.debug(`metrics/compute/${login}/plugins > languages > switching to indepth mode (this may take some time)`)
      Object.assign(languages, await indepth_analyzer({login, data, imports}, {skipped, ignored}))
    }

    //Compute languages stats
    console.debug(`metrics/compute/${login}/plugins > languages > computing stats`)
    languages.favorites = Object.entries(languages.stats).sort(([_an, a], [_bn, b]) => b - a).slice(0, limit).map(([name, value]) => ({name, value, size:value, color:languages.colors[name], x:0})).filter(({value}) => value / languages.total > threshold)
    const visible = {total:Object.values(languages.favorites).map(({size}) => size).reduce((a, b) => a + b, 0)}
    for (let i = 0; i < languages.favorites.length; i++) {
      languages.favorites[i].value /= visible.total
      languages.favorites[i].x = (languages.favorites[i - 1]?.x ?? 0) + (languages.favorites[i - 1]?.value ?? 0)
      if ((colors[i]) && (!colors[languages.favorites[i].name.toLocaleLowerCase()]))
        languages.favorites[i].color = colors[i]
    }

    //Results
    return languages
  }
  //Handle errors
  catch (error) {
    throw {error:{message:"An error occured", instance:error}}
  }
}
