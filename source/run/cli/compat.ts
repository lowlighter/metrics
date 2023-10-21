// deno-lint-ignore-file no-explicit-any
//import { env } from "@engine/utils/io.ts"
import core from "y/@actions/core@1.10.1"
import * as YAML from "std/yaml/mod.ts"
import { brightRed as r, cyan, gray, white, yellow } from "std/fmt/colors.ts"
type compat = any

function deprecated(input: string, replacement: Record<string, unknown> | null) {
  if (replacement === null) {
    core.warn(`${r(input)} is not supported anymore`)
  } else {
    core.warn(`${r(input)} is deprecated, use the following configuration snippet instead:\n\n${yaml({ config: replacement })}`)
  }
}

function yaml(content: Record<string, unknown>) {
  const regex = {
    kv: /^(?<indent>\s*)(?<array>\-\s+)?'?(?<key>\w[.\w-]*)'?(?:(?<kv>:)(?<value>\s.+)?)?$/,
  }
  const lines = []
  for (const line of YAML.stringify(content).split("\n")) {
    if (regex.kv.test(line)) {
      let { indent, array = "", kv, key, value } = line.match(regex.kv)!.groups!
      let color = white
      if (!kv) {
        value = key
      }
      value = value?.trim()
      switch (true) {
        case ["null"].includes(value):
          color = gray
          break
        case ["{}", "[]", "true", "false"].includes(value):
          color = yellow
          break
        case !Number.isNaN(Number(value)):
          color = yellow
          break
        case /^'.+'$/.test(value):
          value = value.replace(/^'|'$/g, "")
          color = yellow
          break
      }
      lines.push(`${indent}${array}${kv ? `${cyan(key)}: ${color(value ?? "")}` : color(value ?? "")}`)
      continue
    }
    lines.push(line)
  }
  return lines.join("\n")
}

export function compat(inputs: compat) {
  const config = { plugins: [] } as compat

  // 🙋 Introduction
  if (inputs.plugin_introduction) {
    const plugin = { introduction: {} } as compat
    if (!inputs.plugin_introduction_title) {
      plugin.processors = [{ "inject.style": { style: ".introduction .title { display: none }" } }]
    }
    config.plugins.push(plugin)
    deprecated("plugin_introduction", { plugins: [plugin] })
  }

  // 📅 Isometric commit calendar
  if (inputs.plugin_isocalendar) {
    const plugin = { calendar: { view: "isometric" } } as compat
    plugin.calendar.duration = { "half-year": "last-180-days", "full-year": "last-365-days" }[inputs.plugin_isocalendar_duration as string] ?? "last-180-days"
    if (inputs.debug_flags.find((f: string) => ["--halloween", "--winter"].includes(f))) {
      plugin.calendar.colors = inputs.debug_flags.find((f: string) => ["--halloween", "--winter"].includes(f)).replace("--", "")
    }
    config.plugins.push(plugin)
    deprecated("plugin_isocalendar", { plugins: [plugin] })
  }

  // 📅 Commit calendar
  if (inputs.plugin_calendar) {
    const plugin = { calendar: { view: "top-down" } } as compat
    switch (true) {
      case inputs.plugin_calendar_limit === 0:
        plugin.calendar.range = { from: "registration", to: "current-year" }
        break
      case inputs.plugin_calendar_limit > 0:
        plugin.calendar.range = { from: -inputs.plugin_calendar_limit, to: "current-year" }
        break
      case inputs.plugin_calendar_limit < 0:
        //TODO(@lowlighter): from = registration - n
        plugin.calendar.range = { from: -inputs.plugin_calendar_limit, to: "current-year" }
        break
    }
    if (inputs.debug_flags.find((f: string) => ["--halloween", "--winter"].includes(f))) {
      plugin.calendar.colors = inputs.debug_flags.find((f: string) => ["--halloween", "--winter"].includes(f)).replace("--", "")
    }
    config.plugins.push(plugin)
    deprecated("plugin_calendar", { plugins: [plugin] })
  }

  // 🎫 Gists
  if (inputs.plugin_gists) {
    const plugin = { gists: {} } as compat
    config.plugins.push(plugin)
    deprecated("plugin_gists", { plugins: [plugin] })
  }

  // 🗼 Rss feed
  if (inputs.plugin_rss) {
    const plugin = { rss: {} } as compat
    plugin.rss.feed = inputs.plugin_rss_source
    plugin.rss.limit = (inputs.plugin_rss_limit > 0) ? inputs.plugin_rss_limit : null
    config.plugins.push(plugin)
    deprecated("plugin_rss", { plugins: [plugin] })
  }

  // 📸 Website screenshot
  if (inputs.plugin_screenshot) {
    const plugin = { webscraping: {} } as compat
    plugin.webscraping.url = inputs.plugin_screenshot_url
    plugin.webscraping.select = inputs.plugin_screenshot_selector
    plugin.webscraping.mode = inputs.plugin_screenshot_mode
    plugin.webscraping.viewport = { width: inputs.plugin_screenshot_viewport_width, height: inputs.plugin_screenshot_viewport_height }
    plugin.webscraping.wait = inputs.plugin_screenshot_wait
    plugin.webscraping.background = inputs.plugin_screenshot_background
    config.plugins.push(plugin)
    deprecated("plugin_screenshot", { plugins: [plugin] })
  }

  // 💭 GitHub Community Support
  if (inputs.plugin_support) {
    deprecated("plugin_support", null)
  }

  // ❌ Removed options
  if (inputs.debug_flags) {
    deprecated("debug_flags", null)
  }
  if (inputs.dryrun) {
    deprecated("dryrun", null)
  }
  if (inputs.experimental_features) {
    deprecated("experimental_features", null)
  }

  return config
}
