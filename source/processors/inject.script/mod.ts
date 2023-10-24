// Imports
import { is, parse, Processor, state } from "@engine/components/processor.ts"
import { Browser } from "@engine/utils/browser.ts"
import { Format } from "@engine/utils/format.ts"

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

  /** Permissions */
  readonly permissions = ["run:chrome"]

  /** Inputs */
  readonly inputs = is.object({
    script: is.string().describe("JavaScript to inject and execute"),
  })

  /** Action */
  protected async action(state: state) {
    const result = await this.piped(state)
    const { script } = await parse(this.inputs, this.context.args)
    const page = await Browser.page({ log: this.log })
    try {
      this.log.trace("processing content in browser")
      await page.setContent(Format.html(result.content))
      await page.waitForNavigation({ waitUntil: "load" })
      this.log.trace(`injecting script: ${script}`)
      result.content = await page.evaluate(async (script: string) => {
        await new Function("document", `return (async () => { ${script} })()`)(document)
        return document.querySelector("main")!.innerHTML
      }, { args: [script] })
      await page.close()
    } catch (error) {
      await page.close()
      throw error
    }
  }
}
