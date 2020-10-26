//Supported providers
  const providers = {
    apple:{
      name:"Apple Music",
      embed:/^https:..embed.music.apple.com.\w+.playlist/,
    },
    spotify:{
      name:"Spotify",
      embed:/^https:..open.spotify.com.embed.playlist/,
    },
  }

//Supported modes
  const modes = {
    playlist:"Suggested tracks",
    recent:"Recently played",
  }

//Setup
  export default function ({login, imports, rest, computed, pending, q}, {enabled = false, token = ""} = {}) {
    //Check if plugin is enabled and requirements are met
      if (!enabled)
        return computed.plugins.music = null
      if (!q.music)
        return computed.plugins.music = null
      console.debug(`metrics/compute/${login}/plugins > music`)
      const raw = {
        get provider() { return providers[provider]?.name ?? "" },
        get mode() { return modes[mode] ?? "Unconfigured music plugin"},
      }

    //Parameters override and checks
      let {"music.provider":provider = "", "music.mode":mode = "", "music.playlist":playlist = null, "music.limit":limit = 4} = q
      //Auto-guess parameters
        if ((playlist)&&(!mode))
          mode = "playlist"
        if ((playlist)&&(!provider))
          for (const [name, {embed}] of Object.entries(providers))
            if (embed.test(playlist))
              provider = name
        if (!mode)
          mode = "recent"
      //Provider
        if (!(provider in providers))
          return computed.plugins.music = {...raw, error:provider ? `Unsupported provider "${provider}"` : `Missing provider`}
      //Mode
        if (!(mode in modes))
          return computed.plugins.music = {...raw, error:`Unsupported mode "${mode}"`}
      //Playlist mode
        if (mode === "playlist") {
          if (!playlist)
            return computed.plugins.music = {...raw, error:`Missing playlist url`}
          if (!providers[provider].embed.test(playlist))
            return computed.plugins.music = {...raw, error:`Unsupported playlist url format`}
        }
      //Limit
        limit = Math.max(1, Math.min(100, Number(limit)))
      //Debug
        console.debug(`metrics/compute/${login}/plugins > habits > ${JSON.stringify({provider, mode, playlist, limit})}`)

    //Plugin execution
      pending.push(new Promise(async solve => {
        //Retrieve music data
          try {
            //Initialization
              let tracks = null
            //Handle mode
              switch (mode) {
                //Playlist mode
                  case "playlist":{
                    //Start puppeteer and navigate to playlist
                      console.debug(`metrics/compute/${login}/plugins > music > starting browser`)
                      const browser = await imports.puppeteer.launch({headless:true, executablePath:process.env.PUPPETEER_BROWSER_PATH, args:["--no-sandbox", "--disable-extensions", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]})
                      console.debug(`metrics/compute/${login}/plugins > music > loaded ${await browser.version()}`)
                      const page = await browser.newPage()
                      console.debug(`metrics/compute/${login}/plugins > music > loading page`)
                      await page.goto(playlist)
                      const frame = page.mainFrame()
                    //Handle provider
                      switch (provider) {
                        //Apple music
                          case "apple":{
                            //Parse tracklist
                              await frame.waitForSelector(".tracklist.playlist")
                              tracks = [...await frame.evaluate(() => [...document.querySelectorAll(".tracklist li")].map(li => ({
                                name:li.querySelector(".tracklist__track__name").innerText,
                                artist:li.querySelector(".tracklist__track__sub").innerText,
                                artwork:li.querySelector(".tracklist__track__artwork img").src
                              })))]
                            break
                          }
                        //Spotify
                          case "spotify":{
                            //Parse tracklist
                              await frame.waitForSelector("table")
                              tracks = [...await frame.evaluate(() => [...document.querySelectorAll("table tr")].map(tr => ({
                                name:tr.querySelector("td:nth-child(2) div:nth-child(1)").innerText,
                                artist:tr.querySelector("td:nth-child(2) div:nth-child(2)").innerText,
                                //Spotify doesn't provide artworks so we fallback on playlist artwork instead
                                artwork:window.getComputedStyle(document.querySelector("button[title=Play]").parentNode, null).backgroundImage.match(/^url\("(https:...+)"\)$/)[1]
                              })))]
                            break
                          }
                        //Unsupported
                          default:{
                            throw {status:`Unsupported mode "${mode}" for provider "${provider}"`}
                          }
                      }
                    //Close browser
                      console.debug(`metrics/compute/${login}/plugins > music > closing browser`)
                      await browser.close()
                    //Format tracks
                      if (Array.isArray(tracks)) {
                        //Tracks
                          console.debug(`metrics/compute/${login}/plugins > music > found ${tracks.length} tracks`)
                          console.debug(JSON.stringify(tracks))
                        //Shuffle tracks
                          tracks = imports.shuffle(tracks)
                      }
                    break
                  }
                //Recently played
                  case "recent":{
                    //Initialisation
                      const timestamp = Date.now()-24*60*60*1000
                    //Handle provider
                      switch (provider) {
                        //Spotify
                          case "spotify":{
                            //Prepare credentials
                              const [client_id, client_secret, refresh_token] = token.split(",").map(part => part.trim())
                              if ((!client_id)||(!client_secret)||(!refresh_token))
                                throw {status:`Spotify token must contain client id/secret and refresh token`}
                            //API call and parse tracklist
                              try {
                                //Request access token
                                  console.debug(`metrics/compute/${login}/plugins > music > requesting access token with refresh token for spotify`)
                                  const {data:{access_token:access}} = await imports.axios.post("https://accounts.spotify.com/api/token",
                                    `${new imports.url.URLSearchParams({grant_type:"refresh_token", refresh_token, client_id, client_secret})}`,
                                    {headers:{"Content-Type":"application/x-www-form-urlencoded"}},
                                  )
                                  console.log(access)
                                  console.debug(`metrics/compute/${login}/plugins > music > got new access token`)
                                //Retriev tracks
                                  tracks = (await imports.axios(`https://api.spotify.com/v1/me/player/recently-played?limit=${limit}&after=${timestamp}`, {headers:{
                                    "Accept":"application/json",
                                    "Content-Type":"application/json",
                                    "Authorization":`Bearer ${access}`}
                                  })).data.items.map(({track}) => ({
                                    name:track.name,
                                    artist:track.artists[0].name,
                                    artwork:track.album.images[0].url,
                                  }))
                              }
                            //Handle errors
                              catch (error) {
                                console.debug(error)
                                if ((error.response)&&(error.response.status))
                                  throw {status:`API call returned ${error.response.status}`}
                                throw error
                              }
                            break
                          }
                        //Unsupported
                          default:{
                            throw {status:`Unsupported mode "${mode}" for provider "${provider}"`}
                          }
                      }
                    break
                  }
                //Unsupported
                  default:{
                    throw {status:`Unsupported mode "${mode}"`}
                  }
              }
            //Format tracks
              if (Array.isArray(tracks)) {
                //Limit tracklist
                  if (limit > 0) {
                    console.debug(`metrics/compute/${login}/plugins > music > keeping only ${limit} tracks`)
                    tracks = tracks.slice(0, limit)
                  }
                //Convert artworks to base64
                  console.debug(`metrics/compute/${login}/plugins > music > loading artworks`)
                  for (const track of tracks) {
                    console.debug(`metrics/compute/${login}/plugins > music > processing ${track.name}`)
                    track.artwork = await imports.imgb64(track.artwork)
                  }
                //Save results
                  console.debug(`metrics/compute/${login}/plugins > music > success`)
                  computed.plugins.music = {...raw, tracks}
                  solve()
                  return
              }
            //Unhandled error
              throw {status:`An error occured (unhandled)`}
          }
          catch (error) {
            //Plugin error
              if (error.status) {
                computed.plugins.music = {...raw, error:error.status}
                console.debug(`metrics/compute/${login}/plugins > music > error > ${error.status}`)
                return solve()
              }
            //Generic error
              computed.plugins.music = {...raw, error:`An error occured`}
              console.debug(`metrics/compute/${login}/plugins > music > error`)
              console.debug(error)
              solve()
          }
      }))
  }
