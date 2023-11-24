// Imports
import { is, parse, Processor } from "@engine/components/processor.ts"
import { delay } from "std/async/delay.ts"

/** Processor */
export default class extends Processor {
  /** Import meta */
  static readonly meta = import.meta

  /** Name */
  readonly name = "⏰ Delay"

  /** Category */
  readonly category = "control"

  /** Description */
  readonly description = "Delay execution"

  /** Inputs */
  readonly inputs = is.object({
    duration: is.number().min(0).default(0).describe("Time to wait (in seconds)"),
  })

  /** Action */
  protected async action() {
    const { duration } = await parse(this.inputs, this.context.args)
    this.log.info(`waiting ${duration} seconds as requested`)
    await delay(duration * 1000)
    this.log.info("resuming")
  }
}
