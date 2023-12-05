// Imports
/// <reference lib="dom" />
import Alpine from "y/alpinejs@3.13.0?pin=v133"
import * as YAML from "std/yaml/parse.ts"
import type { webrequest } from "@engine/config.ts"
import { is } from "@engine/utils/validation.ts"
import { Logger } from "@engine/utils/log.ts"
import { debounce, DebouncedFunction } from "std/async/debounce.ts"
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
      fetch("/me").then((response) => this.data.user = response.json()),
      fetch("/ratelimit").then((response) => this.data.ratelimit = response.json()),
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

  /** State */
  readonly state = {
    // Mode: "web", "actions" or "server"
    mode: "",
    // Edit status
    edit: {
      // Is editing global config ?
      global: false,
      // Is editing compat config ?
      compat: false,
      // Currently edited preset
      preset: "",
      // Currently edited plugin index
      plugins: NaN,
      // Currently edited processor index
      processors: NaN,
    },
    // Expand status
    expand: {
      // Plugins expansion
      plugins: {
        // Expand plugins list
        list: true
      },
      // Currently expanded preset
      preset: "",
      // Currently expanded plugin index
      processors: NaN,
    },
    // Cached status
    cached: {
      // Cached inputs (these are mapped to inputs but not yet stored in config)
      inputs: {} as Record<PropertyKey, unknown>,
    },
    // Compat status
    compat: {
      // Compat config textarea placeholder
      placeholder: [
        "token: ${{ github.token }}",
        "config_timezone: Europe/Paris",
        "plugin_isocalendar: yes",
        "plugin_isocalendar_duration: full-year",
      ].join("\n"),
      // Compat config status
      status: "empty",
    },
    // Global status
    global: {
      // Inputs for current mode
      inputs: {},
      // Generated html
      xhtml:""
    },
    // Menu status
    menu: {
      // Header menu
      header: {
        // Is user menu open ?
        user: false,
        // Is mobile menu collapsed ?
        collapse: true,
      },
    }
  }

  /** Compat config */
  readonly compat = {}

  /** Config */
  readonly config = {
    plugins: [] as Array<plugin & { processors: processor[]; debounce: null | DebouncedFunction<[]> }>,
    presets: {
      default: {
        plugins: {
          handle: "",
        },
        processors: {
          handle: "",
        },
      },
    },
  }

  /** Render markdown */
  markdown(text: string) {
    return markdown(text, { sanitize: false })
  }

  /** Format key path into human-readable format */
  formatKeyPath(path: Array<string | number>, { trim = /^ $/ } = {}) {
    return path.filter((key) => !`${key}`.includes("@")).map((key) => typeof key === "number" ? `[${key}]` : `.${key}`).join("").replace(/^\./, "").replace(trim, "")
  }

  /** Set mode */
  setMode(event: Event) {
    const target = event.target as HTMLInputElement
    this.state.mode = target.value
    this.state.global.inputs = (this.data.modes as Record<string, Record<string, unknown>>)[this.state.mode]
    this.state.global.xhtml =
      `<x-schema-inputs x-data="{inputs:$store.app.state.global.inputs, path:['@global'], trim:undefined}" x-init="$nextTick(() => $store.app.syncValue(path, inputs))"></x-schema-inputs>`
    log.debug(`mode set to: ${this.state.mode}`)
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

  /** Add new plugin */
  addPlugin({ plugin }: { plugin: plugin }) {
    log.debug(`plugins: add "${plugin.id}"`)
    this.config.plugins.push({ ...plugin, args: {}, processors: [], debounce: null as null | DebouncedFunction<[]> })
    this.state.expand.plugins.list = false
    this.state.edit.plugins = this.config.plugins.length - 1
  }

  /** Remove plugin */
  removePlugin({ plugin }: { plugin: number }) {
    log.debug(`plugins: remove "${this.config.plugins[plugin].id}" (at index ${plugin})`)
    this.config.plugins.splice(plugin, 1)
    this.state.expand.plugins.list = this.config.plugins.length === 0
    this.state.edit.plugins = NaN
  }

  /** Render plugin */
  renderPlugin({ plugin: i, mock = false, force = false }: { plugin: number; mock?: boolean; force?: boolean }) {
    const handle = this.config.presets.default.plugins.handle || (mock = true, "octocat")
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
    return url
  }

  /** Add new processor to a plugin  */
  addProcessor({ plugin: i, processor }: { plugin: number; processor: processor }) {
    log.debug(`processors: add "${processor.id}" to "${this.config.plugins[i].id}" (at index ${i})`)
    this.config.plugins[i].processors.push({ ...processor, args: {} })
    this.state.expand.processors = NaN
    this.state.edit.processors = this.config.plugins[i].processors.length - 1
  }

  /** Remove processor from a plugin */
  removeProcessor({ plugin: i, processor: j }: { plugin: number; processor: number }) {
    log.debug(`processors: remove "${this.config.plugins[i].processors[j].id}" from "${this.config.plugins[i].id}" (at index ${i},${j})`)
    this.config.plugins[i].processors.splice(j, 1)
    this.state.expand.processors = NaN
    this.state.edit.processors = NaN
  }

  /** Set compat config (internal) */
  private async _setCompatConfig(state: { status: string; messages: string; code: string }) {
    const textarea = document.querySelector('[name="config.compat"]') as HTMLTextAreaElement
    if (!textarea?.value) {
      state.status = "empty"
      state.code = highlight("yaml", "# Transpiled configuration will appear here").code
      state.messages = ""
    } else {
      try {
        const value = YAML.parse(textarea.value)
        if ((!value) || (typeof value !== "object") || (!Object.keys(value).length)) {
          throw new Error("Invalid configuration")
        }
        state.status = "valid"
        const config = await compat(value as Record<PropertyKey, unknown>, { log: null, use: { requests: false } })
        Object.assign(this.compat, config.content)
        state.messages = await config.report.html()
        state.code = highlight("yaml", yaml(this.compat, {colors:false})).code
      } catch (error) {
        log.warn(`${error}`)
        state.status = "invalid"
      }
    }
  }

  /** Set compat config */
  readonly setCompatConfig = debounce((options: Parameters<typeof this._setCompatConfig>[0]) => this._setCompatConfig(options), 1500)

  /** Import an existing compat config */
  importCompatConfig() {
    console.log(this.compat)
  }

  /** Get global config */
  getGlobalConfig(options: { output?: "yaml" | "json" }): string
  getGlobalConfig(options: { output: "object" }): Record<PropertyKey, unknown>
  getGlobalConfig({ output = "yaml" }: { output?: "yaml" | "json" | "object" } = {}): string | Record<PropertyKey, unknown> {
    const { inputs: _, xhtml:__, ...global } = this.state.global
    switch (output) {
      case "yaml":
        return highlight("yaml", yaml(global, {colors:false})).code
      case "json":
        return JSON.stringify(global)
      case "object":
        return global
    }
  }

  /** Get preset config */
  getPresetConfig(name: string, options: { output?: "yaml" | "json" }): string
  getPresetConfig(name: string, options: { output: "object" }): Record<PropertyKey, unknown>
  getPresetConfig(name: string, { output = "yaml" }: { output?: "yaml" | "json" | "object" } = {}): string | Record<PropertyKey, unknown> {
    const preset = this.config.presets[name as keyof typeof this.config.presets] ?? {}
    switch (output) {
      case "yaml":
        return highlight("yaml", yaml(preset, {colors:false})).code
      case "json":
        return JSON.stringify(preset)
      case "object":
        return preset
    }
  }

  /** Get plugin config */
  getPluginConfig(options: { plugin: number; output?: "yaml" | "json" }): string
  getPluginConfig(options: { plugin: number; output: "object" }): plugin
  getPluginConfig({ plugin: i, output = "yaml" }: { plugin: number; output?: "yaml" | "json" | "object" }): string | plugin {
    const { id, args, ...plugin } = this.config.plugins[i] ?? {}
    const processors = (plugin.processors as processor[]).map(({ id, args }) => ({ [id!]: args }))
    const local = { ...(id ? { [id]: args } : {}), ...(processors.length ? { processors } : {}) }
    switch (output) {
      case "yaml":
        return highlight("yaml", yaml([local] as unknown as Record<PropertyKey, unknown>, {colors:false})).code
      case "json":
        return JSON.stringify([local])
      case "object":
        return local as plugin
    }
  }

  /** Get full config */
  getFullConfig() {
    switch (this.state.mode) {
      case "web": {
        const handle = this.config.presets.default.plugins.handle || "octocat"
        const params = new URLSearchParams({
          ...this.getGlobalConfig({ output: "object" }),
          plugins: JSON.stringify(this.config.plugins.map((_, plugin) => this.getPluginConfig({ plugin, output: "object" }))),
        })
        return `${origin}/${handle}?${params}`
      }
      default: {
        const { presets } = this.config
        const plugins = this.config.plugins.map((_, plugin) => this.getPluginConfig({ plugin, output: "object" }))
        return highlight("yaml", yaml({ ...this.getGlobalConfig({ output: "object" }), config: { plugins, presets } }, {colors:false})).code
      }
    }
  }

  /** Set default value */
  syncValue(path: Array<string | number>, inputs: any) {
    log.probe(`syncing: ${this.formatKeyPath(path)}`)
    const subpath = path.join(".")
    switch (true) {
      case inputs.type === "object": {
        for (const [key, input] of Object.entries(inputs.properties ?? {})) {
          this.syncValue([...path, key], input)
        }
        break
      }
      case inputs.type === "boolean": {
        const input = document.querySelector(`[name="${subpath}"]`) as HTMLInputElement
        if (!input) {
          break
        }
        input.checked = inputs.default
        this.setValue(path, { target: input } as unknown as Event)
        break
      }
      case inputs.type === "integer":
      case inputs.type === "number":
      case inputs.type === "string": {
        const input = document.querySelector(`[name="${subpath}"]`) as HTMLInputElement
        if (!input) {
          break
        }
        input.value = inputs.default ?? ""
        this.setValue(path, { target: input } as unknown as Event)
        break
      }
      case ("anyOf" in inputs) && (inputs.anyOf.every((item: Record<PropertyKey, unknown>) => item.const)): {
        const input = document.querySelector(`[id="${subpath}@${inputs.default}"]`) as HTMLInputElement
        if (!input) {
          break
        }
        input.checked = true
        this.setValue(path, { target: input } as unknown as Event)
        break
      }
      default:
        log.error(`If you see this message, please implement me: ${subpath}`)
        log.error(inputs)
    }
  }

  /** Set cached value */
  setCachedValue(path: Array<string | number>, event: Event) {
    const target = event.target as HTMLInputElement
    const value = target.value
    this.state.cached.inputs[path.join(".")] = value
    log.debug(`set cached for config.${this.formatKeyPath(path)}: ${value}`)
  }

  /** Update config value */
  setValue(path: Array<string | number>, event: Event, { anyof = false, cached = false } = {}) {
    // Handle anyof inputs by cleaning up siblings and dispatching input event to active children
    const target = event.target as HTMLInputElement
    if (anyof) {
      const subpath = path.join(".")
      log.trace(`refreshing [name^="${subpath.replace(/@\d+$/, "")}"]`)
      target.checked = true
      document.querySelectorAll(`[name^="${subpath.replace(/@\d+$/, "")}"].anyof:checked`).forEach((input) => {
        if (!input.id.startsWith(subpath)) {
          Object.assign(input, { checked: false })
          return
        }
        input.nextElementSibling?.querySelector("input")?.dispatchEvent(new Event("input"))
      })
      return
    }

    // Retrieve value from event target or from cache
    let value = null
    switch (target.type) {
      case "checkbox":
        value = target.checked
        break
      case "number":
        value = Number(target.value)
        break
      default:
        value = target.value
    }
    if (cached) {
      value = this.state.cached.inputs[path.join(".")]
      log.trace(`read value from cache for ${this.formatKeyPath(path)}: ${value}`)
    }

    // Update config value
    let object = ({ "@global": this.state.global }[path[0]] ?? this.config) as Record<PropertyKey, unknown>
    const keys = path.filter((key) => !`${key}`.includes("@"))
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]
      log.trace(`accessing config.${this.formatKeyPath(keys.slice(0, i + 1))}`)
      if (typeof key === "number") {
        object[key] ??= []
      } else {
        object[key] ??= {}
      }
      object = object[key] as Record<PropertyKey, unknown>
    }
    object[keys.at(-1)!] = value
    log.debug(`set ${{ "@global": "global" }[path[0]] ?? "config"}.${this.formatKeyPath(keys)}: ${value}`)

    // Refresh plugins preview
    if (path[0] === "plugins") {
      const i = Number(path[1])
      const plugin = this.config.plugins[i]
      plugin.debounce ??= debounce(() => this.renderPlugin({ plugin: i }), 1000)
      plugin.debounce()
    }
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