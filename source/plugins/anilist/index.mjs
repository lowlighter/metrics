//Setup
  export default async function ({login, imports, q}, {enabled = false} = {}) {
    //Plugin execution
      try {
        //Check if plugin is enabled and requirements are met
          if ((!enabled)||(!q.anilist))
            return null
        //Get anilist data
          console.debug(`metrics/compute/${login}/plugins > anilist > querying api`)
          const query = `${await imports.fs.readFile(`${imports.__module(import.meta.url)}/query.graphql`)}`
          const {data:{data:{User:{statistics:stats}, MediaListCollection:{lists}}}} = await imports.axios.post("https://graphql.anilist.co", {variables:{name:login}, query})
        //Format result and medias
          const genres = [...new Set([...stats.anime.genres.map(({genre}) => genre), ...stats.manga.genres.map(({genre}) => genre)])]
          const result = {user:{stats, genres}, lists:{}}
          for (const {name, entries} of lists) {
            result.lists[name.toLocaleLowerCase()] = await Promise.all(entries.map(async ({
              progress, media:{title, status, startDate:{year:release}, genres, averageScore:score, episodes, chapters, type, coverImage:{medium:artwork}}
            }) => ({name:title.romaji, type, status, release, genres, score, progress, released:type === "ANIME" ? episodes : chapters, artwork:await imports.imgb64(artwork)})))
          }
        //Results
          return result
      }
  //Handle errors
    catch (error) {
      throw {error:{message:"An error occured", instance:error}}
    }
  }





