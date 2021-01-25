//Setup
  export default async function ({login, imports, q}, {enabled = false} = {}) {
    //Plugin execution
      try {
        //Check if plugin is enabled and requirements are met
          if ((!enabled)||(!q.anilist))
            return null
        //Parameters override
          let {"anilist.medias":medias = ["anime", "manga"], "anilist.sections":sections = ["favorites"], "anilist.limit":limit = 2, "anilist.shuffle":shuffle = true, "anilist.user":user = login} = q
          //Medias types
            medias = decodeURIComponent(medias).split(",").map(x => x.trim().toLocaleLowerCase()).filter(x => ["anime", "manga"].includes(x))
          //Sections
            sections = decodeURIComponent(sections).split(",").map(x => x.trim().toLocaleLowerCase()).filter(x => ["favorites", "watching", "reading", "characters"].includes(x))
          //Limit medias
            limit = Math.max(0, Number(limit))
        //GraphQL queries
          const query = {
            statistics:`${await imports.fs.readFile(`${imports.__module(import.meta.url)}/queries/statistics.graphql`)}`,
            characters:`${await imports.fs.readFile(`${imports.__module(import.meta.url)}/queries/characters.graphql`)}`,
            medias:`${await imports.fs.readFile(`${imports.__module(import.meta.url)}/queries/medias.graphql`)}`,
            favorites:`${await imports.fs.readFile(`${imports.__module(import.meta.url)}/queries/favorites.graphql`)}`,
          }
        //Initialization
          const result = {user:{stats:null, genres:[]}, lists:Object.fromEntries(medias.map(type => [type, {}])), characters:[], sections}
        //User statistics
          {
            //Query API
              console.debug(`metrics/compute/${login}/plugins > anilist > querying api (user statistics)`)
              const {data:{data:{User:{statistics:stats}}}} = await imports.axios.post("https://graphql.anilist.co", {variables:{name:user}, query:query.statistics})
            //Format and save results
              result.user.stats = stats
              result.user.genres = [...new Set([...stats.anime.genres.map(({genre}) => genre), ...stats.manga.genres.map(({genre}) => genre)])]
          }
        //Medias lists
          if ((sections.includes("watching"))||(sections.includes("reading"))) {
            for (const type of medias) {
              //Query API
                console.debug(`metrics/compute/${login}/plugins > anilist > querying api (medias lists - ${type})`)
                const {data:{data:{MediaListCollection:{lists}}}} = await imports.axios.post("https://graphql.anilist.co", {variables:{name:user, type:type.toLocaleUpperCase()}, query:query.medias})
              //Format and save results
                for (const {name, entries} of lists) {
                  //Format results
                    const list = await Promise.all(entries.map(async media => await format({media, imports})))
                    result.lists[type][name.toLocaleLowerCase()] = shuffle ? imports.shuffle(list) : list
                  //Limit results
                    if (limit > 0) {
                      console.debug(`metrics/compute/${login}/plugins > anilist > keeping only ${limit} medias`)
                      result.lists[type][name.toLocaleLowerCase()].splice(limit)
                    }
                }
            }
          }
        //Favorites anime/manga
          if (sections.includes("favorites")) {
            for (const type of medias) {
              //Query API
                console.debug(`metrics/compute/${login}/plugins > anilist > querying api (favorites ${type}s)`)
                const list = []
                let page = 1
                let next = false
                do {
                  console.debug(`metrics/compute/${login}/plugins > anilist > querying api (favorites ${type}s - page ${page})`)
                  const {data:{data:{User:{favourites:{[type]:{nodes, pageInfo:cursor}}}}}} = await imports.axios.post("https://graphql.anilist.co", {variables:{name:user, page}, query:query.favorites.replace(/[$]type/g, type)})
                  page = cursor.currentPage
                  next = cursor.hasNextPage
                  list.push(...await Promise.all(nodes.map(media => format({media:{progess:null, score:null, media}, imports}))))
                } while (next)
              //Format and save results
                result.lists[type].favorites = shuffle ? imports.shuffle(list) : list
              //Limit results
                if (limit > 0) {
                  console.debug(`metrics/compute/${login}/plugins > anilist > keeping only ${limit} medias`)
                  result.lists[type].favorites.splice(limit)
                }
            }
          }
        //Favorites characters
          if (sections.includes("characters")) {
            //Query API
              console.debug(`metrics/compute/${login}/plugins > anilist > querying api (favorites characters)`)
              const characters = []
              let page = 1
              let next = false
              do {
                console.debug(`metrics/compute/${login}/plugins > anilist > querying api (favorites characters - page ${page})`)
                const {data:{data:{User:{favourites:{characters:{nodes, pageInfo:cursor}}}}}} = await imports.axios.post("https://graphql.anilist.co", {variables:{name:user, page}, query:query.characters})
                page = cursor.currentPage
                next = cursor.hasNextPage
                for (const {name:{full:name}, image:{medium:artwork}} of nodes)
                  characters.push({name, artwork:artwork ? await imports.imgb64(artwork) : "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mOcOnfpfwAGfgLYttYINwAAAABJRU5ErkJggg=="})
              } while (next)
            //Format and save results
              result.characters = shuffle ? imports.shuffle(characters) : characters
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
      artwork:artwork ? await imports.imgb64(artwork) : "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mOcOnfpfwAGfgLYttYINwAAAABJRU5ErkJggg=="
    }
  }
