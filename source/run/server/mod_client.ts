// Imports
import Alpine from "y/alpinejs@3.13.0"
import * as YAML from "y/js-yaml@4.1.0"
import hljs from "y/highlight.js@11.8.0/lib/core"
import hlyaml from "y/highlight.js@11.8.0/lib/languages/yaml"
hljs.registerLanguage("yaml", hlyaml)

// Alpine components
document.querySelectorAll("[x-component]").forEach((component) => {
  customElements.define(
    `x-${component.getAttribute("x-component")}`,
    class extends HTMLElement {
      connectedCallback() {
        this.append(component.content.cloneNode(true))
      }
      data() {
        return Object.fromEntries(this.getAttributeNames().map((attribute) => [attribute, this.getAttribute(attribute)]))
      }
    },
  )
})

/*
timezone: true,
handle: true,
entity: true,
template: true,
preset: true,
fatal: true,
 */

const data = await fetch("/metadata").then((response) => response.json())
data.user = await fetch("/me").then((response) => response.json())
data.ratelimit = await fetch("/ratelimit").then((response) => response.json())
console.log(data)
Alpine.data("data", () => data)

Alpine.store("menu", {
  dropdown: false,
})

Alpine.store("craft", {
  handle: "",
  plugins: [],
  addPlugin(plugin) {
    this.plugins.push({ ...plugin, processors: [], edit: "ui" })
  },
  removePlugin(i) {
    this.plugins.splice(i, 1)
  },
  addProcessor(processor, i) {
    this.plugins[i].processors.push(processor)
  },
  removeProcessor(i, j) {
    this.plugins[i].processors.splice(j, 1)
  },
  setEditMode(mode, i) {
    this.plugins[i].edit = mode
  },

  async craftConfig(index) {
    const config = { handle: this.handle, plugins: [] }

    for (let i = 0; i < this.plugins.length; i++) {
      const plugin = { id: this.plugins[i].id, args: {}, processors: [] }
      const inputs = document.querySelectorAll(`[data-plugin="${i}"] input, [data-plugin="${i}"] select`)
      let skip = ""
      for (const input of inputs) {
        console.log(input.name, input.value, skip)
        const [_, ...parts] = input.name.split(".")
        let at = plugin
        if (/^processors\[(\d+)\]$/.test(_)) {
          const j = Number(_.match(/^processors\[(\d+)\]$/)[1])
          plugin.processors[j] ??= { id: this.plugins[i].processors[j].id, args: {} }
          at = plugin.processors[j]
        }
        const last = parts.pop()
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
          at = at[part]
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
  async getUrl({ preview = false, time = false } = {}) {
    const { plugins } = await this.craftConfig()
    const handle = preview ? "preview" : this.handle || "preview"
    const params = new URLSearchParams({ plugins: JSON.stringify(plugins) })
    if (time) {
      params.set("t", Date.now())
    }
    return `${window.origin}/${handle}?${params}`
  },
  async getConfig() {
    return hljs.highlight(YAML.dump(await this.craftConfig()), { language: "yaml" }).value
  },
})
Alpine.start()
