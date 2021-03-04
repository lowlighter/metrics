//Setup
  export default async function({login, q, imports, data, account}, {enabled = false} = {}) {
    //Plugin execution
      try {
        //Check if plugin is enabled and requirements are met
          if ((!enabled)||(!q.skyline))
            return null

        //Load inputs
          let {year, frames, quality} = imports.metadata.plugins.skyline.inputs({data, account, q})
          if (Number.isNaN(year)) {
            year = new Date().getFullYear()
            console.debug(`metrics/compute/${login}/plugins > skyline > year set to ${year}`)
          }
          const width = 454
          const height = 284

        //Start puppeteer and navigate to skyline.github.com
          console.debug(`metrics/compute/${login}/plugins > skyline > starting browser`)
          const browser = await imports.puppeteer.launch({headless:true, executablePath:process.env.PUPPETEER_BROWSER_PATH, args:["--no-sandbox", "--disable-extensions", "--disable-setuid-sandbox", "--disable-dev-shm-usage"], ignoreDefaultArgs: ["--disable-extensions"]})
          console.debug(`metrics/compute/${login}/plugins > skyline > started ${await browser.version()}`)
          const page = await browser.newPage()
          await page.setViewport({width, height})

        //Load page
          console.debug(`metrics/compute/${login}/plugins > skyline > loading skyline.github.com/${login}/${year}`)
          await page.goto(`https://skyline.github.com/${login}/${year}`, {timeout:90*1000})
          console.debug(`metrics/compute/${login}/plugins > skyline > waiting for initial render`)
          const frame = page.mainFrame()
          await page.waitForFunction('[...document.querySelectorAll("span")].map(span => span.innerText).includes("Download STL file")', {timeout:90*1000})
          await frame.evaluate(() => [...document.querySelectorAll("button, footer, a")].map(element => element.remove()))

        //Generate gif
          console.debug(`metrics/compute/${login}/plugins > skyline > generating frames`)
          const framed = await imports.record({page, width, height, frames, scale:quality})

        //Close puppeteer
          await browser.close()

        //Results
          return {frames:framed}
      }
    //Handle errors
      catch (error) {
        throw {error:{message:"An error occured", instance:error}}
      }
  }


