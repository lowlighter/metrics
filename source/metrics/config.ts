// Imports
import { is } from "@utils/validator.ts"
import { deepMerge } from "std/collections/deep_merge.ts"
import { Secret } from "@utils/secret.ts"
import { env } from "@utils/io.ts"

//TODO(@lowlighter): some cleanup needed here and description to complete

/** Entities */
const entities = ["user", "organization", "repository"] as const

/** Default log level */
const loglevel = {
  presets: "warn",
  action: "warn",
  server: "trace",
} as const

/** Secret */
const secret = is.preprocess((value) => value instanceof Secret ? value : new Secret(value), is.instanceof(Secret))

/** Internal component config */
export const internal = is.object({
  logs: is.enum(["none", "error", "warn", "info", "message", "debug", "trace"]).describe("Log level"),
})

/** General component config */
export const component = internal.extend({
  id: is.string().describe("Component identifier"),
  retries: is.object({
    attempts: is.number().int().positive().describe("Number of attempts"),
    delay: is.number().positive().describe("Delay between attempts (in seconds)"),
  }).describe("Retry policy"),
  fatal: is.boolean().describe("Whether to stop on error"),
})

/** Requests component config */
export const requests = internal.extend({
  mock: is.boolean().describe("Whether to use mocked data"),
  api: is.string().url().describe("GitHub API endpoint"),
  token: secret.describe("GitHub token"),
  timezone: is.string().describe("Timezone"),
})

/** Plugin component internal config (without processors, for recursive typing) */
const __plugin = component.merge(requests).extend({
  handle: is.coerce.string().describe("Entity handle"),
  entity: is.enum(entities).describe("Entity type"),
  template: is.coerce.string().describe("Template name"),
  render: is.boolean().describe("Whether to render template"),
  args: is.record(is.string(), is.unknown()).describe("Plugin arguments"),
})

/** Processor component internal config */
const _processor = component.extend({
  args: is.record(is.string(), is.unknown()).describe("Processor arguments"),
  parent: __plugin,
})

/** Processor component preset config */
const _preset_processor = is.object({
  logs: _processor.shape.logs.default(loglevel.presets),
  fatal: _processor.shape.fatal.default(false),
  retries: is.object({
    attempts: _processor.shape.retries.shape.attempts.default(1),
    delay: _processor.shape.retries.shape.delay.default(120),
  }).default(() => ({})),
  args: _processor.shape.args.default(() => ({})),
})

/** Processor component config */
export const processor = is.preprocess((value) => _preset_processor.passthrough().parse(value), _processor.omit({ parent: true }))

/** Plugin component internal config */
const _plugin = __plugin.extend({
  processors: is.array(processor).describe("Processors"),
})

/** Plugin NOP internal config */
const _plugin_nop = _plugin.omit({ id: true, retries: true, template: true, render: true, args: true })

/** Plugin component preset config */
const _preset_plugin = is.object({
  logs: _plugin.shape.logs.default(loglevel.presets),
  api: _plugin.shape.api.default("https://api.github.com"),
  token: _plugin.shape.token.default(env.get("METRICS_GITHUB_TOKEN") ?? ""),
  handle: _plugin.shape.handle.default(""),
  entity: _plugin.shape.entity.default("user"),
  template: _plugin.shape.template.default("classic"),
  timezone: _plugin.shape.timezone.default(() => Intl.DateTimeFormat().resolvedOptions().timeZone),
  mock: _plugin.shape.mock.default(false),
  processors: _plugin.shape.processors.default(() => []),
  fatal: _plugin.shape.fatal.default(false),
  render: _plugin.shape.render.default(true),
  retries: is.object({
    attempts: _plugin.shape.retries.shape.attempts.default(3),
    delay: _plugin.shape.retries.shape.delay.default(120),
  }).default(() => ({})),
  args: _plugin.shape.args.default(() => ({})),
})

/** Plugin component config */
export const plugin = is.preprocess((value) => _preset_plugin.passthrough().parse(value), _plugin)

/** Plugin NOP config */
export const plugin_nop = is.preprocess((value) => _preset_plugin.passthrough().parse(value), _plugin_nop)

