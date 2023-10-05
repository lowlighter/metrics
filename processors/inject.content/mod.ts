// Imports
import { is, Processor, state } from "@processor"

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
    content: is.string().describe("Content to inject"),
  })

  /** Action */
  protected async action(state: state) {
    const result = await this.piped(state)
    const { content } = await this.inputs.parseAsync(this.context.args)
    result.content = `${result.content}${content}`
  }
}
