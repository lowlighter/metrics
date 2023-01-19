//Imports
import assets from "./assets.mjs"

//Setup
export default async function({login, q, imports, data, account}, {enabled = false, extras = false, token, "statink.token": _statink_token} = {}) {
  //Plugin execution
  try {
    //Check if plugin is enabled and requirements are met
    if ((!q.splatoon) || (!imports.metadata.plugins.splatoon.enabled(enabled, {extras})))
      return null

    //Load inputs
    const {sections, "versus.limit": _versus_limit, "salmon.limit": _salmon_limit, statink, source} = imports.metadata.plugins.splatoon.inputs({data, account, q})

    //Save profile
    {
      const profile = `${imports.__module(import.meta.url)}/s3si/profile.json`
      console.debug(`metrics/compute/${login}/plugins > splatoon > saving ${profile}`)
      const parsed = JSON.parse(token)
      if (!parsed?.loginState?.sessionToken)
        throw new Error("Configuration is missing sessionToken")
      if (statink) {
        console.debug(`metrics/compute/${login}/plugins > splatoon > stat.ink integration is enabled`)
        if (_statink_token) {
          parsed.statInkApiKey = _statink_token
          console.debug(`metrics/compute/${login}/plugins > splatoon > stat.ink api key set`)
        }
        else {
          data.warnings.push({warning: {message: '"plugin_splatoon_statink" is set without "plugin_splatoon_statink_token"'}})
          console.debug(`metrics/compute/${login}/plugins > splatoon > stat.ink api key missing`)
        }
      }
      await imports.fs.writeFile(profile, JSON.stringify(parsed))
    }

    //Fetch data
    const allowed = {
      files: ["profile.json", "profile.json.swap", "export", "cache"],
      net: ["api.imink.app", "accounts.nintendo.com", "api.accounts.nintendo.com", "api-lp1.znc.srv.nintendo.net", "api.lp1.av5ja.srv.nintendo.net"],
    }
    const exporters = ["file"]
    if (statink) {
      exporters.push("stat.ink")
      allowed.net.push("stat.ink")
    }
    switch (source) {
      case "mocks":
      case "local":
        console.debug(`metrics/compute/${login}/plugins > splatoon > skipping s3si execution`)
        break
      case "splatnet":
        await imports.run(`deno run --no-prompt --cached-only --no-remote --allow-read="${allowed.files}" --allow-write="${allowed.files}" --allow-net="${allowed.net}" index.ts --exporter="${exporters}" --with-summary --no-progress`, {cwd: `${imports.__module(import.meta.url)}/s3si`}, {prefixed: false})
        break
    }

    //Read fetched data
    const exported = await Promise.all(
      (await imports.fs.readdir(`${imports.__module(import.meta.url)}/s3si/${source == "mocks" ? "mocks" : "export"}`))
        .map(async file => JSON.parse(await imports.fs.readFile(`${imports.__module(import.meta.url)}/s3si/${source == "mocks" ? "mocks" : "export"}/${file}`))),
    )
    const summary = exported.filter(({type}) => type === "SUMMARY").at(0)
    if (!summary)
      throw new Error("Failed to fetch player summary!")
    const fetched = exported.filter(({type}) => type !== "SUMMARY").sort((a, b) => new Date(b.data.detail.playedTime) - new Date(a.data.detail.playedTime))
    console.debug(`metrics/compute/${login}/plugins > splatoon > fetched ${fetched.length} matches`)

    //Player summary
    const player = {
      level: summary.data.HistoryRecordQuery.playHistory.rank,
      rank: {
        current: summary.data.HistoryRecordQuery.playHistory.udemae,
        max: summary.data.HistoryRecordQuery.playHistory.udemaeMax,
      },
      painted: summary.data.HistoryRecordQuery.playHistory.paintPointTotal,
      battles: {
        wins: summary.data.HistoryRecordQuery.playHistory.winCountTotal,
        count: summary.data.ConfigureAnalyticsQuery.playHistory.battleNumTotal,
      },
      started: new Date(summary.data.HistoryRecordQuery.playHistory.gameStartTime),
      name: summary.data.HistoryRecordQuery.currentPlayer.name,
      byname: summary.data.HistoryRecordQuery.currentPlayer.byname,
      badges: await Promise.all(summary.data.HistoryRecordQuery.currentPlayer.nameplate.badges.map(badge => badge ? imports.imgb64(badge.image.url) : null)),
      plate: {
        color: `#${Math.round(255 * summary.data.HistoryRecordQuery.currentPlayer.nameplate.background.textColor.r).toString(16).padStart(2, 0)}${Math.round(255 * summary.data.HistoryRecordQuery.currentPlayer.nameplate.background.textColor.g).toString(16).padStart(2, 0)}${
          Math.round(255 * summary.data.HistoryRecordQuery.currentPlayer.nameplate.background.textColor.b).toString(16).padStart(2, 0)
        }`,
        icon: await imports.imgb64(summary.data.HistoryRecordQuery.currentPlayer.nameplate.background.image.url),
      },
      equipment: {
        weapon: {
          name: summary.data.HistoryRecordQuery.currentPlayer.weapon.name,
          icon: await imports.imgb64(summary.data.HistoryRecordQuery.currentPlayer.weapon.image.url),
        },
        special: {
          name: summary.data.HistoryRecordQuery.currentPlayer.weapon.specialWeapon.name,
          icon: await imports.imgb64(summary.data.HistoryRecordQuery.currentPlayer.weapon.specialWeapon.image.url),
        },
        sub: {
          name: summary.data.HistoryRecordQuery.currentPlayer.weapon.subWeapon.name,
          icon: await imports.imgb64(summary.data.HistoryRecordQuery.currentPlayer.weapon.subWeapon.image.url),
        },
        gears: await Promise.all(["headGear", "clothingGear", "shoesGear"].map(async type => {
          const gear = summary.data.HistoryRecordQuery.currentPlayer[type]
          return {
            name: gear.name,
            icon: await imports.imgb64(gear.image.url),
            abilities: await Promise.all([
              {
                name: gear.primaryGearPower.name,
                icon: await imports.imgb64(gear.primaryGearPower.image.url),
              },
              ...gear.additionalGearPowers.map(async ability => ({name: ability.name, icon: await imports.imgb64(ability.image.url)})),
            ]),
          }
        })),
      },
      salmon: {
        grade: {
          name: summary.data.CoopHistoryQuery.coopResult.regularGrade.name,
          points: summary.data.CoopHistoryQuery.coopResult.regularGradePoint,
        },
        played: summary.data.CoopHistoryQuery.coopResult.pointCard.playCount,
        rescues: summary.data.CoopHistoryQuery.coopResult.pointCard.rescueCount,
        eggs: {
          golden: summary.data.CoopHistoryQuery.coopResult.pointCard.goldenDeliverCount,
          regular: summary.data.CoopHistoryQuery.coopResult.pointCard.deliverCount,
        },
        points: summary.data.CoopHistoryQuery.coopResult.pointCard.totalPoint,
        kings: summary.data.CoopHistoryQuery.coopResult.pointCard.defeatBossCount,
      },
    }

    //Versus mode
    let vs = null
    if (sections.includes("versus")) {
      vs = {
        matches: await Promise.all(
          fetched.filter(({type}) => type === "VS").slice(0, _versus_limit).map(async ({data}) => ({
            mode: {
              name: data.detail.vsRule.name,
              icon: await imports.imgb64(assets.modes[data.detail.vsRule.name]),
            },
            result: data.detail.judgement,
            knockout: data.detail.knockout ?? null,
            teams: await Promise.all([data.detail.myTeam, ...data.detail.otherTeams].map(async team => ({
              color: `#${Math.round(255 * team.color.r).toString(16).padStart(2, 0)}${Math.round(255 * team.color.g).toString(16).padStart(2, 0)}${Math.round(255 * team.color.b).toString(16).padStart(2, 0)}`,
              score: ((data.detail.vsRule.name === "Turf War") ? team.result?.paintRatio * 100 : team.result?.score) ?? null,
              players: await Promise.all(team.players.map(async ({name, byname, weapon, paint, result, isMyself: self}) => ({
                name,
                byname,
                self,
                weapon: {
                  name: weapon.name,
                  icon: await imports.imgb64(assets.weapons[weapon.name]),
                },
                special: {
                  name: weapon.specialWeapon.name,
                  icon: await imports.imgb64(assets.specials[weapon.specialWeapon.name]),
                },
                sub: {
                  name: weapon.subWeapon.name,
                  icon: await imports.imgb64(assets.subweapons[weapon.subWeapon.name]),
                },
                result: {
                  paint: paint ?? 0,
                  kill: result?.kill ?? 0,
                  death: result?.death ?? 0,
                  assist: result?.assist ?? 0,
                  special: result?.special ?? 0,
                },
              }))),
            }))),
            awards: data.detail.awards,
            date: data.detail.playedTime,
            duration: data.detail.duration,
            rank: data.listNode?.udemae ?? null,
            stage: {
              name: data.detail.vsStage.name,
              icon: await imports.imgb64(assets.stages[data.detail.vsStage.name]),
            },
          })),
        ),
      }
    }

    //Salmon run
    let salmon = null
    if (sections.includes("salmon-run")) {
      salmon = {
        matches: await Promise.all(
          fetched.filter(({type}) => type === "COOP").slice(0, _salmon_limit).map(async ({data}) => ({
            weapons: await Promise.all(data.detail.myResult.weapons.map(async ({name}) => ({name, icon: await imports.imgb64(assets.weapons[name])}))),
            special: {
              name: data.detail.myResult.specialWeapon.name,
              icon: await imports.imgb64(assets.specials[data.detail.myResult.specialWeapon.name]),
            },
            eggs: {
              golden: data.detail.myResult.goldenDeliverCount,
              regular: data.detail.myResult.deliverCount,
            },
            defeated: await Promise.all(data.detail.enemyResults.map(async ({defeatCount: count, enemy: {name}}) => ({name, count, icon: await imports.imgb64(assets.salmon[name])}))),
            rescues: data.detail.myResult.rescueCount,
            rescued: data.detail.myResult.rescuedCount,
            waves: data.detail.waveResults.map(({deliverNorm: quota, teamDeliverCount: delivered}) => ({quota, delivered})),
            failed: data.detail.resultWave,
            hazard: Math.round(data.detail.dangerRate * 100),
            boss: data.detail.bossResult
              ? {
                defeated: data.detail.bossResult.hasDefeatBoss,
                name: data.detail.bossResult.boss.name,
                icon: await imports.imgb64(assets.salmon[data.detail.bossResult.boss.name]),
              }
              : null,
            stage: {
              name: data.detail.coopStage.name,
              icon: await imports.imgb64(assets.stages[data.detail.coopStage.name]),
            },
            date: data.detail.playedTime,
            grade: data.detail.afterGrade.name,
          })),
        ),
      }
    }

    //Results
    return {
      sections,
      player,
      vs,
      salmon,
      icons: Object.fromEntries(await Promise.all(Object.entries(assets.icons).map(async ([k, v]) => [k, await imports.imgb64(v)]))),
    }
  }
  //Handle errors
  catch (error) {
    throw imports.format.error(error)
  }
}
