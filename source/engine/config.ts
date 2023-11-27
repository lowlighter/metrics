// Imports
import { is } from "@engine/utils/validation.ts"
import { deepMerge } from "std/collections/deep_merge.ts"
import { Secret } from "@engine/utils/secret.ts"
import { read } from "@engine/utils/deno/io.ts"
import { env } from "@engine/utils/deno/env.ts"
import * as YAML from "std/yaml/parse.ts"
import { Logger } from "@engine/utils/log.ts"
import { throws } from "@engine/utils/errors.ts"
import { filterKeys } from "std/collections/filter_keys.ts"

/** Timezones */
const timezones = [...Intl.supportedValuesOf("timeZone"), "UTC"]

/** Default log levels */
const loglevel = "trace"

/** Secret */
export const secret = is.union([is.unknown(), is.instanceof(Secret)]).transform((value) => value instanceof Secret ? value : new Secret(value))

/** Internal component config */
export const internal = is.object({
  logs: is.union([
    is.literal("none").describe("Disable logs"),
    is.literal("error").describe("Display error logs"),
    is.literal("warn").describe("Display warning logs and higher"),
    is.literal("info").describe("Display information logs and higher"),
    is.literal("message").describe("Display message logs and higher"),
    is.literal("debug").describe("Display debug logs and higher"),
    is.literal("trace").describe("Display trace logs and higher"),
  ]).describe("Log level"),
})

/** General component config */
export const component = internal.extend({
  id: is.string().min(1).describe("Component identifier"),
  args: is.record(is.string(), is.unknown()).describe("Component arguments"),
  retries: is.object({
    attempts: is.number().int().positive().describe("Number of retries attempts"),
    delay: is.number().min(0).describe("Delay between each retry attempts (in seconds)"),
  }).describe("Retry policy"),
  fatal: is.boolean().describe("Whether to stop on errors"),
})

/** Requests component config */
export const requests = internal.extend({
  mock: is.boolean().describe("Whether to use mocked data instead"),
  api: is.string().url().describe("GitHub API endpoint"),
  token: secret.describe("GitHub token"),
  timezone: is.string().min(1).refine((value) => timezones.includes(value)).describe("Timezone for dates"),
})

/** Plugin component internal config (without processors, to allow recursive typing within processor typing) */
const _plugin_without_processors = component.merge(requests).extend({
  handle: is.string().min(1).nullable().describe("GitHub handle (e.g. `octocat`)"),
  entity: is.union([
    is.literal("user").describe("GitHub user"),
    is.literal("organization").describe("GitHub organization"),
    is.literal("repository").describe("GitHub repository"),
  ]).describe("GitHub entity type"),
  template: is.string().min(1).nullable().describe("Template name or url. Set to `null` to skip rendering (placeholder: `classic`)"),
})

/** Processor component internal config */
const _processor = component.extend({ parent: _plugin_without_processors })

/** Processor component internal config (without parent) */
const _processor_without_parent = _processor.omit({ parent: true })

/** Processor component preset config */
const _preset_processor = is.object({
  args: _processor.shape.args.default(() => ({})),
  logs: _processor.shape.logs.default(loglevel),
  fatal: _processor.shape.fatal.default(false),
  retries: is.object({
    attempts: _processor.shape.retries.shape.attempts.default(1),
    delay: _processor.shape.retries.shape.delay.default(120),
  }).default(() => ({})),
})

/** List of processor allowed keys */
const _processor_keys = [...Object.keys(_preset_processor.parse({}))]

/** Processor component config */
export const processor = is.preprocess((value) => {
  const result = _preset_processor.extend({ id: _processor.shape.id, preset: is.string().optional() }).strict().safeParse(sugar(value, "processor"))
  if (!result.success) {
    return value
  }
  delete result.data.preset
  return result.data
}, _processor_without_parent.strict()) as unknown as is.ZodObject<typeof _processor_without_parent["shape"]>

/** Plugin component internal config */
const _plugin = _plugin_without_processors.extend({
  processors: is.array(processor).describe("Post-processors"),
})

