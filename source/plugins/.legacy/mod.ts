// Imports
import { is, parse, Plugin } from "@engine/components/plugin.ts"
import { Logger } from "@engine/utils/log.ts"
import { command } from "@engine/utils/deno/command.ts"
import { throws } from "@engine/utils/errors.ts"
import { read } from "@engine/utils/deno/io.ts"
import { encodeBase64 } from "std/encoding/base64.ts"

/** v3.x official templates */
export const templates = ["classic", "repository", "terminal", "markdown"]

/** Plugin */
export default class extends Plugin {
  /** Import meta */
  static readonly meta = import.meta

  /** Name */
  readonly name = "🏛️ Legacy plugins execution"

  /** Category */
  readonly category = "legacy"

  /** Description */
  readonly description = "Executes plugins using metrics v3 docker image"

  /** Supports */
  readonly supports = ["user", "organization", "repository"]

  /** Inputs */
  readonly inputs = is.object({
    version: is.string().regex(/^v3\.[0-9]{1,2}$/).default("v3.34").describe("Metrics version (v3.x)"),
    inputs: is.record(is.string(), is.unknown()).default(() => ({})).describe("Plugin inputs (as described from respective `action.yml`). Some core options are not supported and will have no effect"),
  })

  /** Outputs */
  readonly outputs = is.object({
    content: is.string().describe("Rendered content (base64 encoded)"),
  })

  /** Permissions */
  readonly permissions = ["run:docker", "write:tmp", "read:tmp"]

  /** Action */
  protected async action() {
    const { handle } = this.context
    const { version, inputs } = await parse(this.inputs, this.context.args)

    // Prepare context
    const context = {
      fixed: {
        use_prebuilt_image: true,
        config_base64: true,
        output_action: "none",
        filename: "metrics.legacy",
        config_output: "svg",
      },
      inherited: {
        token: this.context.token.read(),
        user: handle?.split("/")[0],
        repo: handle?.split("/")[1],
        template: { legacy: "classic" }[this.context.template!] ?? this.context.template,
        config_timezone: this.context.timezone,
        retries: this.context.retries.attempts,
        retries_delay: this.context.retries.delay,
        plugins_errors_fatal: this.context.fatal,
        debug: Logger.channels[this.context.logs] >= Logger.channels.debug,
        use_mocked_data: this.context.mock,
        github_api_rest: this.context.api,
        github_api_graphql: this.context.api,
      },
      editable: [
        /^base(?:_|$)/,
        /^repositories(?:_|$)/,
        /^users_ignored$/,
        /^commits_authoring$/,
        /^markdown$/,
        /^optimize$/,
        /^setup_community_templates$/,
        /^query$/,
        /^extras_(?:css|js)$/,
        /^config_(?:order|twemoji|gemoji|octicon|display|animations|padding|presets)$/,
        /^delay$/,
        /^quota_required_(?:rest|graphql|search)$/,
        /^verify$/,
        /^debug_flags$/,
        /^experimental_features$/,
        /^plugin_\w+$/,
      ],
      inputs: {} as Record<PropertyKey, unknown>,
    }
    Object.assign(context.inputs, context.fixed, context.inherited)

    // Register user inputs
    for (const [key, value] of Object.entries(inputs)) {
      if (key in context.fixed) {
        this.log.warn(`ignoring ${key}: cannot be overriden in this context`)
        continue
      }
      if ((key in context.inherited) || (context.editable.some((regex) => regex.test(key)))) {
        this.log.trace(`registering: ${key}=${value}`)
        context.inputs[key] = value
        continue
      }
      this.log.warn(`ignoring ${key}: not supported in this context`)
    }
    if (context.inputs.template === "markdown") {
      context.inputs.config_output = "markdown"
    }

    // Execute docker image
    const tmp = await Deno.makeTempDir({ prefix: "metrics_legacy_" })
    try {
      const env = Object.fromEntries(Object.entries(context.inputs).map(([key, value]) => [`INPUT_${key.toLocaleUpperCase()}`, `${value ?? ""}`]))
      this.log.trace(env)
      const { success } = await command(`docker run --rm ${Object.keys(env).map((key) => `--env ${key}`).join(" ")} --volume=${tmp}:/renders ghcr.io/lowlighter/metrics:${version}`, {
        log: this.log,
        env,
      })
      if (!success) {
        throws("Failed to execute metrics")
      }
      let content = ""
      try {
        content = await read(`${tmp}/metrics.legacy`)
      } // TODO(@lowlighter): fix this ??
      catch (error) {
        console.error(error)
      }
      return { content: encodeBase64(content) }
    } finally {
      await Deno.remove(tmp, { recursive: true })
    }
  }
}
