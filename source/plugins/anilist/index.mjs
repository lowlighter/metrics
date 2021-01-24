//Setup
  export default async function ({login, imports, q}, {enabled = false} = {}) {
    //Plugin execution
      try {
        //Check if plugin is enabled and requirements are met
          if ((!enabled)||(!q.anilist))
            return null
        //Parameters override
          let {"anilist.medias":medias = ["anime", "manga"]} = q
          //Medias types
            medias = decodeURIComponent(medias).split(",").map(x => x.trim().toLocaleLowerCase()).filter(x => ["anime", "manga"].includes(x))
        //GraphQL queries
          const query = {
            statistics:`${await imports.fs.readFile(`${imports.__module(import.meta.url)}/queries/statistics.graphql`)}`,
            characters:`${await imports.fs.readFile(`${imports.__module(import.meta.url)}/queries/characters.graphql`)}`,
            medias:`${await imports.fs.readFile(`${imports.__module(import.meta.url)}/queries/medias.graphql`)}`,
            favorites:`${await imports.fs.readFile(`${imports.__module(import.meta.url)}/queries/favorites.graphql`)}`,
          }
        //Initialization
          const result = {user:{stats:null, genres:[]}, lists:Object.fromEntries(medias.map(type => [type, {}])), favorites:{characters:[]}}
        //User statistics
          {
            //Query API
              console.debug(`metrics/compute/${login}/plugins > anilist > querying api (user statistics)`)
              const {data:{data:{User:{statistics:stats}}}} = await imports.axios.post("https://graphql.anilist.co", {variables:{name:login}, query:query.statistics})
            //Format and save results
              result.user.stats = stats
              result.user.genres = [...new Set([...stats.anime.genres.map(({genre}) => genre), ...stats.manga.genres.map(({genre}) => genre)])]
          }
        //Medias lists
          for (const type of medias) {
            //Query API
              console.debug(`metrics/compute/${login}/plugins > anilist > querying api (medias lists - ${type})`)
              const {data:{data:{MediaListCollection:{lists}}}} = await imports.axios.post("https://graphql.anilist.co", {variables:{name:login, type:type.toLocaleUpperCase()}, query:query.medias})
            //Format and save results
              for (const {name, entries} of lists)
                result.lists[type][name.toLocaleLowerCase()] = await Promise.all(entries.map(async media => await format({media, imports})))
          }
        //Favorites characters
          {
            //Query API
              console.debug(`metrics/compute/${login}/plugins > anilist > querying api (favorites characters)`)
              const characters = []
              let page = 1
              let next = false
              do {
                console.debug(`metrics/compute/${login}/plugins > anilist > querying api (favorites characters - page ${page})`)
                const {data:{data:{User:{favourites:{characters:{nodes, pageInfo:cursor}}}}}} = await imports.axios.post("https://graphql.anilist.co", {variables:{name:login, page}, query:query.characters})
                page = cursor.currentPage
                next = cursor.hasNextPage
                for (const {name:{full:name}, image:{medium:artwork}} of nodes)
                  characters.push({name, artwork:await imports.imgb64(artwork)})
              } while (next)
            //Format and save results
              result.favorites.characters = characters
          }
        //Favorites anime/manga
          {
            for (const type of medias) {
              //Query API
                console.debug(`metrics/compute/${login}/plugins > anilist > querying api (favorites ${type}s)`)
                const list = []
                let page = 1
                let next = false
                do {
                  console.debug(`metrics/compute/${login}/plugins > anilist > querying api (favorites ${type}s - page ${page})`)
                  const {data:{data:{User:{favourites:{[type]:{nodes, pageInfo:cursor}}}}}} = await imports.axios.post("https://graphql.anilist.co", {variables:{name:login, page}, query:query.favorites.replace(/[$]type/g, type)})
                  page = cursor.currentPage
                  next = cursor.hasNextPage
                  list.push(...await Promise.all(nodes.map(media => format({media:{progess:null, score:null, media}, imports}))))
                } while (next)
              //Format and save results
                result.lists[type].favorites = list
            }
          }
        //Results
          return result
      }
  //Handle errors
    catch (error) {
      let message = "An error occured"
      if (error.isAxiosError) {
        const status = error.response?.status
        console.log(error.response.data)
        message = `API returned ${status}`
        error = error.response?.data ?? null
      }
      throw {error:{message, instance:error}}
    }
  }

/** Media formatter */
  async function format({media, imports}) {
    const {progress, score:userScore, media:{title, description, status, startDate:{year:release}, genres, averageScore, episodes, chapters, type, coverImage:{medium:artwork}}} = media
    return {
      name:title.romaji,
      type, status, release, genres, progress,
      description:description.replace(/<br\s*\\?>/g, " "),
      scores:{user:userScore, community:averageScore},
      released:type === "ANIME" ? episodes : chapters,
      artwork:await imports.imgb64(artwork)
    }
  }