/** Plugin component preset config */
const _preset_plugin = is.object({
  args: _plugin.shape.args.default(() => ({})),
  logs: _plugin.shape.logs.default(loglevel),
  api: _plugin.shape.api.default("https://api.github.com"),
  token: _plugin.shape.token.default(() => env.get("METRICS_GITHUB_TOKEN")).describe("GitHub token (placeholder: `METRICS_GITHUB_TOKEN`)"),
  handle: _plugin.shape.handle.default(null),
  entity: _plugin.shape.entity.default("user"),
  template: _plugin.shape.template.default("classic"),
  timezone: _plugin.shape.timezone.default(() => Intl.DateTimeFormat().resolvedOptions().timeZone),
  mock: _plugin.shape.mock.default(false),
  processors: is.array(_processor_without_parent.deepPartial()).default(() => []), // _plugin.shape shouldn't be used here to avoid populating default values
  fatal: _plugin.shape.fatal.default(false),
  retries: is.object({
    attempts: _plugin.shape.retries.shape.attempts.default(3),
    delay: _plugin.shape.retries.shape.delay.default(120),
  }).default(() => ({})),
})

/** List of plugin allowed keys */
const _plugin_keys = [...Object.keys(_preset_plugin.parse({}))]

/** Nameless plugin */
export const plugin_nameless = ".await"

/** Plugin component config */
export const plugin = is.preprocess((value) => {
  const result = _preset_plugin.omit({ processors: true }).extend({
    id: _plugin.shape.id.default(plugin_nameless),
    processors: is.array(is.unknown()).default(() => []),
    preset: is.string().optional(),
  }).strict().safeParse(
    sugar(value, "plugin"),
  )
  if (!result.success) {
    return value
  }
  delete result.data.preset
  return result.data
}, _plugin) as unknown as is.ZodObject<typeof _plugin["shape"]>

/** Preset component config */
export const preset = is.object({
  plugins: _preset_plugin.default(() => _preset_plugin.parse({})).describe("Default settings for plugins"),
  processors: _preset_processor.default(() => _preset_processor.parse({})).describe("Default settings for processors"),
})

/** Internal config */
const _config = is.object({
  plugins: is.array(plugin).describe("Plugins"),
  presets: is.record(is.string(), preset).describe("Preset settings"),
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
        ).optional(),
      }).passthrough(),
    ).default(() => []),
    presets: is.record(is.string(), is.record(is.string(), is.unknown())).default(() => ({})),
  }).passthrough().parse(_value)
  if (!value.presets.default) {
    value.presets.default = preset.parse({})
  }
  for (const plugin of value.plugins) {
    Object.assign(plugin, merge(value.presets.default.plugins, value.presets[plugin.preset!]?.plugins, plugin))
    plugin.processors ??= []
    for (const processor of plugin.processors) {
      Object.assign(processor, merge(value.presets.default.processors, value.presets[plugin.preset!]?.processors, value.presets[processor.preset!]?.processors, processor))
    }
  }
  return value
}, _config) as unknown as is.ZodObject<typeof _config["shape"]>

/** CLI config */
export const cli = internal.extend({
  logs: internal.shape.logs.default(loglevel),
  check_updates: is.boolean().default(false).describe("Whether to check for updates on startup"),
  config: config.default(() => ({} as is.infer<typeof config>)).describe("Metrics configuration"),
})

