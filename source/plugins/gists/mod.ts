// Imports
import { is, parse, Plugin, state } from "@engine/components/plugin.ts"

/** Plugin */
export default class extends Plugin {
  /** Import meta */
  static readonly meta = import.meta

  /** Name */
  readonly name = "🎫 Gists"

  /** Category */
  readonly category = "github"

  /** Supports */
  readonly supports = ["user"]

  /** Description */
  readonly description = "Displays [GitHub gists](https://gist.github.com)"

  /** Inputs */
  readonly inputs = is.object({
    forks: is.boolean().default(false).describe("Include forked gists"),
    visibility: is.union([
      is.literal("public").describe("Includes public gists only"),
      is.literal("all").describe("Includes public and private gists (n.b. still subject to token permissions)"),
    ]).default("public").describe("Gists visibility"),
  })

  /** Outputs */
  readonly outputs = is.object({
    count: is.number().int().min(0).describe("Total number of gists"),
    forked: is.number().int().min(0).describe("Total number of forked gists"),
    comments: is.number().int().min(0).describe("Total number of comments"),
    files: is.number().int().min(0).describe("Total number of files"),
    forks: is.number().int().min(0).describe("Total number of forks"),
    stargazers: is.number().int().min(0).describe("Total number of stargazers"),
  })

  /** Action */
  protected async action({ errors }: state) {
    const { handle } = this.context
    const { forks, visibility } = await parse(this.inputs, this.context.args)
    const { entity: { gists: { count, nodes: gists } } } = await this.graphql("gists", { login: handle, privacy: visibility.toLocaleUpperCase() }, { paginate: true })
    const result = { count, forked: 0, comments: 0, files: 0, forks: 0, stargazers: 0 }
    let missing = 0
    for (const gist of gists) {
      if (!gist) {
        missing++
        continue
      }
      if ((gist.forked) && (!forks)) {
        continue
      }
      result.forked += gist.forked ? 1 : 0
      result.stargazers += gist.stargazers
      result.forks += gist.forks.count
      result.comments += gist.comments.count
      result.files += gist.files.length
    }
    if (missing) {
      errors.push({ severity: "warning", source: this.id, message: `${missing} gists could not be correctly fetched.\nProvided token may not have sufficient permissions.` })
    }
    return result
  }
}
