//Setup
export default async function({login, q, imports, data, account}, {token, enabled = false, extras = false} = {}) {
  //Plugin execution
  try {
    //Check if plugin is enabled and requirements are met
    if ((!q.steam) || (!imports.metadata.plugins.steam.enabled(enabled, {extras})))
      return null

    //Load inputs
    let {user, sections, "games.ignored": _games_ignored, "games.limit": _games_limit, "recent.games.limit": _recent_games_limit, "achievements.limit": _achievements_limit, "playtime.threshold": _playtime_threshold} = imports.metadata.plugins.steam.inputs({data, account, q})

    const urls = {
      games: {
        owned: `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${token}&steamid=${user}&format=json&include_appinfo=1`,
        schema: `https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v0002/?key=${token}&format=json`,
        details: "https://store.steampowered.com/api/appdetails?",
      },
      player: {
        summary: `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${token}&steamids=${user}&format=json`,
        level: `https://api.steampowered.com/IPlayerService/GetSteamLevel/v1/?key=${token}&steamid=${user}&format=json`,
        achievement: `https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/?key=${token}&steamid=${user}&format=json&l=en`,
      },
    }
    const result = {sections, player: null, games: {count: 0, playtime: 0, achievements: 0}}

    //Fetch owned games
    console.debug(`metrics/compute/${login}/plugins > steam > fetching owned games`)
    let {data: {response: {game_count: count, games}}} = await imports.axios.get(urls.games.owned)
    result.games.count = count
    result.games.playtime = games.reduce((total, {playtime_forever: playtime}) => (total += playtime), 0) / 60

    //Fetch game achievements and order games by section
    for (const section of ["most-played", "recently-played"]) {
      if (!sections.includes(section))
        continue
      result.games[section] = await Promise.all(
        games
          .map(({appid: id, name, img_icon_url: icon, playtime_forever: playtime, rtime_last_played: played}) => ({id, name, icon: `http://media.steampowered.com/steamcommunity/public/images/apps/${id}/${icon}.jpg`, playtime: playtime / 60, played}))
          .filter(({playtime}) => (playtime >= _playtime_threshold))
          .filter(({id}) => (!_games_ignored.includes(`${id}`)))
          .sort((a, b) => ({"most-played": (b.playtime - a.playtime), "recently-played": (b.played - a.played)}[section]))
          .slice(0, ({"most-played": _games_limit, "recently-played": _recent_games_limit}[section]) || Infinity)
          .map(async game => {
            const schema = {}
            try {
              console.debug(`metrics/compute/${login}/plugins > steam > fetching schema for "${game.name}" (${game.id})`)
              const {data: {game: {availableGameStats: {achievements = []} = {}}}} = await imports.axios.get(`${urls.games.schema}&appid=${game.id}`)
              Object.assign(schema, Object.fromEntries(achievements.map(({name, icon}) => [name, {icon}])))
            }
            catch (error) {
              console.debug(`metrics/compute/${login}/plugins > steam > failed to get schema for "${game.name}" (${game.id}) > ${error}`)
            }
            const about = {}
            try {
              console.debug(`metrics/compute/${login}/plugins > steam > fetching details for "${game.name}" (${game.id})`)
              const {data: {[game.id]: {data}}} = await imports.axios.get(`${urls.games.details}&appids=${game.id}`)
              about.description = data.short_description ?? ""
              about.genres = data.genres?.map(({description}) => description) ?? []
            }
            catch (error) {
              console.debug(`metrics/compute/${login}/plugins > steam > failed to get details for "${game.name}" (${game.id}) > ${error}`)
            }

            let achievements = []
            const rate = {total: Object.keys(schema).length, achieved: 0}
            try {
              console.debug(`metrics/compute/${login}/plugins > steam > fetching player achievements "${game.name}" (${game.id})`)
              let {data: {playerstats: {achievements: list = []}}} = await imports.axios.get(`${urls.player.achievement}&appid=${game.id}`)
              achievements = await Promise.all(list.map(async ({apiname: id, achieved, unlocktime: unlocked, name, description}) => ({icon: await imports.imgb64(schema[id]?.icon ?? null, {width: 32, height: 32}), achieved: !!achieved, unlocked, name, description, id})))
              achievements = achievements.sort((a, b) => (b.unlocked - a.unlocked))
              rate.achieved = achievements.filter(({achieved}) => achieved).length
              achievements = achievements.slice(0, _achievements_limit)
            }
            catch (error) {
              console.debug(`metrics/compute/${login}/plugins > steam > failed to get player achievements for "${game.name}" (${game.id}) > ${error}`)
            }
            return {...game, ...about, icon: await imports.imgb64(game.icon, {width: 64, height: 64}), achievements, rate}
          }),
      )
    }

    //Fetch player info
    if (sections.includes("player")) {
      console.debug(`metrics/compute/${login}/plugins > steam > fetching profile info`)
      let {data: {response: {players: [info]}}} = await imports.axios.get(urls.player.summary)
      console.debug(`metrics/compute/${login}/plugins > steam > fetching profile level`)
      const {data: {response: {player_level: level}}} = await imports.axios.get(urls.player.level)
      result.player = {
        level,
        avatar: await imports.imgb64(info.avatar, {width: 64, height: 64}),
        created: info.timecreated,
        name: info.personaname,
      }
    }

    //Results
    return result
  }
  //Handle errors
  catch (error) {
    throw imports.format.error(error)
  }
}
