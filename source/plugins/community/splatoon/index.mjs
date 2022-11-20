//Setup
export default async function({login, q, imports, data, computed, rest, graphql, queries, account}, {enabled = false, extras = false, token} = {}) {
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
         // .sort((a, b) => new Date(b.data.detail.playedTime) - new Date(a.data.detail.playedTime))

    //Salmon run
    const salmon = fetched.filter(({type}) => type === "COOP").slice(0, _salmon_limit || Infinity)
    const matches = await Promise.all(salmon.map(async ({data}) => ({
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
    })))

    //Results
    return {
      grade:matches.at(-1)?.grade ?? null,
      player:matches.at(-1)?.player ?? null,
      matches,
      icons:Object.fromEntries(await Promise.all(Object.entries(assets.icons).map(async ([k, v]) => [k, v.startsWith("data:image/png;base64") ? v : await imports.imgb64(v)])))
    }
  }
  //Handle errors
  catch (error) {
    throw imports.format.error(error)
  }
}

const assets = {
  stages:{
    "Sockeye Station":"https://cdn.wikimg.net/en/splatoonwiki/images/1/1d/S3_Stage_Sockeye_Station.png",
    "Gone Fission Hydroplant":"https://cdn.wikimg.net/en/splatoonwiki/images/7/7c/S3_Stage_Gone_Fission_Hydroplant.png",
    "Spawning Grounds":"https://cdn.wikimg.net/en/splatoonwiki/images/f/f4/S3_Stage_Spawning_Grounds.png",
    "Marooner's Bay":"https://splatoonwiki.org/wiki/File:S3_Stage_Marooner%27s_Bay.png",
  },
  weapons:{
    ".52 Gal": "https://cdn.wikimg.net/en/splatoonwiki/images/thumb/e/e3/S3_Weapon_Main_.52_Gal_Flat.png/120px-S3_Weapon_Main_.52_Gal_Flat.png",
    ".96 Gal": "https://cdn.wikimg.net/en/splatoonwiki/images/thumb/8/88/S3_Weapon_Main_.96_Gal_Flat.png/120px-S3_Weapon_Main_.96_Gal_Flat.png",
    "Aerospray MG": "https://cdn.wikimg.net/en/splatoonwiki/images/thumb/0/0e/S3_Weapon_Main_Aerospray_MG_Flat.png/120px-S3_Weapon_Main_Aerospray_MG_Flat.png",
    "Ballpoint Splatling": "https://cdn.wikimg.net/en/splatoonwiki/images/thumb/7/78/S3_Weapon_Main_Ballpoint_Splatling_Flat.png/120px-S3_Weapon_Main_Ballpoint_Splatling_Flat.png",
    "Bamboozler 14 Mk I": "https://cdn.wikimg.net/en/splatoonwiki/images/thumb/a/a1/S3_Weapon_Main_Bamboozler_14_Mk_I_Flat.png/120px-S3_Weapon_Main_Bamboozler_14_Mk_I_Flat.png",
    "Blaster": "https://cdn.wikimg.net/en/splatoonwiki/images/thumb/9/94/S3_Weapon_Main_Blaster_Flat.png/120px-S3_Weapon_Main_Blaster_Flat.png",
    "Bloblobber": "https://cdn.wikimg.net/en/splatoonwiki/images/thumb/d/dd/S3_Weapon_Main_Bloblobber_Flat.png/120px-S3_Weapon_Main_Bloblobber_Flat.png",
    "Carbon Roller": "https://cdn.wikimg.net/en/splatoonwiki/images/thumb/7/77/S3_Weapon_Main_Carbon_Roller_Flat.png/120px-S3_Weapon_Main_Carbon_Roller_Flat.png",
    "Clash Blaster": "https://cdn.wikimg.net/en/splatoonwiki/images/thumb/a/a3/S3_Weapon_Main_Clash_Blaster_Flat.png/120px-S3_Weapon_Main_Clash_Blaster_Flat.png",
    "Classic Squiffer": "https://cdn.wikimg.net/en/splatoonwiki/images/thumb/4/48/S3_Weapon_Main_Classic_Squiffer_Flat.png/120px-S3_Weapon_Main_Classic_Squiffer_Flat.png",
    "Dapple Dualies": "https://cdn.wikimg.net/en/splatoonwiki/images/thumb/a/a0/S3_Weapon_Main_Dapple_Dualies_Flat.png/120px-S3_Weapon_Main_Dapple_Dualies_Flat.png",
    "Dark Tetra Dualies": "https://cdn.wikimg.net/en/splatoonwiki/images/thumb/2/2a/S3_Weapon_Main_Dark_Tetra_Dualies_Flat.png/120px-S3_Weapon_Main_Dark_Tetra_Dualies_Flat.png",
    "Dualie Squelchers": "https://cdn.wikimg.net/en/splatoonwiki/images/thumb/0/05/S3_Weapon_Main_Dualie_Squelchers_Flat.png/120px-S3_Weapon_Main_Dualie_Squelchers_Flat.png",
    "Dynamo Roller": "https://cdn.wikimg.net/en/splatoonwiki/images/thumb/0/0d/S3_Weapon_Main_Dynamo_Roller_Flat.png/120px-S3_Weapon_Main_Dynamo_Roller_Flat.png",
    "E-liter 4K": "https://cdn.wikimg.net/en/splatoonwiki/images/thumb/a/ad/S3_Weapon_Main_E-liter_4K_Flat.png/120px-S3_Weapon_Main_E-liter_4K_Flat.png",
    "E-liter 4K Scope": "https://cdn.wikimg.net/en/splatoonwiki/images/thumb/4/41/S3_Weapon_Main_E-liter_4K_Scope_Flat.png/120px-S3_Weapon_Main_E-liter_4K_Scope_Flat.png",
    "Explosher": "https://cdn.wikimg.net/en/splatoonwiki/images/thumb/7/77/S3_Weapon_Main_Explosher_Flat.png/120px-S3_Weapon_Main_Explosher_Flat.png",
    "Flingza Roller": "https://cdn.wikimg.net/en/splatoonwiki/images/thumb/f/f3/S3_Weapon_Main_Flingza_Roller_Flat.png/120px-S3_Weapon_Main_Flingza_Roller_Flat.png",
    "Glooga Dualies": "https://cdn.wikimg.net/en/splatoonwiki/images/thumb/8/8a/S3_Weapon_Main_Glooga_Dualies_Flat.png/120px-S3_Weapon_Main_Glooga_Dualies_Flat.png",
    "Goo Tuber": "https://cdn.wikimg.net/en/splatoonwiki/images/thumb/a/a0/S3_Weapon_Main_Goo_Tuber_Flat.png/120px-S3_Weapon_Main_Goo_Tuber_Flat.png",
    "Grizzco Blaster": "https://cdn.wikimg.net/en/splatoonwiki/images/thumb/c/ca/S3_Weapon_Main_Grizzco_Blaster_Flat.png/120px-S3_Weapon_Main_Grizzco_Blaster_Flat.png",
    "Grizzco Brella": "https://cdn.wikimg.net/en/splatoonwiki/images/thumb/1/18/S3_Weapon_Main_Grizzco_Brella_Flat.png/120px-S3_Weapon_Main_Grizzco_Brella_Flat.png",
    "Grizzco Charger": "https://cdn.wikimg.net/en/splatoonwiki/images/thumb/5/5f/S3_Weapon_Main_Grizzco_Charger_Flat.png/120px-S3_Weapon_Main_Grizzco_Charger_Flat.png",
    "Grizzco Slosher": "https://cdn.wikimg.net/en/splatoonwiki/images/thumb/8/83/S3_Weapon_Main_Grizzco_Slosher_Flat.png/120px-S3_Weapon_Main_Grizzco_Slosher_Flat.png",
    "Grizzco Stringer": "https://cdn.wikimg.net/en/splatoonwiki/images/thumb/6/64/S3_Weapon_Main_Grizzco_Stringer_Flat.png/120px-S3_Weapon_Main_Grizzco_Stringer_Flat.png",
    "H-3 Nozzlenose": "https://cdn.wikimg.net/en/splatoonwiki/images/thumb/e/e6/S3_Weapon_Main_H-3_Nozzlenose_Flat.png/120px-S3_Weapon_Main_H-3_Nozzlenose_Flat.png",
    "Heavy Splatling": "https://cdn.wikimg.net/en/splatoonwiki/images/thumb/e/e4/S3_Weapon_Main_Heavy_Splatling_Flat.png/120px-S3_Weapon_Main_Heavy_Splatling_Flat.png",
    "Hero Shot Level 1": "https://cdn.wikimg.net/en/splatoonwiki/images/thumb/3/38/S3_Weapon_Main_Hero_Shot_Level_1_Flat.png/120px-S3_Weapon_Main_Hero_Shot_Level_1_Flat.png",
    "Hero Shot Replica": "https://cdn.wikimg.net/en/splatoonwiki/images/thumb/4/49/S3_Weapon_Main_Hero_Shot_Replica_Flat.png/120px-S3_Weapon_Main_Hero_Shot_Replica_Flat.png",
    "Hydra Splatling": "https://cdn.wikimg.net/en/splatoonwiki/images/thumb/b/b3/S3_Weapon_Main_Hydra_Splatling_Flat.png/120px-S3_Weapon_Main_Hydra_Splatling_Flat.png",
    "Inkbrush": "https://cdn.wikimg.net/en/splatoonwiki/images/thumb/e/e8/S3_Weapon_Main_Inkbrush_Flat.png/120px-S3_Weapon_Main_Inkbrush_Flat.png",
    "Jet Squelcher": "https://cdn.wikimg.net/en/splatoonwiki/images/thumb/8/80/S3_Weapon_Main_Jet_Squelcher_Flat.png/120px-S3_Weapon_Main_Jet_Squelcher_Flat.png",
    "L-3 Nozzlenose": "https://cdn.wikimg.net/en/splatoonwiki/images/thumb/b/bd/S3_Weapon_Main_L-3_Nozzlenose_Flat.png/120px-S3_Weapon_Main_L-3_Nozzlenose_Flat.png",
    "Luna Blaster": "https://cdn.wikimg.net/en/splatoonwiki/images/thumb/8/8e/S3_Weapon_Main_Luna_Blaster_Flat.png/120px-S3_Weapon_Main_Luna_Blaster_Flat.png",
    "Mini Splatling": "https://cdn.wikimg.net/en/splatoonwiki/images/thumb/1/16/S3_Weapon_Main_Mini_Splatling_Flat.png/120px-S3_Weapon_Main_Mini_Splatling_Flat.png",
    "N-ZAP '85": "https://cdn.wikimg.net/en/splatoonwiki/images/thumb/9/97/S3_Weapon_Main_N-ZAP_%2785_Flat.png/120px-S3_Weapon_Main_N-ZAP_%2785_Flat.png",
    "Nautilus 47": "https://cdn.wikimg.net/en/splatoonwiki/images/thumb/b/be/S3_Weapon_Main_Nautilus_47_Flat.png/120px-S3_Weapon_Main_Nautilus_47_Flat.png",
    "Octobrush": "https://cdn.wikimg.net/en/splatoonwiki/images/thumb/9/9a/S3_Weapon_Main_Octobrush_Flat.png/120px-S3_Weapon_Main_Octobrush_Flat.png",
    "Range Blaster": "https://cdn.wikimg.net/en/splatoonwiki/images/thumb/7/7c/S3_Weapon_Main_Range_Blaster_Flat.png/120px-S3_Weapon_Main_Range_Blaster_Flat.png",
    "Rapid Blaster": "https://cdn.wikimg.net/en/splatoonwiki/images/thumb/d/dc/S3_Weapon_Main_Rapid_Blaster_Flat.png/120px-S3_Weapon_Main_Rapid_Blaster_Flat.png",
    "Rapid Blaster Pro": "https://cdn.wikimg.net/en/splatoonwiki/images/thumb/7/71/S3_Weapon_Main_Rapid_Blaster_Pro_Flat.png/120px-S3_Weapon_Main_Rapid_Blaster_Pro_Flat.png",
    "REEF-LUX 450": "https://cdn.wikimg.net/en/splatoonwiki/images/thumb/6/68/S3_Weapon_Main_REEF-LUX_450_Flat.png/120px-S3_Weapon_Main_REEF-LUX_450_Flat.png",
    "Slosher": "https://cdn.wikimg.net/en/splatoonwiki/images/thumb/b/b8/S3_Weapon_Main_Slosher_Flat.png/120px-S3_Weapon_Main_Slosher_Flat.png",
    "Sloshing Machine": "https://cdn.wikimg.net/en/splatoonwiki/images/thumb/8/8c/S3_Weapon_Main_Sloshing_Machine_Flat.png/120px-S3_Weapon_Main_Sloshing_Machine_Flat.png",
    "Splash-o-matic": "https://cdn.wikimg.net/en/splatoonwiki/images/thumb/8/85/S3_Weapon_Main_Splash-o-matic_Flat.png/120px-S3_Weapon_Main_Splash-o-matic_Flat.png",
    "Splat Brella": "https://cdn.wikimg.net/en/splatoonwiki/images/thumb/0/02/S3_Weapon_Main_Splat_Brella_Flat.png/120px-S3_Weapon_Main_Splat_Brella_Flat.png",
    "Splat Charger": "https://cdn.wikimg.net/en/splatoonwiki/images/thumb/4/43/S3_Weapon_Main_Splat_Charger_Flat.png/120px-S3_Weapon_Main_Splat_Charger_Flat.png",
    "Splat Dualies": "https://cdn.wikimg.net/en/splatoonwiki/images/thumb/e/ec/S3_Weapon_Main_Splat_Dualies_Flat.png/120px-S3_Weapon_Main_Splat_Dualies_Flat.png",
    "Splat Roller": "https://cdn.wikimg.net/en/splatoonwiki/images/thumb/c/c7/S3_Weapon_Main_Splat_Roller_Flat.png/120px-S3_Weapon_Main_Splat_Roller_Flat.png",
    "Splatana Stamper": "https://cdn.wikimg.net/en/splatoonwiki/images/thumb/5/52/S3_Weapon_Main_Splatana_Stamper_Flat.png/120px-S3_Weapon_Main_Splatana_Stamper_Flat.png",
    "Splatana Wiper": "https://cdn.wikimg.net/en/splatoonwiki/images/thumb/6/67/S3_Weapon_Main_Splatana_Wiper_Flat.png/120px-S3_Weapon_Main_Splatana_Wiper_Flat.png",
    "Splatterscope": "https://cdn.wikimg.net/en/splatoonwiki/images/thumb/8/82/S3_Weapon_Main_Splatterscope_Flat.png/120px-S3_Weapon_Main_Splatterscope_Flat.png",
    "Splattershot": "https://cdn.wikimg.net/en/splatoonwiki/images/thumb/9/9c/S3_Weapon_Main_Splattershot_Flat.png/120px-S3_Weapon_Main_Splattershot_Flat.png",
    "Splattershot Jr.": "https://cdn.wikimg.net/en/splatoonwiki/images/thumb/0/04/S3_Weapon_Main_Splattershot_Jr._Flat.png/120px-S3_Weapon_Main_Splattershot_Jr._Flat.png",
    "Splattershot Pro": "https://cdn.wikimg.net/en/splatoonwiki/images/thumb/b/bd/S3_Weapon_Main_Splattershot_Pro_Flat.png/120px-S3_Weapon_Main_Splattershot_Pro_Flat.png",
    "Sploosh-o-matic": "https://cdn.wikimg.net/en/splatoonwiki/images/thumb/0/01/S3_Weapon_Main_Sploosh-o-matic_Flat.png/120px-S3_Weapon_Main_Sploosh-o-matic_Flat.png",
    "Squeezer": "https://cdn.wikimg.net/en/splatoonwiki/images/thumb/0/05/S3_Weapon_Main_Squeezer_Flat.png/120px-S3_Weapon_Main_Squeezer_Flat.png",
    "Tenta Brella": "https://cdn.wikimg.net/en/splatoonwiki/images/thumb/5/53/S3_Weapon_Main_Tenta_Brella_Flat.png/120px-S3_Weapon_Main_Tenta_Brella_Flat.png",
    "Tri-Slosher": "https://cdn.wikimg.net/en/splatoonwiki/images/thumb/0/0e/S3_Weapon_Main_Tri-Slosher_Flat.png/120px-S3_Weapon_Main_Tri-Slosher_Flat.png",
    "Tri-Stringer": "https://cdn.wikimg.net/en/splatoonwiki/images/thumb/a/a9/S3_Weapon_Main_Tri-Stringer_Flat.png/120px-S3_Weapon_Main_Tri-Stringer_Flat.png",
    "Undercover Brella": "https://cdn.wikimg.net/en/splatoonwiki/images/thumb/8/8c/S3_Weapon_Main_Undercover_Brella_Flat.png/120px-S3_Weapon_Main_Undercover_Brella_Flat.png"
  },
  specials:{
    "Big Bubbler": "https://cdn.wikimg.net/en/splatoonwiki/images/thumb/e/ef/S3_Weapon_Special_Big_Bubbler.png/120px-S3_Weapon_Special_Big_Bubbler.png",
    "Booyah Bomb": "https://cdn.wikimg.net/en/splatoonwiki/images/thumb/0/00/S3_Weapon_Special_Booyah_Bomb.png/120px-S3_Weapon_Special_Booyah_Bomb.png",
    "Crab Tank": "https://cdn.wikimg.net/en/splatoonwiki/images/thumb/8/88/S3_Weapon_Special_Crab_Tank.png/120px-S3_Weapon_Special_Crab_Tank.png",
    "Ink Storm": "https://cdn.wikimg.net/en/splatoonwiki/images/thumb/6/69/S3_Weapon_Special_Ink_Storm.png/120px-S3_Weapon_Special_Ink_Storm.png",
    "Ink Vac": "https://cdn.wikimg.net/en/splatoonwiki/images/thumb/c/cf/S3_Weapon_Special_Ink_Vac.png/120px-S3_Weapon_Special_Ink_Vac.png",
    "Inkjet": "https://cdn.wikimg.net/en/splatoonwiki/images/thumb/8/80/S3_Weapon_Special_Inkjet.png/120px-S3_Weapon_Special_Inkjet.png",
    "Killer Wail 5.1": "https://cdn.wikimg.net/en/splatoonwiki/images/thumb/1/1a/S3_Weapon_Special_Killer_Wail_5.1.png/120px-S3_Weapon_Special_Killer_Wail_5.1.png",
    "Rainmaker": "https://cdn.wikimg.net/en/splatoonwiki/images/thumb/b/b8/S3_Weapon_Special_Rainmaker.png/120px-S3_Weapon_Special_Rainmaker.png",
    "Reefslider": "https://cdn.wikimg.net/en/splatoonwiki/images/thumb/1/10/S3_Weapon_Special_Reefslider.png/120px-S3_Weapon_Special_Reefslider.png",
    "Splashdown": "https://cdn.wikimg.net/en/splatoonwiki/images/2/23/S3_Weapon_Special_Splashdown.png",
    "Tacticooler": "https://cdn.wikimg.net/en/splatoonwiki/images/thumb/c/c0/S3_Weapon_Special_Tacticooler.png/120px-S3_Weapon_Special_Tacticooler.png",
    "Tenta Missiles": "https://cdn.wikimg.net/en/splatoonwiki/images/thumb/3/3b/S3_Weapon_Special_Tenta_Missiles.png/120px-S3_Weapon_Special_Tenta_Missiles.png",
    "Triple Inkstrike": "https://cdn.wikimg.net/en/splatoonwiki/images/thumb/3/3a/S3_Weapon_Special_Triple_Inkstrike.png/120px-S3_Weapon_Special_Triple_Inkstrike.png",
    "Trizooka": "https://cdn.wikimg.net/en/splatoonwiki/images/thumb/9/93/S3_Weapon_Special_Trizooka.png/120px-S3_Weapon_Special_Trizooka.png",
    "Ultra Stamp": "https://cdn.wikimg.net/en/splatoonwiki/images/thumb/7/70/S3_Weapon_Special_Ultra_Stamp.png/120px-S3_Weapon_Special_Ultra_Stamp.png",
    "Wave Breaker": "https://cdn.wikimg.net/en/splatoonwiki/images/thumb/6/67/S3_Weapon_Special_Wave_Breaker.png/120px-S3_Weapon_Special_Wave_Breaker.png",
    "Zipcaster": "https://cdn.wikimg.net/en/splatoonwiki/images/thumb/9/96/S3_Weapon_Special_Zipcaster.png/120px-S3_Weapon_Special_Zipcaster.png"
  },
  salmon:{
    "Big Shot":"https://cdn.wikimg.net/en/splatoonwiki/images/9/92/S3_Big_Shot_icon.png",
    "Drizzler":"https://cdn.wikimg.net/en/splatoonwiki/images/0/09/S3_Drizzler_icon.png",
    "Cohozuna":"https://cdn.wikimg.net/en/splatoonwiki/images/7/7a/S3_Cohozuna_icon.png",
    "Fish Stick":"https://cdn.wikimg.net/en/splatoonwiki/images/a/a5/S3_Fish_Stick_icon.png",
    "Flipper-Flopper":"https://cdn.wikimg.net/en/splatoonwiki/images/6/65/S3_Flipper-Flopper_icon.png",
    "Flyfish":"https://cdn.wikimg.net/en/splatoonwiki/images/2/24/S3_Flyfish_icon.png",
    "Goldie":"https://cdn.wikimg.net/en/splatoonwiki/images/b/bc/S3_Goldie_icon.png",
    "Griller":"https://cdn.wikimg.net/en/splatoonwiki/images/4/49/S3_Griller_icon.png",
    "Maws":"https://cdn.wikimg.net/en/splatoonwiki/images/8/83/S3_Maws_icon.png",
    "Mudmouth":"https://cdn.wikimg.net/en/splatoonwiki/images/0/07/S3_Mudmouth_icon.png",
    "Scrapper":"https://cdn.wikimg.net/en/splatoonwiki/images/8/8c/S3_Scrapper_icon.png",
    "Slammin' Lid":"https://cdn.wikimg.net/en/splatoonwiki/images/f/fa/S3_Slammin%27_Lid_icon.png",
    "Steel Eel":"https://cdn.wikimg.net/en/splatoonwiki/images/6/62/S3_Steel_Eel_icon.png",
    "Steelhead":"https://cdn.wikimg.net/en/splatoonwiki/images/9/9a/S3_Steelhead_icon.png",
    "Stinger":"https://cdn.wikimg.net/en/splatoonwiki/images/b/b5/S3_Stinger_icon.png"
  },
  icons:{
    "golden_egg":"https://cdn.wikimg.net/en/splatoonwiki/images/c/cf/S2_Icon_Golden_Egg.png",
    "eggs":"https://cdn.wikimg.net/en/splatoonwiki/images/7/75/SplatNet_3_icon_Power_Egg.png",
    "salmon_run":"https://cdn.wikimg.net/en/splatoonwiki/images/2/21/S3_SRNW_logo.png",
    "rescues": "data:image/png;base64,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",
    "rescued": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADcAAAAbCAIAAABX14BcAAAACXBIWXMAAA7DAAAOwwHHb6hkAAAMhElEQVR42n1YCXAUVRqO6wohmaPvu3tmQkI4Esgxmenume7pmclNkgEm3JAYLkFOuQIBBAwQBQVxSzy2XHfLskqLXV1Ka3dL1i2vki1dUBfcXVQUKC5lAQMEQq7ev2eGIWC5VX89munX733ve//x/cnQWTRtISZhLHKP6QkLcmja7kz+v5ZcFuYHOFThrTH9eXrH9JzktNuGB1k8vV1GanYS0KClf2pBDknbXaf6GXDpva3teQQs/W16pkHf+QReJadZh2Fx3bLUOveiTK3O4ndZarPkNo6E/SzQe/Dd/a11J2l8abv94WAWLJTJ1WBMoTR4TGOcBm8B8uI2w8WV4I6gyCgcqbs4P+XUBHiFqIwjxDs13plYy9peYxCw9KHhGRZJo1RZJPEhGmCdUYm0toBnwh6iEJ1EwwwBo0HjYQYzWAxehawFnUHaEWIAIp48AIwplDKeBWv5SJvuZhSB0jyil6d9IhsakbM8Hts6rykgkvA26qF1IJKxpe7lbicDCwsEoPRjWbqAGxLpp+yAUmWcAcoepOw64wzzWFQgdRoYxTUKtaCwBIxB0qHitgBpgyuNikSCYzxNdgplxXDOOreL1nL48aXj1jw4841fP3fi00Nmzw3z4oWzR/6uuhg/Cyyifnxo1IWrnFO57WqhBAfpUFNJW0QkdAGDyTDKlC0k4kZiAuADKIAJbjMqcgES0xkgGK7R4jLCE2AwU6ccg/0hhRL4KCOyVYF4fXfHf7/8zELW223eumn23jJ7unsv/dB99lQgV1JF0kjcGtA5GKWezga0EzaAsVwigTmFyA7DddMOPUEPEAkoA5RDoZAAIBPoALiTyMCo0ngggRU4tmimnfe4bAplkCcCErP/mafMnusWxL5es6fHHOg3B3rN7q6+yxeXTI/7eEJl4fSWbyXjMenpFm7GaS1NOio4vEaiNSw7QiNRHjcYpNJNW28ZVEazgjQacbGAT+WpEhINuHgvQ/g5IiDQIfiKI4JwThoBRu+JxYxkRCsMXsaSi+Mx81YX8GfhM80ewGqa/be6z5/4+rV9z5SAA0k0rAK+lQ7GNMQw5YxSiIHbNUdmBYVUcUQli8OPQTQrwmFhDi93WTjKCLuXRsvH5JZJjFekZQ9fwpPjKLSMwYApmJDOG4NzRQqll0QgYmJqmdl5GS66v7+3zzQB403rX/NW55V/HfoI4ins5uGgQcIWssLcobEQEPYQbY/QjgoWqWbRKXlSPIevYdAoYYvg2TBWMUg0QWREJOGQZQwyMxLY1bqiY/WyrSsWzYvXxQ3FKMhT3KwiWHeVzhiD8jyeQhnkKR9Lanme05//w+zrAQZ7BvoBJWAcGOjruvTDxW+O1xQVyDSmUU7gxvJxKEhM4oJotILBaziijkOfm9X46qLmWuyBejJzBodMJrN31BoTGXuMtZcTmRrtCLjplS3Tf7Xj0Z2b1z/dvmnvlvW7N6zZ8ciS1qbpsw21PM+dcFAEICXLVdKSMW5FnA9HZZY6+MrLZu8NK3TAIwcAbm9/9/VzX//bvHq5KRKynJ1wAiyIkggkXorQKSpC0NU0F8EcM3PY/S1Tfj+7bhqZsV3L/WM8/KI6el0euSYXf1oZuUi013BZiofc0Lpk67ZNHds2P7Vt85621qlasHZsYTR/xGTFt6WlaX5E161SQgKFfgH1i4hfdKQykR/JjghsNEfcPLfZvH7F7Lx09cypv7315qOrlsfKjWDhyI8O7N/XtlZ3CTpPQxBY7ijgMniqKIRItpoTFNvQGJm1grOvpe+fj2U8G+S+Wtjwfq13dVbGW/X+I/NjL4QLK+wZlQWuJ5/YsnPP49vaN3ds2hDXA0snTphtRJqjkcqCMVNk3/Z5zVU5gs7QAFS2UDpk0ZZCqdCOiIcro53REe7tD8+dFlLh9ksl3ueRSkTO6+Laly06/t5BcHM9R/JJRGgUX+RyyiM4r5sto3CVQKMi1kAN3ZJPvl1X+rLGvVg07KuZgTNN4f1jsY8avMcWxH4TLZpIDWnSi7e1PbJx4+rFcx9sMLTJhlY9bkwhiVeNK1zbNMsvsROKCwIQhRRt0KR16YIjyNtSmQiKRFAiACUk9pCHhcLoJTHNLZRSmJ+nFbcwMxo6/8/DVSWFE3X5+Y7N7x545egnB49/fujT995544V988ZXhvKYCH7f48XS0UUTv1hQ/sVs37kW4+wM5dxs7esZ2qczo7tL3TH0F4ui8p6NayKK98FJsUVT4+vnNUfH5Je6hVhQ3r5yiTbCrbk5iPQIRYIlsDkgPadQht20KmAhiZQpu4/IhioXEWkfmm35hwCBSVQXFXSd/ubLj983u66YfeC418yB7t6bN8yBRC7o7n73rdfjpbmTh2Vsd9v+VFt4rDn4bVPgRGPJhenK2ebI0bn1rZIthty3ujrUKHtn1VQYhaPKcoSVTVN3rXtk3aI5HW2rWxe2yHlSMfDF4gmU+F0orTpO2f1QQzkMniMCDsFoxTLUK55UGNTHUQ/FxoOzJhJ+T2/nFcj5Ny5c6L9+04TEemvA7L5lmtd/OPbxa3Mb/9JYfqS5/D/NBqC8OEe/MkP9Li4faal9wpfbSGQ+Gqsqz3G3P7zADyndzc6uMRZMri8Z6RqTw6vjRqmjPFoeb7iYRBHHb8vF2yihtla7eEubQFFKlDjQBwpth8qpuZnKwpF9508nIf547uzLe/dOUTTdleuVPNVy4PUXXzJvXDfNa2bXqcM72w40BN428r+arX3bpJycUtw5texyU/STefVvzo1vKVcei9dPSkRJx+KFD8frH1uxwD/aUzTKU1wwYlqstn310idXLaka5Unqy0QyQsAykrkeRJSK2g0CHjBIMap16VhQQEMeugDN3DCvySruXV1ws4019UXu4TLDqwyruHKKBGms5Dp9/Fhf/yWz59zRve2t1JCtjowjk+RvWkInZ8pn6seem2U8XkBPQjKmuKm2+uqlVZW6S5xTEd6+5KElMyaMkciJtZEdWzfs3r5l18bWZze2Lp9YA2koCVEWLEvlyxBNggHJgwqoVQAho8oitW5uk1U2obLfuLl4zvxCz3CfJPkEvkQSiz2etuVLB252Wlxe+e7P65e9WqP/rjT3WEvdZ3Mq9g3/5YmpwcOTtYfYByrR+6EOTcgf3t7cPKm0WOZpv0T7hgtVaknHo+uf2Lxp16aNT65fE/eX1hfkBQcReSerg4KCFAVjUn6mKymcKZQjVI0d3XPurNnTa/b193Re//Cdg892bNu5Ye0bv33p4slv+67+CJEEfnnq8AdzRw+fTzp2F43466y65yNjtubbjy2e/IcGtQHNMIihcFGg1sbn5/toEiISUNbJxTvXr9y1qW1v+2MLGhvb5szRJD54u5e4rWnSaoMjFS4hpVjLbaG6JE2nMT+BhHKk9S3Nvd9/b116f0IomT0Wsv4eE+poX2//taufH/oAhGklgY/PypyUPbRZwGP0kAnCkM3G2OmSLcpkQukPCUyAoUpRxM+QIMF8PFZXVrhnw+r25cuWTp8xu7xKESSNZ0HCWRIdZH9Kq+N3UMo8ZFEymERJ4VEKBYOHKjfvxRA/z0yLGh++faDz/Fnz5nVzoMvsvdbXefHG+TMnvzjStnCBnOdRBKacoholoQLJMtChERGE+jBDzFKpITq4F+1QwKkkUYVLEzgQ/17G7mWRpgp9WWPcL0oB0aVLLh+JWIKfAXmApMii8FS+VHgcDO43GUxpLhUkK8JTKpDq4kA0lYhMtGh0y4SaVS1TV86auGpKwyRvgZ/DZEhhQsJPkKwwlhVhbFGXU+EyZTFLdmX7hWyZc4LeCbB0gIbSR8ukU2EduoQmAxQqSIDldEEEphPZGgNNnQBqYYgmUaZl0k/bQlDXoEytDoZwgDSEygRCEEQ75F7dTVlak8PDLirsIi39QSM1IOZpm9W+CU4fNUxzY6HhNAQpdCOQBcOSIGOowdGW2uUcYdEZ4u3QgYR5Bn4H4QKiJ9ED2pL6PynXU1wmyLMYBvih1B8IUq0xnBUODf+1OkDaARNqXYyCZUOTCQJKRuAXyks5wEIcATflxbP8PKK6CD/0pTQZxnEdw0MUAaXZahjAHXE8zJGJNsimkg9o1NAoaDN7Vr3HHWYoWFkT7GEPFuAdybhJBvcdlKC0YRyMUhmEEpK81SEQ2RHcXg4xyNNlOFoucICyjEKNHC4kUNDQANkQE5bRWBUvlONUFKOiNAONokqCpCfhE4hIOHCYd4DjGuAbjLMCegkE2l+sQqJlOlPlskFkKOk2lcX/B7BYbp3+HFb4AAAAAElFTkSuQmCC",
  }
}