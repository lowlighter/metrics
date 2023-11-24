// Imports
import { Processor, state } from "@engine/components/processor.ts"

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

  /** Action */
  protected async action(state: state) {
    const result = await this.piped(state)
    const { mime, base64 } = result
    this.log.raw(`Content-Type: ${mime}`)
    if (base64) {
      this.log.raw("%cNote: content is currently base64 encoded as it is binary data", "color:yellow")
    }
    this.log.raw(result.content)
  }
}
