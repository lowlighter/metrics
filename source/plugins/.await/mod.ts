// Imports
import { is, Plugin } from "@engine/components/plugin.ts"

/** Plugin */
export default class extends Plugin {
  /** Import meta */
  static readonly meta = import.meta

  /** Name */
  readonly name = "🚥 Await other plugins execution"

  /** Category */
  readonly category = "control"

  /** Description */
  readonly description = "Await for all previous pending plugins to complete before continuing execution"

  /** Inputs */
  readonly inputs = is.object({})

  /** Outputs */
  readonly outputs = is.object({})

  /** Action */
  protected action() {
    this.context.template = null
    return Promise.resolve({})
  }
}
