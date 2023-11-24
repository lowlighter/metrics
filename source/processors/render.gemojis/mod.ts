// Imports
import { Processor, state } from "@engine/components/processor.ts"
// @ts-ignore: json import
import imported from "https://api.github.com/emojis" assert { type: "json" }
const gemojis = imported as Record<PropertyKey, string>

/** Processor */
export default class extends Processor {
  /** Import meta */
  static readonly meta = import.meta

  /** Name */
  readonly name = "🖋️ Render GitHub emojis"

  /** Category */
  readonly category = "renderer"

  /** Description */
  readonly description = "Render emojis supported by GitHub"

  /** Supports */
  readonly supports = ["application/xml", "image/svg+xml", "text/html"]

  /** Permissions */
  readonly permissions = ["net:api.github.com/emojis"]

  /** Action */
  protected async action(state: state) {
    const result = await this.piped(state)
    result.content = result.content.replaceAll(/:(?<emoji>[-\w+]+):/g, (match, emoji) => {
      if (!(emoji in gemojis)) {
        return match
      }
      return `<img class="gemoji" src="${gemojis[emoji]}" alt="${emoji}" />`
    })
  }
}
