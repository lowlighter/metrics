//Setup
  export default async function ({login, data, imports, q, account}, {enabled = false} = {}) {
    //Plugin execution
      try {
        //Check if plugin is enabled and requirements are met
          if ((!enabled)||(!q.languages))
            return null

        //Load inputs
          let {ignored, skipped, colors, details} = imports.metadata.plugins.languages.inputs({data, account, q})

        //Custom colors
          const colorsets = JSON.parse(`${await imports.fs.readFile(`${imports.__module(import.meta.url)}/colorsets.json`)}`)
          if (`${colors}` in colorsets)
            colors = colorsets[`${colors}`]
          colors = Object.fromEntries(decodeURIComponent(colors).split(",").map(x => x.trim().toLocaleLowerCase()).filter(x => x).map(x => x.split(":").map(x => x.trim())))
          console.debug(`metrics/compute/${login}/plugins > languages > custom colors ${JSON.stringify(colors)}`)

        //Iterate through user's repositories and retrieve languages data
          console.debug(`metrics/compute/${login}/plugins > languages > processing ${data.user.repositories.nodes.length} repositories`)
          const languages = {details, colors:{}, total:0, stats:{}}
          for (const repository of data.user.repositories.nodes) {
            //Skip repository if asked
              if (skipped.includes(repository.name.toLocaleLowerCase())) {
                console.debug(`metrics/compute/${login}/plugins > languages > skipped repository ${repository.name}`)
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

        //Compute languages stats
          console.debug(`metrics/compute/${login}/plugins > languages > computing stats`)
          languages.favorites = Object.entries(languages.stats).sort(([an, a], [bn, b]) => b - a).slice(0, 8).map(([name, value]) => ({name, value, size:value, color:languages.colors[name], x:0}))
          const visible = {total:Object.values(languages.favorites).map(({size}) => size).reduce((a, b) => a + b, 0)}
          for (let i = 0; i < languages.favorites.length; i++) {
            languages.favorites[i].value /= visible.total
            languages.favorites[i].x = (languages.favorites[i-1]?.x ?? 0) + (languages.favorites[i-1]?.value ?? 0)
            if ((colors[i])&&(!colors[languages.favorites[i].name.toLocaleLowerCase()]))
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
