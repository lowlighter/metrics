// Imports
import { is, Processor, state } from "@processor"
import { Browser } from "@utils/browser.ts"
import { Format } from "@utils/format.ts"

/** Processor */
export default class extends Processor {
  /** Import meta */
  static readonly meta = import.meta

  /** Name */
  readonly name = "🔩 Inject JavaScript"

  /** Category */
  readonly category = "injector"

  /** Description */
  readonly description = "Inject and execute custom JavaScript"

  /** Supports */
  readonly supports = ["application/xml"]

  /** Inputs */
  readonly inputs = is.object({
    script: is.string().describe("JavaScript to inject and execute"),
  })

  /** Action */
  protected async action(state: state) {
    const result = await this.piped(state)
    const { script } = await this.inputs.parseAsync(this.context.args)
    const page = await Browser.newPage()
    try {
      this.log.trace("processing content in browser")
      await page.setContent(Format.html(result.content), { waitUntil: ["load", "domcontentloaded"] })
      this.log.trace(`injecting script: ${script}`)
      result.content = await page.evaluate(async (script: string) => {
        await new Function("document", `return (async () => { ${script} })()`)(document)
        return document.querySelector("main")!.innerHTML
      }, script)
      await page.close()
    } catch (error) {
      await page.close()
      throw error
    }
  }
}
