//Setup
  export default async function ({data, q}, {enabled = false} = {}) {
    //Plugin execution
      try {
        //Check if plugin is enabled and requirements are met
          if ((!enabled)||(!q.languages))
            return null
        //Iterate through user's repositories and retrieve languages data
          const languages = {colors:{}, total:0, stats:{}}
          for (const repository of data.user.repositories.nodes) {
            for (const {size, node:{color, name}} of Object.values(repository.languages.edges)) {
              languages.stats[name] = (languages.stats[name] ?? 0) + size
              languages.colors[name] = color ?? "#ededed"
              languages.total += size
            }
          }
        //Compute languages stats
          Object.keys(languages.stats).map(name => languages.stats[name] /= languages.total)
          languages.favorites = Object.entries(languages.stats).sort(([an, a], [bn, b]) => b - a).slice(0, 8).map(([name, value]) => ({name, value, color:languages.colors[name], x:0}))
          for (let i = 1; i < languages.favorites.length; i++)
            languages.favorites[i].x = languages.favorites[i-1].x + languages.favorites[i-1].value
        //Results
          return languages
      }
    //Handle errors
      catch (error) {
        console.debug(error)
        throw {error:{message:`An error occured`}}
      }
  }