// Imports
/// <reference lib="dom" />
import Alpine from "https://esm.sh/alpinejs@3.13.0"
import * as YAML from "https://esm.sh/js-yaml@4.1.0"
import hljs from "https://esm.sh/highlight.js@11.8.0/lib/core"
import hlyaml from "https://esm.sh/highlight.js@11.8.0/lib/languages/yaml"
hljs.registerLanguage("yaml", hlyaml)

//TODO(@lowlighter): correct default value
//TODO(@lowlighter): edit as yaml
//TODO(@lowlighter): render mocked plugins
//TODO(@lowlighter): expandable add processor
//TODO(@lowlighter): fix overflow url
//TODO(@lowlighter): notice for plugins that are disabled/limited
//TODO(@lowlighter): meta config in url
//TODO(@lowlighter): change header color for preview or print message
//TODO(@lowlighter): better styling and dark mode

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

const data = await fetch("/metadata").then((response) => response.json())
data.user = await fetch("/me").then((response) => response.json())
data.ratelimit = await fetch("/ratelimit").then((response) => response.json())
console.log(data)
Alpine.data("data", () => data)

Alpine.store("menu", {
  dropdown: false,
})

type plugin = {
  id: string
  args: Record<string, unknown>
  processors: Array<processor>
  edit: "code" | "ui"
}
type processor = {
  id: string
  args: Record<string, unknown>
}
type config = {
  handle: string
  plugins: Array<plugin>
}

interface CraftStore {
  handle: string
  plugins: plugin[]
  craftConfig(index?: number): Promise<config>
}

Alpine.store("craft", {
  handle: "",
  plugins: [] as Array<plugin>,
  addPlugin(this: CraftStore, plugin: plugin) {
    this.plugins.push({ ...plugin, processors: [], edit: "ui" })
  },
  removePlugin(this: CraftStore, i: number) {
    this.plugins.splice(i, 1)
  },
  addProcessor(this: CraftStore, processor: processor, i: number) {
    this.plugins[i].processors.push(processor)
  },
  removeProcessor(this: CraftStore, i: number, j: number) {
    this.plugins[i].processors.splice(j, 1)
  },
  setEditMode(this: CraftStore, mode: "code" | "ui", i: number) {
    this.plugins[i].edit = mode
  },
  // deno-lint-ignore require-await
  async craftConfig(this: CraftStore, index: number) {
    const config = { handle: this.handle, plugins: [] } as config
    for (let i = 0; i < this.plugins.length; i++) {
      const plugin = { id: this.plugins[i].id, args: {}, processors: [], edit: "ui" } as plugin
      const inputs = document.querySelectorAll(`[data-plugin="${i}"] input, [data-plugin="${i}"] select`)
      let skip = ""
      for (const input of inputs as unknown as Array<HTMLInputElement>) {
        console.log(input.name, input.value, skip)
        const [_, ...parts] = input.name.split(".")
        let at = plugin as Record<PropertyKey, unknown>
        if (/^processors\[(\d+)\]$/.test(_)) {
          const j = Number(_.match(/^processors\[(\d+)\]$/)?.[1])
          plugin.processors[j] ??= { id: this.plugins[i].processors[j].id, args: {} }
          at = plugin.processors[j]
        }
        const last = parts.pop()!
        if (last === "$") {
          skip = (!input.checked) ? [_, ...parts].join(".") : ""
          continue
        }
        if (skip && (input.name.startsWith(skip))) {
          continue
        }
        skip = ""
        console.log(">>>>> setting", input.name, "to", input.value)
        for (const part of parts) {
          at[part] ??= {}
          at = at[part] as typeof at
        }
        switch (input.type) {
          case "number":
            at[last] = Number(input.value)
            break
          case "checkbox":
            at[last] = input.checked
            break
          case "hidden":
            at[last] = JSON.parse(input.value)
            break
          default:
            at[last] = input.value
        }
      }
      config.plugins[i] = plugin
      console.log(YAML.dump(config))
    }
    if (typeof index === "number") {
      return config.plugins[index]
    }
    //              document.querySelector(`[data-plugin="${i}"] .preview img`).src = `/preview?plugins=${JSON.stringify(config.plugins)}&t=${Date.now()}`

    return config
  },
  async getUrl(this: CraftStore, { preview = false, time = false } = {}) {
    const { plugins } = await this.craftConfig()
    const handle = preview ? "preview" : this.handle || "preview"
    const params = new URLSearchParams({ plugins: JSON.stringify(plugins) })
    if (time) {
      params.set("t", `${Date.now()}`)
    }
    return `${globalThis.origin}/${handle}?${params}`
  },
  async getConfig(this: CraftStore) {
    return hljs.highlight(YAML.dump(await this.craftConfig()), { language: "yaml" }).value
  },
})
Alpine.start()
