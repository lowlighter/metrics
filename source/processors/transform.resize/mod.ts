// Imports
import { is, parse, Processor, state } from "@engine/components/processor.ts"
import { DOMParser } from "x/deno_dom@v0.1.38/deno-dom-wasm.ts"
import { Format } from "@engine/utils/format.ts"

/** Processor */
export default class extends Processor {
  /** Import meta */
  static readonly meta = import.meta

  /** Name */
  readonly name = "🏭 Resize SVG image"

  /** Category */
  readonly category = "transformer"

  /** Description */
  readonly description = "Resize SVG image"

  /** Supports */
  readonly supports = ["image/svg+xml"]

  /** Inputs */
  readonly inputs = is.object({
    width: is.number().positive().nullable().default(null).describe("Width (in pixels). Set to `null` to leave unchanged"),
    height: is.number().positive().nullable().default(null).describe("Height (in pixels). Set to `null` to leave unchanged"),
  })

  /** Action */
  protected async action(state: state) {
    const result = await this.piped(state)
    const { height, width } = await parse(this.inputs, this.context.args)
    const document = new DOMParser().parseFromString(Format.html(result.content), "text/html")!
    const svg = document.querySelector("svg")!
    if (width) {
      svg.setAttribute("width", `${height}`)
    }
    if (height) {
      svg.setAttribute("height", `${width}`)
    }
    result.content = document.querySelector("main")!.innerHTML
  }
}
