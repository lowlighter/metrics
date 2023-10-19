// Imports
import { is, Plugin } from "@engine/components/plugin.ts"
import { Browser } from "@utils/browser.ts"
import { delay } from "std/async/delay.ts"
import { resize } from "x/deno_image@0.0.4/mod.ts"
import * as Base64 from "std/encoding/base64.ts"

/** Plugin */
export default class extends Plugin {
  /** Import meta */
  static readonly meta = import.meta

  /** Name */
  readonly name = "📸 Webscraping"

  /** Category */
  readonly category = "other"

  /** Supports */
  readonly supports = ["user", "organization", "repository"]

  /** Permissions */
  readonly permissions = ["run:chrome", "net"]

  /** Description */
  readonly description = "Screenshot or extract content from a website"

  /** Inputs */
  readonly inputs = is.object({
    url: is.string().url().default("https://example.com").describe("Website URL (e.g. `https://example.com`)"),
    select: is.string().default("body").describe("Query selector"),
    viewport: is.object({
      width: is.number().positive().default(1280).describe("Viewport width"),
      height: is.number().positive().default(1280).describe("Viewport height"),
    }).default(() => ({})),
    mode: is.enum(["text", "image"]).default("image").describe("Output"),
    wait: is.number().default(0).describe("Wait time before screenshot (in seconds)"),
    background: is.boolean().default(true).describe("Background"),
  })

  /** Outputs */
  readonly outputs = is.object({
    title: is.string(),
    content: is.string(),
  })

  /** Action */
  protected async action() {
    if (this.context.mock) {
      this.context.args.url = new URL("tests/example.html", import.meta.url).href
    }
    const { url, select: selector, mode, viewport: _, wait, background: __ } = await this.inputs.parseAsync(this.context.args)
    const page = await Browser.page({log:this.log})
    try {
      //TODO(@lowlighter): await page.setViewport(viewport)
      await page.goto(url, { waitUntil: "networkidle2" })
      if (wait) {
        await delay(wait * 1000)
      }
      await page.waitForSelector(selector)
      const result = { content: "", title: await page.evaluate(`document.title`) }
      switch (mode) {
        case "image": {
          const { x, y, width, height } = await page.evaluate([
            `const {x, y, width, height} = document.querySelector('${selector}').getBoundingClientRect()`,
            `;({x, y, width, height})`,
          ].join("\n")) as { [key: PropertyKey]: number }
          //TODO(@lowlighter):, omitBackground: !background
          const buffer = await page.screenshot({ format: "png", clip: { width, height, x, y, scale: 1 } }) as Uint8Array
          const img = await resize(buffer, { height: 400 })
          result.content = `data:image/png;base64,${Base64.encode(img)}`
          break
        }
        case "text": {
          result.content = await page.evaluate(`document.querySelector('${selector}')?.innerText ?? ""`) as string
          break
        }
      }
      await page.close()
      return result
    } catch (error) {
      await page.close()
      throw error
    }
  }
}
