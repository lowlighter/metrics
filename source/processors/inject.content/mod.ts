// Imports
import { is, parse, Processor, state } from "@engine/components/processor.ts"

/** Processor */
export default class extends Processor {
  /** Import meta */
  static readonly meta = import.meta

  /** Name */
  readonly name = "🔩 Inject raw content"

  /** Category */
  readonly category = "injector"

  /** Description */
  readonly description = "Inject custom raw content"

  /** Supports */
  readonly supports = ["application/xml"]

  /** Inputs */
  readonly inputs = is.object({
    content: is.string().describe("Content to inject (placeholder: `<div>foo</div>`) (textarea)"),
    mime: is.string().optional().describe("Resulting mime type (e.g. `application/xml`). Leave empty to reuse previous mime type"),
  })

  /** Action */
  protected async action(state: state) {
    const result = await this.piped(state)
    const { content, mime } = await parse(this.inputs, this.context.args)
    if (mime) {
      result.mime = mime
    }
    result.content = `${result.content}${content}`
  }
}
