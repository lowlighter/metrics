// Imports
import { Processor, state } from "@processor"
import { optimize } from "y/svgo@3.0.2"

/** Processor */
export default class extends Processor {
  /** Import meta */
  static readonly meta = import.meta

  /** Name */
  readonly name = "🧹 Optimize SVG"

  /** Category */
  readonly category = "optimizer"

  /** Description */
  readonly description = "Optimize SVG to reduce file size and improve rendering speed"

  /** Supports */
  readonly supports = ["image/svg+xml"]

  /** Action */
  protected async action(state: state) {
    const result = await this.piped(state)
    const { data: optimized } = optimize(result.content, {
      plugins: [
        {
          name: "preset-default",
          params: {
            //Force CSS style consistency
            overrides: {
              inlineStyles: false,
              removeViewBox: false,
            },
          },
        },
        //Additional cleanup
        "cleanupListOfValues",
        "removeRasterImages",
        "removeScriptElement",
      ],
      multipass: true,
    })
    result.content = optimized
  }
}
