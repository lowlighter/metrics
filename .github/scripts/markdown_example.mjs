//Imports
import puppeteer from "puppeteer"

//Setup browser
const browser = await puppeteer.launch({
  headless: "new",
  executablePath: process.env.PUPPETEER_BROWSER_PATH,
  args: ["--no-sandbox", "--disable-extensions", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  ignoreDefaultArgs: ["--disable-extensions"],
})
const page = await browser.newPage()

//Select markdown example and take screenshot
await page.setViewport({width: 600, height: 600})
await page.goto("https://github.com/lowlighter/metrics/blob/examples/metrics.markdown.md")
await page.waitForSelector("article.markdown-body")
await new Promise(solve => setTimeout(solve, 4000))
const clip = await page.evaluate(() => {
  const {x, y, width, height} = document.querySelector("article.markdown-body").getBoundingClientRect()
  return {x, y, width, height}
})
await page.screenshot({type: "png", path: "/tmp/metrics.markdown.png", clip, omitBackground: true})
await browser.close()
