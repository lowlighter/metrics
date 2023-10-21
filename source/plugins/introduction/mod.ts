// Imports
import { is, Plugin } from "@engine/components/plugin.ts"
import { parseHandle } from "@engine/utils/github.ts"

/** Plugin */
export default class extends Plugin {
  /** Import meta */
  static readonly meta = import.meta

  /** Name */
  readonly name = "🙋 Introduction"

  /** Category */
  readonly category = "github"

  /** Description */
  readonly description = "Displays user, organization or repository description"

  /** Supports */
  readonly supports = ["user", "organization", "repository"]

  /** Inputs */
  readonly inputs = is.object({})

  /** Outputs */
  readonly outputs = is.object({
    text: is.string().describe("Introduction text"),
  })

  /** Action */
  protected async action() {
    const { handle, entity } = this.context
    const { entity: { text } } = await this.graphql(entity, parseHandle(handle, { entity }))
    return { text }
  }
}
