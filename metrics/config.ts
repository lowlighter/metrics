// Imports
import { is } from "@utils/validator.ts"
import { deepMerge } from "std/collections/deep_merge.ts"

//TODO(@lowlighter): some cleanup needed here and description to complete

/** Entities */
const entities = ["user", "organization", "repository"] as const

/** Default log level */
const loglevel = {
  presets: "warn",
  action: "warn",
  server: "trace",
} as const

/** Internal component config */
export const internal = is.object({
  logs: is.enum(["none", "error", "warn", "info", "message", "debug", "trace"]),
})

/** General component config */
export const component = internal.extend({
  id: is.string(),
  retries: is.object({
    attempts: is.coerce.number().min(1).max(100),
    delay: is.coerce.number().min(0).max(3600),
  }),
  fatal: is.coerce.boolean(),
})

/** Requests component config */
export const requests = internal.extend({
  mock: is.coerce.boolean(),
  api: is.coerce.string(),
  token: is.coerce.string(),
  timezone: is.coerce.string(),
})

/** Plugin component internal config (without processors, for recursive typing) */
const __plugin = component.merge(requests).extend({
  handle: is.coerce.string(),
  entity: is.enum(entities),
  template: is.coerce.string(),
  render: is.coerce.boolean(),
  args: is.record(is.coerce.string(), is.unknown()),
})

/** Processor component internal config */
const _processor = component.extend({
  args: is.record(is.coerce.string(), is.unknown()),
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
  args: is.record(is.coerce.string(), is.unknown()).default(() => ({})),
})

/** Processor component config */
export const processor = is.preprocess((value) => _preset_processor.passthrough().parse(value), _processor.omit({ parent: true }))

/** Plugin component internal config */
const _plugin = __plugin.extend({
  processors: is.array(processor),
})

/** Plugin NOP internal config */
const _plugin_nop = _plugin.omit({ id: true, retries: true, template: true, render: true, args: true })

/** Plugin component preset config */
const _preset_plugin = is.object({
  logs: _plugin.shape.logs.default(loglevel.presets),
  api: _plugin.shape.api.default("https://api.github.com"),
  token: _plugin.shape.token.default(""),
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
  args: is.record(is.coerce.string(), is.unknown()).default(() => ({})),
})

/** Plugin component config */
export const plugin = is.preprocess((value) => _preset_plugin.passthrough().parse(value), _plugin)

/** Plugin NOP config */
export const plugin_nop = is.preprocess((value) => _preset_plugin.passthrough().parse(value), _plugin_nop)

/** Preset component config */
const preset = is.object({
  plugins: _preset_plugin.default(() => _preset_plugin.parse({})),
  processors: _preset_processor.default(() => _preset_processor.parse({})),
})

/** Internal config */
const _config = is.object({
  plugins: is.array(is.union([plugin, plugin_nop])),
  presets: is.record(is.coerce.string(), preset),
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
  check_updates: is.boolean().default(false),
  config: config.default(() => ({})),
})

/** Server config */
export const server = internal.extend({
  logs: internal.shape.logs.default(loglevel.server),
  hostname: is.coerce.string().default("localhost"),
  port: is.coerce.number().min(1).max(65535).default(8080),
  config: config.default(() => ({})),
  users: is.object({
    allowed: is.union([is.literal("all"), is.array(is.coerce.string())]).default("all"),
  }).default(() => ({})),
  github_app: is.object({
    id: is.coerce.number(),
    private_key_path: is.coerce.string(),
    client_id: is.coerce.string(),
    client_secret: is.coerce.string(),
  }).nullable().optional(),
})

/** Web request config */
export const webrequest = is.object({
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
  ).default(() => []),
})
