//Setup
export default async function({login, data, imports, q, account}, {enabled = false} = {}) {
  //Plugin execution
  try {
    //Check if plugin is enabled and requirements are met
    if ((!enabled) || (!q.topics))
      return null

    //Load inputs
    let {sort, mode, limit} = imports.metadata.plugins.topics.inputs({data, account, q})
    const type = {starred: "labels", labels: "labels", mastered: "icons", icons: "icons"}[mode]
    const shuffle = (sort === "random")

    //Start puppeteer and navigate to topics
    console.debug(`metrics/compute/${login}/plugins > topics > searching starred topics`)
    let topics = []
    console.debug(`metrics/compute/${login}/plugins > topics > starting browser`)
    const browser = await imports.puppeteer.launch()
    console.debug(`metrics/compute/${login}/plugins > topics > started ${await browser.version()}`)
    const page = await browser.newPage()

    //Iterate through pages
    for (let i = 1; i <= 100; i++) {
      //Load page
      console.debug(`metrics/compute/${login}/plugins > topics > loading page ${i}`)
      await page.goto(`https://github.com/stars/${login}/topics?direction=desc&page=${i}&sort=${sort}`)
      const frame = page.mainFrame()
      //Extract topics
      await Promise.race([frame.waitForSelector("ul.repo-list"), frame.waitForSelector(".blankslate")])
      const starred = await frame.evaluate(() =>
        [...document.querySelectorAll("ul.repo-list li")].map(li => ({
          name: li.querySelector(".f3").innerText,
          description: li.querySelector(".f5").innerText,
          icon: li.querySelector("img")?.src ?? null,
        }))
      )
      console.debug(`metrics/compute/${login}/plugins > topics > extracted ${starred.length} starred topics`)
      //Check if next page exists
      if (!starred.length) {
        console.debug(`metrics/compute/${login}/plugins > topics > no more page to load`)
        break
      }
      topics.push(...starred)
    }

    //Close browser
    console.debug(`metrics/compute/${login}/plugins > topics > closing browser`)
    await browser.close()

    //Shuffle topics
    if (shuffle) {
      console.debug(`metrics/compute/${login}/plugins > topics > shuffling topics`)
      topics = imports.shuffle(topics)
    }

    //Limit topics (labels)
    if ((type === "labels") && (limit > 0)) {
      console.debug(`metrics/compute/${login}/plugins > topics > keeping only ${limit} topics`)
      const removed = topics.splice(limit)
      if (removed.length)
        topics.push({name: `And ${removed.length} more...`, description: removed.map(({name}) => name).join(", "), icon: null})
    }

    //Convert icons to base64
    console.debug(`metrics/compute/${login}/plugins > topics > loading artworks`)
    for (const topic of topics) {
      if (topic.icon) {
        console.debug(`metrics/compute/${login}/plugins > topics > processing ${topic.name}`)
        const {icon} = topic
        topic.icon = await imports.imgb64(icon)
        topic.icon24 = await imports.imgb64(icon, {force: true, width: 24, height: 24})
      }
      //Escape HTML description
      topic.description = imports.htmlescape(topic.description)
    }

    //Filter topics with icon (icons)
    if (type === "icons") {
      console.debug(`metrics/compute/${login}/plugins > topics > filtering topics with icon`)
      topics = topics.filter(({icon}) => icon)
    }

    //Limit topics (icons)
    if ((type === "icons") && (limit > 0)) {
      console.debug(`metrics/compute/${login}/plugins > topics > keeping only ${limit} topics`)
      topics.splice(limit)
    }

    //Results
    return {mode, type, list: topics}
  }
  //Handle errors
  catch (error) {
    if (error.error?.message)
      throw error
    throw {error: {message: "An error occured", instance: error}}
  }
}
