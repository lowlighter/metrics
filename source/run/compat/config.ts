// Imports
import { Report, yaml } from "@run/compat/report.ts"
import { deepMerge } from "std/collections/deep_merge.ts"

/** Compatibility config */
export class Config {
  /** Config content */
  readonly content = {} as Record<PropertyKey, unknown>

  /** Report */
  readonly report = new Report()

  /** Is patched ? */
  patched = false

  /** Patch config */
  patch(inputs: string | string[], snippet: Record<PropertyKey, unknown> | null) {
    if (snippet) {
      this.report.warning(
        `${
          Array.isArray(inputs) ? `\`${[inputs.slice(0, -1).join(", "), inputs.slice(-1)].join(" and ")}\` are` : `\`${inputs}\` is`
        } deprecated, use the following configuration snippet instead:\n\`\`\`yaml\n${yaml(snippet)}\`\`\``,
      )
      Object.assign(this.content, deepMerge(this.content, snippet, { arrays: "merge" }))
    } else {
      this.report.error(`${Array.isArray(inputs) ? `\`${[inputs.slice(0, -1).join(", "), inputs.slice(-1)].join(" and ")}\` have` : `\`${inputs}\` has`} been removed`)
    }
    this.patched = true
  }
}
