//Imports
import assets from "./assets.mjs"

//Setup
export default async function({login, q, imports, data, account}, {enabled = false, extras = false, token} = {}) {
  //Plugin execution
  try {
    //Check if plugin is enabled and requirements are met
    if ((!q.splatoon) || (!imports.metadata.plugins.splatoon.enabled(enabled, {extras})))
      return null

    //Load inputs
    const {modes, "versus.limit":_versus_limit, "salmon.limit":_salmon_limit} = imports.metadata.plugins.splatoon.inputs({data, account, q})

    //Save profile
    {
      const profile = `${imports.__module(import.meta.url)}/s3si/profile.json`
      console.debug(`metrics/compute/${login}/plugins > splatoon > saving ${profile}`)
      const parsed = JSON.parse(token)
      if (!parsed?.loginState?.sessionToken)
        throw new Error("Configuration is missing sessionToken")
      await imports.fs.writeFile(profile, token)
    }

    //Fetch data
    const allowed = {
      files:["profile.json", "profile.json.swap", "export", "cache"],
      net:["api.imink.app", "accounts.nintendo.com", "api.accounts.nintendo.com", "api-lp1.znc.srv.nintendo.net", "api.lp1.av5ja.srv.nintendo.net"]
    }
    await imports.run(`deno run --no-prompt --cached-only --no-remote --allow-read="${allowed.files}" --allow-write="${allowed.files}" --allow-net="${allowed.net}" index.ts --exporter file --no-progress`, {cwd: `${imports.__module(import.meta.url)}/s3si`}, {prefixed:false})

    //Read fetched data
    const fetched = (await Promise.all(
      (await imports.fs.readdir(`${imports.__module(import.meta.url)}/s3si/export`))
        .map(async file => JSON.parse(await imports.fs.readFile(`${imports.__module(import.meta.url)}/s3si/export/${file}`)))))
        .sort((a, b) => new Date(b.data.detail.playedTime) - new Date(a.data.detail.playedTime))
    console.debug(`metrics/compute/${login}/plugins > splatoon > fetched ${fetched.length} matches`)

    //Versus mode
    let vs = null
    if (!((modes.length === 1)&&(modes[0] === "salmon-run"))) {
      vs = {
        matches:await Promise.all(fetched.filter(({type, data}) => (type === "VS")&&(modes.includes(data.detail.vsRule.name.toLocaleLowerCase().replace(/ /g, "-")))).slice(0, _versus_limit).map(async ({data}) =>  ({
          mode:{
            name:data.detail.vsRule.name,
            icon:await imports.imgb64(assets.modes[data.detail.vsRule.name]),
          },
          result:data.detail.judgement,
          knockout:data.detail.knockout ?? null,
          teams:await Promise.all([data.detail.myTeam, ...data.detail.otherTeams].map(async team => ({
            color:`#${Math.round(255*team.color.r).toString(16)}${Math.round(255*team.color.g).toString(16)}${Math.round(255*team.color.b).toString(16)}`,
            score:((data.detail.vsRule.name === "Turf War") ? team.result?.paintRatio*100 : team.result?.score) ?? null,
            players:await Promise.all(team.players.map(async ({name, byname, weapon, paint, result, isMyself:self}) => ({
              name,
              byname,
              self,
              weapon:{
                name:weapon.name,
                icon:await imports.imgb64(assets.weapons[weapon.name]),
              },
              special:{
                name:weapon.specialWeapon.name,
                icon:await imports.imgb64(assets.specials[weapon.specialWeapon.name]),
              },
              sub:{
                name:weapon.subWeapon.name,
                icon:await imports.imgb64(assets.subweapons[weapon.subWeapon.name]),
              },
              result:{
                paint:paint ?? 0,
                kill:result?.kill ?? 0,
                death:result?.death ?? 0,
                assist:result?.assist ?? 0,
                special:result?.special ?? 0,
              }
            })))
          }))),
          awards:data.detail.awards,
          date:data.detail.playedTime,
          duration:data.detail.duration,
          player:{
            name:data.detail.player.name,
            byname:data.detail.player.byname,
            rank:data.listNode?.udemae ?? null,
          },
          stage:{
            name:data.detail.vsStage.name,
            icon:await imports.imgb64(assets.stages[data.detail.vsStage.name]),
          }
        })))
      }
      vs.player = vs.matches.at(-1)?.player ?? null
    }

    //Salmon run
    let salmon = null
    if (modes.includes("salmon-run")) {
      salmon = {
        matches:await Promise.all(fetched.filter(({type}) => type === "COOP").slice(0, _salmon_limit).map(async ({data}) => ({
          weapons:await Promise.all(data.detail.myResult.weapons.map(async ({name}) => ({name, icon:await imports.imgb64(assets.weapons[name])}))),
          special:{
            name:data.detail.myResult.specialWeapon.name,
            icon:await imports.imgb64(assets.specials[data.detail.myResult.specialWeapon.name])
          },
          eggs:{
            golden:data.detail.myResult.goldenDeliverCount,
            regular:data.detail.myResult.deliverCount,
          },
          defeated:await Promise.all(data.detail.enemyResults.map(async ({defeatCount:count, enemy:{name}}) => ({name, count, icon:await imports.imgb64(assets.salmon[name])}))),
          rescues:data.detail.myResult.rescueCount,
          rescued:data.detail.myResult.rescuedCount,
          waves:data.detail.waveResults.map(({deliverNorm:quota, teamDeliverCount:delivered}) => ({quota, delivered})),
          failed:data.detail.resultWave,
          hazard:Math.round(data.detail.dangerRate*100),
          boss:data.detail.bossResult ? {
            defeated:data.detail.bossResult.hasDefeatBoss,
            name:data.detail.bossResult.boss.name,
            icon:await imports.imgb64(assets.salmon[data.detail.bossResult.boss.name])
          } : null,
          stage:{
            name:data.detail.coopStage.name,
            icon:await imports.imgb64(assets.stages[data.detail.coopStage.name])
          },
          date:data.detail.playedTime,
          grade:data.detail.afterGrade.name,
          player:data.detail.myResult.player.name,
        }))),
      }
      salmon.player = {
        name:salmon.matches.at(-1)?.player ?? null,
        grade:salmon.matches.at(-1)?.grade ?? null,
      }
    }

    //Results
    return {
      vs,
      salmon,
      icons:Object.fromEntries(await Promise.all(Object.entries(assets.icons).map(async ([k, v]) => [k, await imports.imgb64(v)])))
    }
  }
  //Handle errors
  catch (error) {
    throw imports.format.error(error)
  }
}

