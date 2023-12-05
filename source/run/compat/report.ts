// Imports
import { bgWhite, black, brightGreen, brightRed, brightYellow, cyan, gray, stripAnsiCode, white, yellow } from "std/fmt/colors.ts"
import * as YAML from "std/yaml/stringify.ts"
import { markdown } from "@engine/utils/markdown.ts"
import { Secret } from "@engine/utils/secret.ts"

/** Compatibility report */
export class Report {
  /** Messages */
  readonly messages = [] as Array<{ type: string; message: string }>

  /** Register error message */
  error(message: string) {
    this.messages.push({ type: "error", message })
  }

  /** Register warning message */
  warning(message: string) {
    this.messages.push({ type: "warning", message })
  }

  /** Register info message */
  info(message: string) {
    this.messages.push({ type: "info", message })
  }

  /** Register debug message */
  debug(message: string) {
    this.messages.push({ type: "debug", message })
  }

  /** Register unimplemented message */
  unimplemented(message: string) {
    this.messages.push({ type: "unimplemented", message })
  }

  /** Flush messages */
  flush() {
    this.messages.splice(0)
  }

  /** Print messages to console */
  console() {
    let content = ""
    for (const { type, message } of this.messages) {
      const icon = { error: "❌", warning: "⚠️", info: "💡", debug: "📟", unimplemented: "🏗️" }[type]
      const text = `${icon} ${message}`
        .replaceAll(/^```\w*([\s\S]+?)```/gm, (_, text: string) => text.split("\n").map((line) => `   ${line}`).join("\n"))
        .replaceAll(/`([\s\S]+?)`/g, (_, text) => bgWhite(` ${black(text)} `))
        .split("\n").map((line) => `▓ ${line}`).join("\n")
      const color = { error: brightRed, warning: brightYellow, info: brightGreen, debug: gray, unimplemented: yellow }[type]!
      content += `${color(text)}\n`
    }
    return content
  }

  /** Print messages to html */
  async html() {
    let content = ""
    for (const { type, message } of this.messages) {
      content += `<div class="${type}">${await markdown(stripAnsiCode(message), { sanitize: false })}</div>`
    }
    return content
  }
}

/** YAML formatter for console */
export function yaml(content: Record<PropertyKey, unknown>, { inline = false, colors = true } = {}) {
  const regex = {
    kv: /^(?<indent>\s*)(?<array>\-\s+)?'?(?<key>\w[.\w-]*)'?(?:(?<kv>:)(?<value>\s.+)?)?$/,
  }
  const lines = []
  for (const line of YAML.stringify(copy(content) as Record<PropertyKey, unknown>, { skipInvalid: true, flowLevel: inline ? 1 : -1 }).split("\n")) {
    if (regex.kv.test(line)) {
      let { indent, array = "", kv, key, value } = line.match(regex.kv)!.groups!
      let color = white
      if (!kv) {
        value = key
      }
      value = value?.trim()
      switch (true) {
        case /\{empty: (?:true|false)\}/.test(value):
          color = brightGreen
          value = `Secret{ empty: ${value.includes("true")} }`
          break
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
      lines.push(`${indent}${array}${kv ? `${cyan(key)}: ${color(value ?? "")}` : color(value)}`)
      continue
    }
    lines.push(line)
  }
  const result = lines.join("\n")
  if (!colors)
    return stripAnsiCode(result)
  return result
}

/** Copy record while cleaning out secrets */
function copy(value:unknown):unknown {
  if (value instanceof Secret)
    return "${{ github.token }}"
  if (Array.isArray(value))
    return value.map(copy)
  if ((value)&&(typeof value === "object"))
    return Object.fromEntries(Object.entries(value).map(([key, value]) => [key, copy(value)]))
  return value
}