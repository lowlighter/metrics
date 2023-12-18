// Imports
/// <reference lib="dom" />
import Alpine from "y/alpinejs@3.13.0?pin=v133"
import * as YAML from "std/yaml/parse.ts"
import type { webrequest } from "@engine/config.ts"
import { is } from "@engine/utils/validation.ts"
import { Logger } from "@engine/utils/log.ts"
import { debounce } from "std/async/debounce.ts"
import { markdown } from "@engine/utils/markdown.ts"
import { highlight } from "@engine/utils/language.ts"
import { compat } from "@run/compat/mod.ts"
import { yaml } from "@run/compat/report.ts"
const dev = false // TODO(#1575)
const log = new Logger(import.meta, { level: dev ? "trace" : "warn" })

// Alpine components
log.info("registering alpine components")
document.querySelectorAll("[x-component]").forEach((component) => {
  const name = `x-${component.getAttribute("x-component")}`
  log.trace(`registering component: ${name}`)
  customElements.define(
    name,
    class extends HTMLElement {
      connectedCallback() {
        this.append((component as unknown as { content: { cloneNode(deep?: boolean): Node } }).content.cloneNode(true))
      }
      data() {
        return Object.fromEntries(this.getAttributeNames().map((attribute) => [attribute, this.getAttribute(attribute)]))
      }
    },
  )
})

/** Configuration crafter */
class App {
  /** Constructor */
  constructor() {
    this.init()
  }

  /** Initialize app */
  private async init() {
    log.info("fetching data")
    Object.assign(this.data, await fetch("/metadata").then((response) => response.json()))
    await Promise.all([
      fetch("/me").then(async response => this.data.user = await response.json()),
      fetch("/ratelimit").then(async response => this.data.ratelimit = await response.json()),
    ])
    this.data.dev = dev
    const partial = structuredClone(this.data.presets.schema) as any
    delete partial.properties.plugins.properties.args
    delete partial.properties.plugins.properties.processors
    delete partial.properties.processors.properties.args
    this.data.presets.plugins = partial.properties.plugins
    this.data.presets.processors = partial.properties.processors
    log.info("starting alpine")
    Alpine.data("data", () => this.data)
    Alpine.store("app", this)
    Alpine.start()
  }

  /** Data */
  readonly data = {} as Record<string, unknown>

  /** Render markdown */
  markdown(text: string) {
    return markdown(text, { sanitize: false })
  }

  /** Render and highlight YAML */
  yaml(content:string|Record<PropertyKey, unknown>) {
    return highlight("yaml", typeof content === "string" ? content : yaml(content, {colors:false})).code
  }

  /** Format key path into human-readable format */
  formatKeyPath(path: Array<string | number>, { trim = /^ $/ } = {}) {
    return path.filter((key) => !`${key}`.includes("@")).map((key) => typeof key === "number" ? `[${key}]` : `.${key}`).join("").replace(/^\./, "").replace(trim, "")
  }

  /** Return placeholder for given input */
  getPlaceholder(input:any) {
    const override = /\((?:(?:e\.g\.)|(?:placeholder:)) `([\s\S]+)`\)/
    if (override.test(input.description))
      return input.description.match(override)?.[1] ?? ""
    return `${this.getDefaultValue(input)}`
  }

  /** Return default value for given input */
  getDefaultValue(input:any) {
    if (input.type === "null")
      return null
    if ((input.type === "string")&&(input.const))
      return input.const
    if ("default" in input)
      return input.default
    if ((input.type === "number")||(input.type === "integer")) {
      if ("minimum" in input)
        return input.minimum
      if ("exclusiveMinimum" in input)
        return input.exclusiveMinimum + 1
      if ("maximum" in input)
        return input.maximum
      if ("exclusiveMaximum" in input)
        return input.exclusiveMaximum - 1
      return input.minimum ?? input.maximum ?? 0
    }
    if (input.type === "boolean")
      return false
    if (input.type === "string")
      return ""
    if (input.type === "object")
      return {}
  }

  /** Find index of default value for given input */
  findDefaultValue(inputs:any) {
    const value = this.getDefaultValue(inputs)
    for (const input of inputs.anyOf) {
      if (value === null) {
        if (input.type === "null")
          return inputs.anyOf.indexOf(input)
        continue
      }
      if (input.type === typeof value)
        return inputs.anyOf.indexOf(input)
    }
    return -1
  }

  /** Copy content inner text to clipboard */
  async copyToClipboard(event: MouseEvent) {
    // Print message
    const { clientX: x, clientY: y } = event
    const tip = document.createElement("div")
    tip.classList.add("fixed", "z-50", "px-2", "py-1", "text-white", "bg-black", "rounded-lg", "shadow", "transition-opacity", "-translate-y-2/4", "-translate-x-2/4", "pointer-events-none")
    tip.style.left = `${x}px`
    tip.style.top = `${y}px`
    tip.innerText = "Copied to clipboard!"
    document.body.append(tip)
    setTimeout(() => {
      tip.classList.add("opacity-0")
      setTimeout(() => tip.remove(), 1000)
    }, 1000)
    // Select and copy
    const target = event.target as HTMLElement
    const selection = getSelection()
    if (selection) {
      selection.removeAllRanges()
      const range = document.createRange()
      range.selectNode(target)
      selection.addRange(range)
    }
    await navigator.clipboard.writeText(target.innerText)
  }

  /** Update compat config (internal) */
  private async _updateCompatConfig(current: { status: string; input:string; config: Record<PropertyKey, unknown>|null; messages: string; }) {
    if (!current.input) {
      current.status = "empty"
      current.messages = ""
      current.config = null
      return
    }
    let value = {} as Record<PropertyKey, unknown>
    try {
      value = YAML.parse(current.input) as typeof value
      if ((!value) || (typeof value !== "object") || (!Object.keys(value).length)) {
        throw new Error("Invalid configuration")
      }
    } catch (error) {
      log.warn(`${error}`)
      current.status = "invalid"
      return
    }
    const {content, report} = await compat(value, { log: null, use: { requests: false } })
    current.status = "valid"
    current.messages = await report.html()
    current.config = content
  }

  /** Update compat config */
  readonly updateCompatConfig = debounce((options: Parameters<typeof this._updateCompatConfig>[0]) => this._updateCompatConfig(options), 1500)



  /** Render plugin */
  renderPlugin({ plugin: i, mock = false, force = false }: { plugin: number; mock?: boolean; force?: boolean }) {
    /*const handle = this.config.presets.default.plugins.handle || (mock = true, "octocat")
    const params = new URLSearchParams({ mock: `${mock}`, plugins: this.getPluginConfig({ plugin: i, output: "json" }) })
    if (force) {
      params.set("t", `${Date.now()}`)
    }
    const url = `${origin}/${handle}?${params}`
    const img = document.querySelector(`[data-plugin="${i}"] .preview img`)
    if (img) {
      ;(img as HTMLImageElement).src = url
      log.trace(`plugins: render "${this.config.plugins[i].id}" (at index ${i}${mock ? ", mocked" : ""})`)
    }
    return url*/
  }

}

// Initialize app
new App()

/** Web request */
type request = is.infer<typeof webrequest>

/** Plugin */
type plugin = request["plugins"][0]

/** Processor */
type processor = NonNullable<plugin["processors"]>[0]