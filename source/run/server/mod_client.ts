// Imports
/// <reference lib="dom" />
import Alpine from "y/alpinejs@3.13.0"
import * as YAML from "y/js-yaml@4.1.0"
import hljs from "y/highlight.js@11.8.0/lib/core"
import hlyaml from "y/highlight.js@11.8.0/lib/languages/yaml"
import type { webrequest } from "@engine/config.ts"
import { is } from "@engine/utils/validation.ts"
import { Logger } from "@engine/utils/log.ts"
import { debounce, DebouncedFunction } from "std/async/debounce.ts"
import rehypeStringify from "y/rehype-stringify@10.0.0"
import remarkParse from "y/remark-parse@11.0.0"
import remarkRehype from "y/remark-rehype@11.0.0"
import { unified } from "y/unified@11.0.4"
hljs.registerLanguage("yaml", hlyaml)
const log = new Logger(import.meta, { level: "trace" })

//TODO(@lowlighter): correct default value
//TODO(@lowlighter): notice for plugins that are disabled/limited
//TODO(@lowlighter): change header color for preview or print message
//Drag and drop for reorganize
//Clone

/*
timezone: true,
handle: true,
entity: true,
template: true,
preset: true,
fatal: true,
 */

// Alpine components
document.querySelectorAll("[x-component]").forEach((component) => {
  customElements.define(
    `x-${component.getAttribute("x-component")}`,
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

const menu = {
  header: {
    user: false,
    collapse: true,
  },
}

const data = await fetch("/metadata").then((response) => response.json())
data.user = await fetch("/me").then((response) => response.json())
data.ratelimit = await fetch("/ratelimit").then((response) => response.json())
console.log(data)

// deno-lint-ignore no-explicit-any
type Any = any

/** Web request */
type request = is.infer<webrequest>

/** Plugin */
type plugin = request["plugins"][0]

/** Processor */
type processor = NonNullable<plugin["processors"]>[0]

class Crafter {
  readonly state = {
    mode: "web",
    edit: {
      global: "",
    },
    expand: {
      plugins: true,
      processors: NaN,
    },
  }

  /** Global config */
  readonly global = {
    inputs: {},
  }

  /** Config */
  readonly config = {
    plugins: data.plugins.map((x: any) => Alpine.reactive({ ...x, args: {}, processors: [], debounce: null as null | DebouncedFunction<[]> })) as plugin[],
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

  /** Markdown renderer (internal) */
  private readonly remark = unified()
    .use(remarkParse as Any)
    .use(remarkRehype as Any)
    .use(rehypeStringify as Any)

  /** Render markdown */
  markdown(text: string) {
    return this.remark.process(text)
  }

  /** Format key path into human-readable format */
  formatKeyPath(path: Array<string | number>) {
    return path.filter((key) => !`${key}`.includes("@")).map((key) => typeof key === "number" ? `[${key}]` : `.${key}`).join("").replace(/^\./, "")
  }

  /** Add new plugin */
  addPlugin({ plugin }: { plugin: plugin }) {
    log.debug(`plugins: add "${plugin.id}"`)
    this.config.plugins.push({ ...plugin, args: {}, processors: [], debounce: null as null | DebouncedFunction<[]> })
    this.state.expand.plugins = false
  }

  /** Remove plugin */
  removePlugin({ plugin }: { plugin: number }) {
    log.debug(`plugins: remove "${this.config.plugins[plugin].id}" (at index ${plugin})`)
    this.config.plugins.splice(plugin, 1)
    this.state.expand.plugins = this.config.plugins.length === 0
  }

  /** Render plugin */
  renderPlugin({ plugin: i, mock = false, force = false }: { plugin: number; mock?: boolean; force?: boolean }) {
    const handle = this.config.presets.default.plugins.handle || (mock = true, "octocat")
    const params = new URLSearchParams({ mock: `${mock}`, plugins: this.getPluginConfig({ plugin: i, output: "json" }) })
    if (force) {
      params.set("t", `${Date.now()}`)
    }
    const url = `${globalThis.origin}/${handle}?${params}`
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
    this.config.plugins[i]?.processors?.push({ ...processor, args: {} })
    this.state.expand.processors = NaN
  }

  /** Remove processor from a plugin */
  removeProcessor({ plugin: i, processor: j }: { plugin: number; processor: number }) {
    log.debug(`processors: remove "${this.config.plugins[i].processors[j].id}" from "${this.config.plugins[i].id}" (at index ${i},${j})`)
    this.config.plugins[i]?.processors?.splice(j, 1)
    this.state.expand.processors = NaN
  }

  /** Get global mode config */
  getGlobalConfig(options: { output?: "yaml" | "json" }): string
  getGlobalConfig(options: { output: "object" }): plugin
  getGlobalConfig({ output = "yaml" }: { output?: "yaml" | "json" | "object" } = {}) {
    const { inputs: _, ...global } = this.global
    switch (output) {
      case "yaml":
        return hljs.highlight(YAML.dump(global), { language: "yaml" }).value
      case "json":
        return JSON.stringify(global)
    }
  }

  /** Get plugin config */
  getPluginConfig(options: { plugin: number; output?: "yaml" | "json" }): string
  getPluginConfig(options: { plugin: number; output: "object" }): plugin
  getPluginConfig({ plugin: i, output = "yaml" }: { plugin: number; output?: "yaml" | "json" | "object" }) {
    const { id, args, ...plugin } = this.config.plugins[i]
    const processors = (plugin.processors as processor[]).map(({ id, args }) => ({ [id]: args }))
    const local = { [id]: args, ...(processors.length ? { processors } : {}) }
    switch (output) {
      case "yaml":
        return hljs.highlight(YAML.dump([local]), { language: "yaml" }).value
      case "json":
        return JSON.stringify([local])
      case "object":
        return local
    }
  }

  /** Get full configuration */
  getFullConfig() {
    switch (this.state.mode) {
      case "web": {
        const handle = this.config.presets.default.plugins.handle || "octocat"
        const params = new URLSearchParams({
          ...this.getGlobalConfig({ output: "object" }),
          plugins: JSON.stringify(this.config.plugins.map((_, plugin) => this.getPluginConfig({ plugin, output: "object" }))),
        })
        return `${globalThis.origin}/${handle}?${params}`
      }
      default: {
        const { presets } = this.config
        const plugins = this.config.plugins.map((_, plugin) => this.getPluginConfig({ plugin, output: "object" }))
        return hljs.highlight(YAML.dump({ ...this.getGlobalConfig({ output: "object" }), config: { plugins, presets } }), { language: "yaml" }).value
      }
    }
  }

  /** Set crafter mode */
  setMode(event: Event) {
    const target = event.target as HTMLInputElement
    this.state.mode = target.value
    this.global.inputs = data.modes[this.state.mode]
    this.state.edit.global = `<x-schema-inputs x-data="{inputs:$store.craft.global.inputs, path:['@global']}"></x-schema-inputs>`
    log.debug(`mode set to: ${this.state.mode}`)
  }

  /** Set default value */
  setDefaultValue(path: Array<string | number>, input: any) {
    /*console.log([...path], {...input})
    const keys = path.filter(key => !`${key}`.includes("@"))
    if ("default" in input) {
      const value = input.default
      this.setValue(path, {target:{value}})
      log.debug(`set default for config.${this.formatKeyPath(keys)}: ${value}`)
    }*/
  }

  /** Update config value */
  setValue(path: Array<string | number>, event: Event, { anyof = false } = {}) {
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

    // Retrieve value from event target
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

    // Update config value
    let object = ({ "@global": this.global }[path[0]] ?? this.config) as Record<PropertyKey, unknown>
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

Alpine.data("data", () => data)
Alpine.store("menu", menu)
Alpine.store("craft", new Crafter())
Alpine.start()
