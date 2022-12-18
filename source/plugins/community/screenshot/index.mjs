//Setup
export default async function({login, q, imports, data, account}, {enabled = false, extras = false} = {}) {
  //Plugin execution
  try {
    //Check if plugin is enabled and requirements are met
    if ((!q.screenshot) || (!imports.metadata.plugins.screenshot.enabled(enabled, {extras})))
      return null

    //Load inputs
    let {url, selector, title, background, viewport, wait, mode} = imports.metadata.plugins.screenshot.inputs({data, account, q})
    if (!url)
      throw {error: {message: "URL is not set"}}

    //Start puppeteer and navigate to page
    console.debug(`metrics/compute/${login}/plugins > screenshot > starting browser`)
    const browser = await imports.puppeteer.launch()
    console.debug(`metrics/compute/${login}/plugins > screenshot > started ${await browser.version()}`)
    const page = await browser.newPage()
    await page.setViewport(viewport)
    console.debug(`metrics/compute/${login}/plugins > screenshot > loading ${url}`)
    await page.goto(url, {waitUntil: ["domcontentloaded", "networkidle2"]})
    if (wait)
      await new Promise(solve => setTimeout(solve, wait))

    //Screenshot
    let content = null
    let image = null
    const metadata = {height:null, width:null}
    await page.waitForSelector(selector)
    switch (mode) {
      case "image":{
        const clip = await page.evaluate(selector => {
          const {x, y, width, height} = document.querySelector(selector).getBoundingClientRect()
          return {x, y, width, height}
        }, selector)
        console.debug(`metrics/compute/${login}/plugins > screenshot > coordinates ${JSON.stringify(clip)}`)
        const [buffer] = await imports.record({page, ...clip, frames: 1, background})
        const screenshot = await imports.sharp(Buffer.from(buffer.split(",").pop(), "base64")).resize({width: Math.min(454 * (1 + data.large), clip.width)})
        image = `data:image/png;base64,${(await screenshot.toBuffer()).toString("base64")}`
        Object.assign(metadata, await screenshot.metadata())
        break
      }
      case "text":{
        content = await page.evaluate(selector => document.querySelector(selector)?.innerText ?? "", selector)
        break
      }
      default:
        throw {error: {message: `Unsupported mode "${mode}"`}}
    }

    await browser.close()

    //Results
    return {mode, image, content, title, height: metadata.height, width: metadata.width, url}
  }
  //Handle errors
  catch (error) {
    throw imports.format.error(error, {title: "Screenshot error"})
  }
}
