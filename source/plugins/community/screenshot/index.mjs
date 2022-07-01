//Setup
export default async function({login, q, imports, data, account}, {enabled = false} = {}) {
  //Plugin execution
  try {
    //Check if plugin is enabled and requirements are met
    if ((!enabled) || (!q.screenshot))
      return null

    //Load inputs
    let {url, selector, title, background} = imports.metadata.plugins.screenshot.inputs({data, account, q})
    if (!url)
      throw {error: {message: "An url is required"}}

    //Start puppeteer and navigate to page
    console.debug(`metrics/compute/${login}/plugins > screenshot > starting browser`)
    const browser = await imports.puppeteer.launch()
    console.debug(`metrics/compute/${login}/plugins > screenshot > started ${await browser.version()}`)
    const page = await browser.newPage()
    await page.setViewport({width: 1280, height: 1280})
    console.debug(`metrics/compute/${login}/plugins > screenshot > loading ${url}`)
    await page.goto(url)

    //Screenshot
    await page.waitForSelector(selector)
    const clip = await page.evaluate(selector => {
      const {x, y, width, height} = document.querySelector(selector).getBoundingClientRect()
      return {x, y, width, height}
    }, selector)
    console.debug(`metrics/compute/${login}/plugins > screenshot > coordinates ${JSON.stringify(clip)}`)
    const [buffer] = await imports.record({page, ...clip, frames: 1, background})
    const screenshot = await imports.sharp(Buffer.from(buffer.split(",").pop(), "base64")).resize({width:Math.min(454 * (1 + data.large), clip.width)})
    const metadata = await screenshot.metadata()
    await browser.close()

    //Results
    return {image: `data:image/png;base64,${(await screenshot.toBuffer()).toString("base64")}`, title, height: metadata.height, width: metadata.width, url}
  }
  //Handle errors
  catch (error) {
    if (error.error?.message)
      throw error
    throw {title: "Screenshot error", error: {message: "An error occured", instance: error}}
  }
}