/** Server config */
export const server = cli.extend({
  hostname: is.string().min(1).default("localhost").describe("Server hostname"),
  port: is.number().int().min(1).max(65535).default(8080).describe("Server port"),
  control: is.record(
    is.string(),
    is.object({
      stop: is.boolean().default(false).describe("Permission to stop the server via `POST /metrics/stop`"),
    }),
  ).nullable().default(null).describe("Control profiles (each profile is designed by a token bearer and dictionary of allowed routes)"),
  cache: is.number().int().positive().nullable().default(null).describe("Cache duration for processed requests (in seconds)"),
  limit: is.object({
    guests: is.object({
      max: is.number().int().min(0).nullable().default(null).describe("Maximum number of guests"),
      requests: is.object({
        limit: is.number().int().positive().default(60).describe("Maximum number of requests per window duration per guest"),
        duration: is.number().positive().default(60).describe("Window duration (in seconds)"),
        ignore_mocked: is.boolean().default(true).describe("Whether to ignore mocked requests from rate limit"),
      }).nullable().default(null).describe("Rate limit for guests"),
    }).nullable().default(null).describe("Guests limitations"),
    users: is.object({
      max: is.number().int().min(0).nullable().default(null).describe("Maximum number of logged users"),
      requests: is.object({
        limit: is.number().int().positive().default(60).describe("Maximum number of requests per window duration per logged user"),
        duration: is.number().positive().default(60).describe("Window duration (in seconds)"),
        ignore_mocked: is.boolean().default(true).describe("Whether to ignore mocked requests from rate limit"),
      }).nullable().default(null).describe("Rate limit for logged users"),
    }).nullable().default(null).describe("Logged users limitations"),
  }).default(() => ({})),
  github_app: is.object({
    id: is.number().int().positive().describe("GitHub app identifier"),
    private_key_path: is.string().describe("Path to GitHub app private key file (must be in PKCS#8 format) (placeholder: `.secrets/github-app-private-key-pk8s.pem`)"),
    client_id: is.string().describe("GitHub app client identifier (placeholder: `Iv1.c533685fd0d2d002`)"),
    client_secret: secret.default(() => env.get("METRICS_GITHUB_APP_SECRET")).describe("GitHub app client secret (placeholder: `METRICS_GITHUB_APP_SECRET`)"),
  }).nullable().default(null).describe("GitHub app settings"),
})

/** Web request config */
export const webrequest = is.object({
  mock: is.boolean().default(false).describe("Whether to use mocked data"),
  plugins: is.array(
    is.preprocess(
      (value) => sugar(value, "plugin"),
      _plugin.pick({
        id: true,
        timezone: true,
        handle: true,
        fatal: true,
        entity: true,
        template: true,
        args: true,
      }).partial().extend({
        preset: is.string().optional(),
        processors: is.array(
          is.preprocess(
            (value) => sugar(value, "processor"),
            _processor.pick({
              id: true,
              fatal: true,
              args: true,
            }).partial().extend({ preset: is.string().optional() }),
          ),
        ).default(() => []).describe("Post-processors"),
      }),
    ),
  ).default(() => []).describe("Plugins"),
})

/** Merge deeply objects */
function merge(...objects: unknown[]) {
  let result = {} as Record<PropertyKey, unknown>
  for (const object of objects) {
    result = deepMerge(result, (object ?? {}) as Record<PropertyKey, unknown>, { arrays: "replace" })
  }
  return result
}

/** Syntaxic sugar for components that allows the use of one extra dictionnary as identifier and args */
export function sugar(value: unknown, _keys: "processor" | "plugin") {
  const keys = Array.isArray(_keys) ? _keys : { processor: _processor_keys, plugin: _plugin_keys }[_keys]
  if ((!value) || (typeof value !== "object") || ("id" in value)) {
    return value
  }
  const record = { ...value } as Record<PropertyKey, unknown>
  if ((record.args) && (typeof record.args === "object") && (Object.keys(record.args).length)) {
    return value
  }
  const [id, ...extras] = Object.keys(filterKeys(record, (key) => !keys.includes(key)))
  if (extras.length) {
    return { id: "", ...value }
  }
  if (id === undefined) {
    return value
  }
  const args = record[id] ?? {}
  delete record[id]
  return Object.assign(record, { id, args })
}

/** Load config */
export async function load(path = "metrics.config.yml") {
  const log = new Logger(import.meta)
  const config = {} as Record<PropertyKey, unknown>
  try {
    const parsed = await YAML.parse(await read(path))
    if (typeof parsed !== "object") {
      throws("Expected configuration to be a dictionary")
    }
    Object.assign(config, parsed)
  } catch (error) {
    if ((globalThis.Deno) && ((error instanceof Deno.errors.NotFound) || (error instanceof Deno.errors.PermissionDenied))) {
      log.warn(`${path} not found or not readable, using default configuration`)
    } else {
      throw error
    }
  }
  return config
}
