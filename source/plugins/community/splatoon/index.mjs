//Imports
import assets from "./assets.mjs"

//Setup
export default async function({q, imports, data, account}, {enabled = false, extras = false, token:_token} = {}) {
  //Plugin execution
  try {
    //Check if plugin is enabled and requirements are met
    if ((!q.splatoon) || (!imports.metadata.plugins.splatoon.enabled(enabled, {extras})))
      return null

    //Load inputs
    const {"salmon.limit":_salmon_limit} = imports.metadata.plugins.splatoon.inputs({data, account, q})

    //Fetch data
    //deno run --allow-read="profile.json,profile.json.swap,export,cache" --allow-write="profile.json,profile.json.swap,export,cache" --allow-net="api.lp1.av5ja.srv.nintendo.net,accounts.nintendo.com,api.accounts.nintendo.com,api.imink.app,api-lp1.znc.srv.nintendo.net" https://raw.githubusercontent.com/spacemeowx2/s3si.ts/main/s3si.ts --exporter file

    //Read fetched data
    const fetched = (await Promise.all(
      (await imports.fs.readdir(`${imports.__module(import.meta.url)}/export`))
        .map(async file => JSON.parse(await imports.fs.readFile(`${imports.__module(import.meta.url)}/export/${file}`)))))
        .sort((a, b) => new Date(b.data.detail.playedTime) - new Date(a.data.detail.playedTime))

    //Salmon run
    const salmon = {}
    {
      Object.assign(salmon, {
        matches:await Promise.all(fetched.filter(({type}) => type === "COOP").slice(0, _salmon_limit || Infinity).map(async ({data}) => ({
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
      })
      salmon.grade = salmon.matches.at(-1)?.grade ?? null
      salmon.player = salmon.matches.at(-1)?.player ?? null
    }

    //Results
    return {
      salmon,
      icons:Object.fromEntries(await Promise.all(Object.entries(assets.icons).map(async ([k, v]) => [k, v.startsWith("data:image/png;base64") ? v : await imports.imgb64(v)])))
    }
  }
  //Handle errors
  catch (error) {
    throw imports.format.error(error)
  }
}

