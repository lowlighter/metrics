// Imports
import { Processor, state } from "@processor"

/** Processor */
export default class extends Processor {
  /** Import meta */
  static readonly meta = import.meta

  /** Name */
  readonly name = "📮 Publish to console"

  /** Category */
  readonly category = "publisher"

  /** Description */
  readonly description = "Write content to console"

  /** Supports */
  readonly supports = ["application/xml", "image/svg+xml", "image/png", "image/jpeg", "image/webp", "application/json", "text/html", "application/pdf", "text/plain"]

  /** Action */
  protected async action(state: state) {
    const result = await this.piped(state)
    const { mime, base64 } = result
    console.log(`Content-Type: ${mime}`)
    if (base64) {
      console.log("%cNote: content is currently base64 encoded as it is binary data", "color:yellow")
    }
    console.log(result.content)
  }
}