/** Preset component config */
const preset = is.object({
  plugins: _preset_plugin.default(() => _preset_plugin.parse({})).describe("Default settings for plugins using this preset"),
  processors: _preset_processor.default(() => _preset_processor.parse({})).describe("Default settings for processors using this preset"),
})

/** Internal config */
const _config = is.object({
  plugins: is.array(is.union([plugin, plugin_nop])).describe("Plugins"),
  presets: is.record(is.string(), preset).describe("Presets settings"),
})

/** Config */
export const config = is.preprocess((_value) => {
  const value = is.object({
    plugins: is.array(
      is.object({
        preset: is.string().optional(),
        processors: is.array(
          is.object({
            preset: is.string().optional(),
          }).passthrough(),
        ).default(() => []),
      }).passthrough(),
    ).default(() => []),
    presets: _config.shape.presets.default(() => ({ default: preset.parse({}) })),
  }).passthrough().parse(_value)
  for (const plugin of value.plugins) {
    Object.assign(plugin, deepMerge(value.presets[plugin.preset ?? "default"]?.plugins ?? {}, plugin, { arrays: "replace" }))
    for (const processor of plugin.processors) {
      Object.assign(processor, deepMerge(value.presets[processor.preset ?? plugin.preset ?? "default"]?.processors ?? {}, processor, { arrays: "replace" }))
    }
  }
  return value
}, _config)

/** Action config */
export const action = internal.merge(requests).extend({
  logs: internal.shape.logs.default(loglevel.action),
  check_updates: is.boolean().default(false).describe("Whether to check for updates"),
  config: config.default(() => ({})).describe("Configuration"),
})

/** Server config */
export const server = internal.extend({
  logs: internal.shape.logs.default(loglevel.server),
  hostname: is.string().default("localhost").describe("Server hostname"),
  port: is.number().int().min(1).max(65535).default(8080).describe("Server port"),
  config: config.default(() => ({})).describe("Configuration"),
  limit: is.object({
    guests: is.object({
      max: is.number().int().min(0).optional().describe("Maximum number of guests"),
      requests: is.object({
        limit: is.number().int().positive().default(60).describe("Maximum number of requests per window duration per guest"),
        duration: is.number().positive().default(60).describe("Window duration (in seconds)"),
        ignore_mocked: is.boolean().default(true).describe("Whether to ignore mocked requests from rate limit"),
      }).optional().describe("Rate limit for guests"),
    }).optional().describe("Guests limitations"),
    users: is.object({
      max: is.number().int().min(0).optional().describe("Maximum number of logged users"),
      requests: is.object({
        limit: is.number().int().positive().default(60).describe("Maximum number of requests per window duration per logged user"),
        duration: is.number().positive().default(60).describe("Window duration (in seconds)"),
        ignore_mocked: is.boolean().default(true).describe("Whether to ignore mocked requests from rate limit"),
      }).optional().describe("Rate limit for logged users"),
    }).optional().describe("Logged users limitations"),
  }).default(() => ({})),
  cache: is.number().int().positive().optional().describe("Cache duration for processed requests (in seconds)"),
  github_app: is.object({
    id: is.number().int().positive().describe("GitHub app identifier"),
    private_key_path: is.string().describe("Path to GitHub app private key file (must be in PKCS#8 format)"),
    client_id: is.string().describe("GitHub app client identifier"),
    client_secret: secret.default(env.get("METRICS_GITHUB_APP_SECRET") ?? "").describe("GitHub app client secret"),
  }).optional().describe("GitHub app settings"),
  control: is.record(is.string(), is.array(is.enum(["stop"]))).default(() => ({})).describe("Control profiles. Each profile is designed by a token bearer and a list of allowed routes"),
})

/** Web request config */
export const webrequest = is.object({
  mock: is.boolean().default(false).describe("Whether to use mocked data"),
  plugins: is.array(
    _plugin.pick({
      id: true,
      timezone: true,
      handle: true,
      fatal: true,
      entity: true,
      template: true,
      args: true,
      preset: true,
    })
      .extend({
        processors: is.array(_processor.pick({ id: true, fatal: true, args: true }).partial().extend({ id: _plugin.shape.id })),
      }).partial(),
  ).default(() => []).describe("Plugins"),
})
