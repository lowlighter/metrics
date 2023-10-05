// Imports
import { is, Processor, state } from "@processor"
import { Browser } from "@utils/browser.ts"
import { Format } from "@utils/format.ts"

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

  /** Inputs */
  readonly inputs = is.object({
    style: is.string().describe("CSS to inject"),
  })

  /** Action */
  protected async action(state: state) {
    const result = await this.piped(state)
    const { style } = await this.inputs.parseAsync(this.context.args)
    const page = await Browser.newPage()
    try {
      this.log.trace("processing content in browser")
      await page.setContent(Format.html(result.content), { waitUntil: ["load", "domcontentloaded"] })
      const scope = `inject-style-${crypto.randomUUID().slice(-12)}`
      this.log.trace(`injecting style: ${style}`)
      result.content = await page.evaluate(
        (scope: string, style: string) => {
          // List CSS rules
          const virtual = document.implementation.createHTMLDocument(""), tag = document.createElement("style")
          tag.textContent = style
          virtual.body.appendChild(tag)
          let styled = ""
          for (const { selectorText: selectors, cssText: rule } of Object.values(tag.sheet!.cssRules) as CSSStyleRule[]) {
            const parsed = selectors.split(",").map((selector: string) => selector.trim()) as string[]
            styled += rule.replace(selectors, parsed.flatMap((selector) => [`[${scope}]${selector}`, `[${scope}] ${selector}`]).join(","))
          }
          tag.textContent = styled
          // Inject CSS
          const main = document.querySelector("main")!
          main.appendChild(tag)
          document.querySelectorAll("main > *:not(style)").forEach((element) => element.setAttribute(scope, "true"))
          return main.innerHTML
        },
        scope,
        style,
      )
      await page.close()
    } catch (error) {
      await page.close()
      throw error
    }
  }
}
