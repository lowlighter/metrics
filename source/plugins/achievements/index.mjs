//Imports
import * as compute from "./list/index.mjs"

//Setup
export default async function({login, q, imports, data, computed, graphql, queries, rest, account}, {enabled = false} = {}) {
  //Plugin execution
  try {
    //Check if plugin is enabled and requirements are met
    if ((!enabled) || (!q.achievements))
      return null

    //Load inputs
    let {threshold, secrets, only, ignored, limit, display} = imports.metadata.plugins.achievements.inputs({data, q, account})

    //Initialization
    const list = []
    await total({imports})
    await compute[account]({list, login, data, computed, imports, graphql, queries, rest, rank, leaderboard})

    //Results
    const order = {S: 5, A: 4, B: 3, C: 2, $: 1, X: 0}
    const colors = {S: ["#EB355E", "#731237"], A: ["#B59151", "#FFD576"], B: ["#7D6CFF", "#B2A8FF"], C: ["#2088FF", "#79B8FF"], $: ["#FF48BD", "#FF92D8"], X: ["#7A7A7A", "#B0B0B0"]}
    const achievements = list
      .filter(a => (order[a.rank] >= order[threshold]) || ((a.rank === "$") && (secrets)))
      .filter(a => (!only.length) || ((only.length) && (only.includes(a.title.toLocaleLowerCase()))))
      .filter(a => !ignored.includes(a.title.toLocaleLowerCase()))
      .sort((a, b) => (order[b.rank] + b.progress * 0.99) - (order[a.rank] + a.progress * 0.99))
      .map(({title, unlock, ...achievement}) => ({
        prefix: ({S: "Master", A: "Super", B: "Great"}[achievement.rank] ?? ""),
        title,
        unlock: !/invalid date/i.test(unlock) ? `${imports.format.date(unlock, {time: true})} on ${imports.format.date(unlock, {date: true})}` : null,
        ...achievement,
      }))
      .map(({icon, ...achievement}) => ({icon: icon.replace(/#primary/g, colors[achievement.rank][0]).replace(/#secondary/g, colors[achievement.rank][1]), ...achievement}))
      .slice(0, limit || Infinity)
    return {list: achievements, display}
  }
  //Handle errors
  catch (error) {
    throw {error: {message: "An error occured", instance: error}}
  }
}

/**Rank */
function rank(x, [c, b, a, s, m]) {
  if (x >= s)
    return {rank: "S", progress: (x - s) / (m - s)}
  if (x >= a)
    return {rank: "A", progress: (x - a) / (m - a)}
  else if (x >= b)
    return {rank: "B", progress: (x - b) / (a - b)}
  else if (x >= c)
    return {rank: "C", progress: (x - c) / (b - c)}
  return {rank: "X", progress: x / c}
}

/**Leaderboards */
function leaderboard({user, type, requirement}) {
  return requirement
    ? {
      user: 1 + user,
      total: total[type],
      type,
      get top() {
        return Number(`1${"0".repeat(Math.ceil(Math.log10(this.user)))}`)
      },
      get percentile() {
        return 100 * (this.user / this.top)
      },
    }
    : null
}

/**Total extracter */
async function total({imports}) {
  if (!total.promise) {
    total.promise = new Promise(async (solve, reject) => {
      //Setup browser
      console.debug("metrics/compute/plugins > achievements > filling total from github.com/search")
      const browser = await imports.puppeteer.launch()
      console.debug(`metrics/compute/plugins > achievements > started ${await browser.version()}`)
      //Extracting total from github.com/search
      for (let i = 0; (i < 100) && ((!total.users) || (!total.repositories)); i++) {
        const page = await browser.newPage()
        await page.goto("https://github.com/search")
        const result = await page.evaluate(() => [...document.querySelectorAll("h2")].filter(node => /Search more/.test(node.innerText)).shift()?.innerText.trim().match(/(?<count>\d+)M\s+(?<type>repositories|users|issues)$/)?.groups) ?? null
        console.debug(`metrics/compute/plugins > achievements > setup found ${result?.type ?? "(?)"}`)
        if ((result?.type) && (!total[result.type])) {
          const {count, type} = result
          total[type] = Number(count) * 10e5
          console.debug(`metrics/compute/plugins > achievements > set total.${type} to ${total[type]}`)
        }
        await page.close()
        await imports.wait(10 * Math.random())
      }
      //Check setup state
      if ((!total.users) || (!total.repositories))
        return reject("Failed to initiate total for achievement plugin")
      console.debug("metrics/compute/plugins > achievements > total setup complete")
      return solve()
    })
  }
  return total.promise
}
