//Setup
export default async function({login, q, imports, data, account}, {enabled = false, extras = false} = {}) {
  //Plugin execution
  try {
    //Check if plugin is enabled and requirements are met
    if ((!enabled) || (!q.skyline) || (!imports.metadata.plugins.skyline.extras("enabled", {extras})))
      return null

    //Load inputs
    let {year, frames, quality, compatibility, settings} = imports.metadata.plugins.skyline.inputs({data, account, q})
    if (Number.isNaN(year)) {
      year = new Date().getFullYear()
      console.debug(`metrics/compute/${login}/plugins > skyline > year set to ${year}`)
    }
    const width = 454 * (1 + data.large)
    const height = 284

    //Load settings (force default if extras is disabled)
    const {url, ready, wait, hide} = imports.metadata.plugins.skyline.extras("settings", {extras, error: false}) ? settings : JSON.parse(imports.metadata.plugins.skyline.inputs.settings.default)

    //Start puppeteer and navigate to skyline website
    console.debug(`metrics/compute/${login}/plugins > skyline > starting browser`)
    const browser = await imports.puppeteer.launch()
    console.debug(`metrics/compute/${login}/plugins > skyline > started ${await browser.version()}`)
    const page = await browser.newPage()
    await page.setViewport({width, height})

    //Load page
    if (!url)
      throw {error: {message: "Skyline URL is not set"}}
    console.debug(`metrics/compute/${login}/plugins > skyline > loading ${url.replaceAll("${login}", login).replaceAll("${year}", year)}`)
    await page.goto(url.replaceAll("${login}", login).replaceAll("${year}", year), {timeout: 90 * 1000})
    console.debug(`metrics/compute/${login}/plugins > skyline > waiting for initial render`)
    const frame = page.mainFrame()
    if (ready)
      await page.waitForFunction(ready.replaceAll("${login}", login).replaceAll("${year}", year), {timeout: 90 * 1000})
    if ((wait) && (wait > 0))
      await new Promise(solve => setTimeout(solve, wait * 1000))
    if (hide)
      await frame.evaluate(hide => [...document.querySelectorAll(hide)].map(element => element.style.display = "none"), hide)

    //Generate gif
    console.debug(`metrics/compute/${login}/plugins > skyline > generating frames`)
    const animation = compatibility ? await imports.record({page, width, height, frames, scale: quality}) : await imports.gif({page, width, height, frames, quality: Math.max(1, quality * 20)})

    //Close puppeteer
    await browser.close()

    //Results
    return {animation, width, height, compatibility}
  }
  //Handle errors
  catch (error) {
    throw imports.format.error(error)
  }
}
