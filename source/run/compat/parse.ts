// Imports
import { Secret } from "@engine/utils/secret.ts"
import * as YAML from "std/yaml/parse.ts"
import { Report, yaml } from "@run/compat/report.ts"

/** Compatibility type */
// deno-lint-ignore no-explicit-any
export type compat = any

/** Parse boolean input */
function boolean(input: string, { default: defaulted }: Record<PropertyKey, string>): boolean {
  if (/^(?:[Tt]rue|[Oo]n|[Yy]es|1)$/.test(input)) {
    return true
  }
  if (/^(?:[Ff]alse|[Oo]ff|[Nn]o|0)$/.test(input)) {
    return false
  }
  if (typeof defaulted === "undefined") {
    return false
  }
  return boolean(defaulted, {} as compat)
}

/** Parse number input */
function number(input: string, { min, max, default: defaulted }: Record<PropertyKey, number>) {
  let value = Number(input)
  if (!Number.isFinite(value)) {
    value = defaulted
  }
  if (Number.isFinite(min)) {
    value = Math.max(min, value)
  }
  if (Number.isFinite(max)) {
    value = Math.min(value, max)
  }
  return value
}

/** Parse string input */
function string(input: string, { values, default: defaulted }: { values?: string[]; default: string }) {
  const value = input.trim()
  if ((Array.isArray(values)) && (!values.includes(value))) {
    return defaulted
  }
  return value
}

/** Parse json object input */
function json(input: string, { default: defaulted }: Record<PropertyKey, string>) {
  try {
    return JSON.parse(input)
  } catch {
    // Ignore
  }
  return JSON.parse(defaulted)
}

/** Parse token input */
function token(input: string) {
  return new Secret(input)
}

/** Parse array input */
function array(input: string | void, { default: defaulted, format, values }: { default: string; format: string | string[]; values?: string[] }) {
  const value = input ?? defaulted
  const separators = { "comma-separated": ",", "space-separated": " ", "newline-separated": "\n" }
  const formats = [format, "comma-separated"].flat(1).filter((s) => s in separators) as Array<keyof typeof separators>
  let parsed = [] as string[]
  for (const separation of formats) {
    const separator = separators[separation]
    parsed = value
      .split(separator)
      .map((v) => v.trim().toLocaleLowerCase())
      .filter((v) => Array.isArray(values) ? values.includes(v) : true)
      .filter((v) => v)
    if (parsed.length > 1) {
      break
    }
  }
  return parsed
}

/** Parser */
async function parser(inputs: Record<PropertyKey, unknown>, report?: Report) {
  // Fetch metadata
  const metadata = { inputs: {} } as compat
  const base = "https://raw.githubusercontent.com/lowlighter/metrics/v3.34/source"
  const plugins = ["base", "core", ...new Set(Object.keys(inputs).map((key) => key.match(/^plugin_([a-z0-9]+)/)?.[1]).filter((plugin) => plugin))]
  for (const plugin of plugins) {
    for (const section of ["plugins", "plugins/community"]) {
      const response = await fetch(`${base}/${section}/${plugin}/metadata.yml`)
      if (response.status === 200) {
        const { inputs } = YAML.parse(await response.text()) as compat
        Object.assign(metadata.inputs, inputs)
      } else {
        response.body?.cancel()
      }
    }
  }

  // Parse inputs
  const parsed = {} as Record<PropertyKey, compat>
  const kv = /^(?<key>[\s\S]+?):(?<value>[\s\S]+)$/
  for (const [key, { type, ...options }] of Object.entries(metadata.inputs) as Array<[string, Record<PropertyKey, unknown>]>) {
    const value = inputs[key]
    parsed[key] = parse[type as keyof typeof parse]?.(`${value ?? options.default}`, options as compat)
    parsed[key] ??= value
    {
      const k = yaml({ [key]: null }, { inline: true }).match(kv)?.groups?.key.trim()
      const a = typeof value === "undefined" ? `${value}` : yaml({ [key]: value }, { inline: true }).match(kv)?.groups?.value.trim()
      const b = yaml({ [key]: parsed[key] }, { inline: true }).match(kv)?.groups?.value.trim()
      if (a !== b) {
        report?.debug(`${k}: ${a} → ${b}`)
      }
    }
  }
  return parsed
}

/** Compatibility parser */
export const parse = Object.assign(parser, { boolean, number, string, json, token, array })
