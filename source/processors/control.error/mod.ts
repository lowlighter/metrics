// Imports
import { is, parse, Processor } from "@engine/components/processor.ts"
import { throws } from "@engine/utils/errors.ts"

/** Processor */
export default class extends Processor {
  /** Import meta */
  static readonly meta = import.meta

  /** Name */
  readonly name = "🚩 Throw an error"

  /** Category */
  readonly category = "control"

  /** Description */
  readonly description = "Throw an error"

  /** Inputs */
  readonly inputs = is.object({
    message: is.string().default('Error thrown by "control.error"').describe("Error message"),
  })

  /** Action */
  protected async action() {
    const { message } = await parse(this.inputs, this.context.args)
    throws(message, { unrecoverable: true })
  }
}
