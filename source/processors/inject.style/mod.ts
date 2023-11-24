// Imports
/// <reference lib="dom" />
import { is, parse, Processor, state } from "@engine/components/processor.ts"
import { Browser } from "@engine/utils/browser.ts"
import { Format } from "@engine/utils/format.ts"

/** Processor */
export default class extends Processor {
  /** Import meta */
  static readonly meta = import.meta

  /** Name */
  readonly name = "🔩 Inject CSS"

  /** Category */
  readonly category = "injector"

  /** Description */
  readonly description = "Inject custom CSS"

  /** Supports */
  readonly supports = ["application/xml"]

  /** Permissions */
  readonly permissions = ["run:chrome", "write:tmp"]

  /** Inputs */
  readonly inputs = is.object({
    style: is.string().describe("CSS to inject (placeholder: `.foo { color: skyblue; }`) (textarea)"),
  })

  /** Action */
  protected async action(state: state) {
    const result = await this.piped(state)
    const { style } = await parse(this.inputs, this.context.args)
    const page = await Browser.page({ log: this.log })
    try {
      this.log.trace("processing content in browser")
      await page.setContent(Format.html(result.content))
      await page.waitForNavigation({ waitUntil: "load" })
      const scope = `inject-style-${crypto.randomUUID().slice(-12)}`
      this.log.trace(`injecting style: ${style}`)
      result.content = await page.evaluate("dom://style.ts", { args: [scope, style] })
    } finally {
      await page.close()
    }
  }
}
