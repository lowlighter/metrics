// Imports
import { Processor, state } from "@engine/components/processor.ts"
import { PurgeCSS } from "y/purgecss@5.0.0"
import { DOMParser } from "x/deno_dom@v0.1.38/deno-dom-wasm.ts"
import { Format } from "@utils/format.ts"
import { minify } from "y/csso@5.0.5"
import { unescape } from "y/html-escaper@3.0.3"

/** Processor */
export default class extends Processor {
  /** Import meta */
  static readonly meta = import.meta

  /** Name */
  readonly name = "🧹 Optimize CSS"

  /** Category */
  readonly category = "optimizer"

  /** Description */
  readonly description = "Optimize CSS by removing unused styles and minifying"

  /** Supports */
  readonly supports = ["application/xml", "image/svg+xml"]

  /** Action */
  protected async action(state: state) {
    const result = await this.piped(state)
    const document = new DOMParser().parseFromString(Format.html(result.content), "text/html")!
    for (const style of document.querySelectorAll('style[data-optimizable="true"]')) {
      this.log.trace("purging css")
      const raw = unescape(style.textContent)
      style.textContent = ""
      const purged = await new PurgeCSS().purge({ content: [{ raw: document.querySelector("main")!.innerHTML, extension: "html" }], css: [{ raw }] })
      this.log.trace("optimizing css")
      const optimized = minify(purged.map(({ css }) => css).join("\n")).css
      style.textContent = optimized
      ;(style as unknown as Element).removeAttribute("data-optimizable")
    }
    result.content = document.querySelector("main")!.innerHTML
  }
}
