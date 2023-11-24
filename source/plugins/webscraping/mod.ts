// Imports
/// <reference lib="dom" />
import { is, parse, Plugin } from "@engine/components/plugin.ts"
import { Browser } from "@engine/utils/browser.ts"
import { delay } from "std/async/delay.ts"
import { resize } from "x/deno_image@0.0.4/mod.ts"
import { encodeBase64 } from "std/encoding/base64.ts"

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
  readonly permissions = ["run:chrome", "write:tmp", "net:all"]

  /** Description */
  readonly description = "Screenshot or extract content from a website"

  /** Inputs */
  readonly inputs = is.object({
    title: is.string().nullable().default(null).describe("Section title. Set to `null` to use Website title (placeholder: `Web scraping`)"),
    url: is.string().url().default("https://example.com").describe("Website URL (e.g. `https://example.com`)"),
    select: is.string().default("body").describe("HTML query selector"),
    viewport: is.object({
      width: is.number().positive().default(1280).describe("Viewport width"),
      height: is.number().positive().default(1280).describe("Viewport height"),
    }).default(() => ({})),
    mode: is.union([
      is.literal("text").describe("Extract text from selected content"),
      is.literal("image").describe("Screenshot selected content"),
    ]).default("image").describe("Output format"),
    wait: is.number().min(0).default(0).describe("Wait time before performing action (in seconds)"),
    background: is.boolean().default(true).describe("Display background (n.b. only applies to `image` mode)"),
  })

  /** Outputs */
  readonly outputs = is.object({
    title: is.string().describe("Website title"),
    content: is.string().describe("Extracted content (either raw text or base64 encoded image depending on `mode`)"),
  })

  /** Action */
  protected async action() {
    if (this.context.mock) {
      this.log.trace("replacing url as mock mode is enabled")
      this.context.args.url = new URL("tests/example.html", import.meta.url).href
    }
    const { url, select: selector, mode, viewport, wait, background } = await parse(this.inputs, this.context.args)
    const page = await Browser.page({ log: this.log })
    try {
      await page.setViewportSize(viewport)
      await page.goto(url, { waitUntil: "networkidle2" })
      if (wait) {
        await delay(wait * 1000)
      }
      await page.waitForSelector(selector)
      const result = { content: "", title: await page.evaluate("dom://title.ts") }
      switch (mode) {
        case "image": {
          const { x, y, width, height } = await page.evaluate("dom://image.ts", { args: [selector] })
          if (!background) {
            await page.setTransparentBackground()
          }
          const buffer = await page.screenshot({ format: "png", clip: { width, height, x, y, scale: 1 } }) as Uint8Array
          const img = await resize(buffer, { height: 400 })
          result.content = `data:image/png;base64,${encodeBase64(img)}`
          break
        }
        case "text": {
          result.content = await page.evaluate("dom://text.ts", { args: [selector] })
          break
        }
      }
      return result
    } finally {
      await page.close()
    }
  }
}
