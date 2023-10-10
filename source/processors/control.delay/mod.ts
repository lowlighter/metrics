// Imports
import { is, Processor } from "@processor"
import { delay } from "std/async/delay.ts"

/** Processor */
export default class extends Processor {
  /** Import meta */
  static readonly meta = import.meta

  /** Name */
  readonly name = "⏱️ Delay"

  /** Category */
  readonly category = "control"

  /** Description */
  readonly description = "Delay execution"

  /** Inputs */
  readonly inputs = is.object({
    duration: is.number().min(0).describe("Time to wait (in seconds)"),
  })

  /** Action */
  protected async action() {
    const { duration } = await this.inputs.parseAsync(this.context.args)
    this.log.info(`waiting ${duration} seconds`)
    await delay(duration * 1000)
    this.log.info("resuming")
  }
}
