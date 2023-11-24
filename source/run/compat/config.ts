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

  /** Patch config with legacy plugin support */
  compat(inputs: Record<PropertyKey, unknown>, keys: string[]) {
    const plugin = keys.find((key) => /^plugin_[a-z0-9]+$/.test(key))?.replace(/^plugin_/, "")
    if (plugin) {
      this.report.unimplemented(`\`${plugin}\` plugin has not been migrated to v4 yet`)
    }
    this.patch(keys, {
      config: {
        plugins: [{
          ".legacy": {
            inputs: Object.fromEntries(
              Object.entries(inputs).filter(([key]) => /^(?:(?:repositories(?:_(?:batch|forks|affiliations|skipped))?)|users_ignored|commits_authoring)$/.test(key) || keys.includes(key)),
            ),
          },
        }],
      },
    })
  }
}
