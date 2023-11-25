// Imports
import { Processor, state } from "@engine/components/processor.ts"
import { default as octicons, IconName } from "y/@primer/octicons@19.7.0?pin=v133"

/** Processor */
export default class extends Processor {
  /** Import meta */
  static readonly meta = import.meta

  /** Name */
  readonly name = "🖋️ Render GitHub octicons"

  /** Category */
  readonly category = "renderer"

  /** Description */
  readonly description = "Render [GitHub Octicons](https://primer.style/design/foundations/icons)"

  /** Supports */
  readonly supports = ["application/xml", "image/svg+xml", "text/html"]

  /** Action */
  protected async action(state: state) {
    const result = await this.piped(state)
    result.content = result.content.replaceAll(/:octicon-(?<icon>\w(?:[-\w]+?\w))(?:-(?<size>\d+))?:/g, (match, icon, size) => {
      if (!(icon in octicons)) {
        return match
      }
      const octicon = octicons[icon as IconName]
      if (!(size in octicon.heights)) {
        size = Number(Object.keys(octicon.heights).at(0))
      }
      return octicon.toSVG({ height: size, width: size }).replace(/^<svg /, '<svg class="octicon" ')
    })
  }
}
