//Setup
export default async function({login, q, imports, data, account}, {enabled = false} = {}) {
  //Plugin execution
  try {
    //Check if plugin is enabled and requirements are met
    if ((!enabled) || (!q.support))
      return null

    //Load inputs
    imports.metadata.plugins.stackoverflow.inputs({data, account, q})

    //Start puppeteer and navigate to github.community
    const result = {stats: {solutions: 0, posts: 0, topics: 0, received: 0}, badges: {count: 0}}
    console.debug(`metrics/compute/${login}/plugins > support > starting browser`)
    const browser = await imports.puppeteer.launch()
    console.debug(`metrics/compute/${login}/plugins > support > started ${await browser.version()}`)
    const page = await browser.newPage()

    //Check account existence
    {
      await page.goto(`https://github.community/u/${login}`)
      const frame = page.mainFrame()
      try {
        await frame.waitForSelector(".user-profile-names", {timeout: 5000})
      }
      catch {
        throw {error: {message: "Could not find matching account on github.community"}}
      }
    }

    //Stats
    {
      await page.goto(`https://github.community/u/${login}/summary`)
      const frame = page.mainFrame()
      await frame.waitForSelector(".stats-section")
      Object.assign(
        result.stats,
        Object.fromEntries(
          (await frame.evaluate(() =>
            [...document.querySelectorAll(".stats-section li")].map(el => [
              el.querySelector(".label").innerText.trim().toLocaleLowerCase(),
              el.querySelector(".value").innerText.trim().toLocaleLowerCase(),
            ])
          )).map(([key, value]) => {
            switch (true) {
              case /solutions?/.test(key):
                return ["solutions", Number(value)]
              case /posts? created/.test(key):
                return ["posts", Number(value)]
              case /topics? created/.test(key):
                return ["topics", Number(value)]
              case /received/.test(key):
                return ["hearts", Number(value)]
              default:
                return null
            }
          }).filter(kv => kv),
        ),
      )
    }

    //Badges
    {
      await page.goto(`https://github.community/u/${login}/badges`)
      const frame = page.mainFrame()
      await frame.waitForSelector(".badge-group-list")
      const badges = await frame.evaluate(() => ({
        uniques: [...document.querySelectorAll(".badge-card .badge-link")].map(el => el.innerText),
        multiples: [...document.querySelectorAll(".grant-count")].map(el => Number(el.innerText)),
      }))
      badges.count = badges.uniques.length + (badges.multiples.reduce((a, b) => a + b, 0) - badges.multiples.length)
      result.badges = badges
    }

    //Close browser
    console.debug(`metrics/compute/${login}/plugins > support > closing browser`)
    await browser.close()

    //Results
    return result
  }
  //Handle errors
  catch (error) {
    if (error.error?.message)
      throw error
    throw {error: {message: "An error occured", instance: error}}
  }
}
