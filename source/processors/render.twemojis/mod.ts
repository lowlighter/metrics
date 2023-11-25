// Imports
import { Processor, state } from "@engine/components/processor.ts"
import { parse } from "y/@twemoji/parser@14.1.0?pin=v133"

/** Processor */
export default class extends Processor {
  /** Import meta */
  static readonly meta = import.meta

  /** Name */
  readonly name = "🖋️ Render Twemojis"

  /** Category */
  readonly category = "renderer"

  /** Description */
  readonly description = "Render emojis as [Twemojis](https://twemoji.twitter.com)"

  /** Supports */
  readonly supports = ["application/xml", "image/svg+xml", "text/html"]

  /** Permissions */
  readonly permissions = ["net:cdn.jsdelivr.net/gh/jdecked/twemoji@latest/assets"]

  /** Does this processor needs to perform requests ? */
  protected requesting = true

  /** Action */
  protected async action(state: state) {
    const result = await this.piped(state)
    const twemojis = new Map<string, string>(parse(result.content).map(({ text: emoji, url }: { text: string; url: string }) => [emoji, url]))
    for (const [emoji, url] of twemojis) {
      const svg = await this.requests.fetch(url, { type: "text" })
      twemojis.set(emoji, svg.replace(/^<svg /, '<svg class="twemoji" '))
    }
    for (const [emoji, svg] of twemojis) {
      result.content = result.content.replace(new RegExp(emoji, "g"), svg)
    }
  }
}
