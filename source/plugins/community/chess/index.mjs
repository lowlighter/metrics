//Imports
import { Chess } from "chess.js"

//Setup
export default async function({login, q, imports, data, account}, {enabled = false, token = "", extras = false} = {}) {
  //Plugin execution
  try {
    //Check if plugin is enabled and requirements are met
    if ((!q.chess) || (!imports.metadata.plugins.chess.enabled(enabled, {extras})))
      return null

    //Load inputs
    const {user, platform, animation} = imports.metadata.plugins.chess.inputs({data, account, q})
    for (const [key, defaulted] of Object.entries({size: 40, delay: 1, duration: 4})) {
      if (Number.isNaN(Number(animation[key])))
        animation[key] = defaulted
      if (animation[key] < 0)
        animation[key] = defaulted
    }

    //Fetch PGN
    console.debug(`metrics/compute/${login}/plugins > chess > fetching last game from ${platform}`)
    let PGN
    switch (platform) {
      case "lichess.org":
        PGN = (await imports.axios.get(`https://lichess.org/api/games/user/${user}?max=1`, {headers: {Authorization: `Bearer ${token}`}})).data
        break
      case "":
        throw {error: {message: "Unspecified platform"}}
      default:
        throw {error: {message: `Unsupported platform "${platform}"`}}
    }

    //Parse PGN
    const board = new Chess()
    board.loadPgn(PGN)
    const moves = board.history({verbose: true})
    const meta = board.header()
    const result = Object.fromEntries(meta.Result.split("-").map((score, i) => [i ? "black" : "white", Number(score) || 0]))

    //Results
    return {platform, meta, moves, animation, result}
  }
  //Handle errors
  catch (error) {
    throw imports.format.error(error)
  }
}
