//Imports
import fs from "fs"
import yaml from "js-yaml"
import path from "path"
import url from "url"
import fetch from "node-fetch"

//Defined categories
const categories = ["core", "github", "social", "community"]

//Previous descriptors
let previous = null

/**Metadata descriptor parser */
export default async function metadata({log = true, diff = false} = {}) {
  //Paths
  const __metrics = path.join(path.dirname(url.fileURLToPath(import.meta.url)), "../../..")
  const __templates = path.join(__metrics, "source/templates")
  const __plugins = path.join(__metrics, "source/plugins")
  const __package = path.join(__metrics, "package.json")
  const __descriptor = path.join(__metrics, "action.yml")

  //Init
  const logger = log ? console.debug : () => null

  //Diff with latest version
  if (diff) {
    try {
      previous = yaml.load(await fetch("https://raw.githubusercontent.com/lowlighter/metrics/latest/action.yml").then(response => response.text()))
    }
    catch (error) {
      logger(error)
    }
  }

  //Load plugins metadata
  let Plugins = {}
  logger("metrics/metadata > loading plugins metadata")
  for (const name of await fs.promises.readdir(__plugins)) {
    if (!(await fs.promises.lstat(path.join(__plugins, name))).isDirectory())
      continue
    logger(`metrics/metadata > loading plugin metadata [${name}]`)
    Plugins[name] = await metadata.plugin({__plugins, name, logger})
  }
  //Reorder keys
  const {base, core, ...plugins} = Plugins //eslint-disable-line no-unused-vars
  Plugins = Object.fromEntries(Object.entries(Plugins).sort(([_an, a], [_bn, b]) => a.category === b.category ? (a.index ?? Infinity) - (b.index ?? Infinity) : categories.indexOf(a.category) - categories.indexOf(b.category)))
  logger(`metrics/metadata > loaded [${Object.keys(Plugins).join(", ")}]`)
  //Load templates metadata
  let Templates = {}
  logger("metrics/metadata > loading templates metadata")
  for (const name of await fs.promises.readdir(__templates)) {
    if (!(await fs.promises.lstat(path.join(__templates, name))).isDirectory())
      continue
    logger(`metrics/metadata > loading template metadata [${name}]`)
    Templates[name] = await metadata.template({__templates, name, plugins, logger})
  }
  //Reorder keys
  const {community, ...templates} = Templates
  Templates = {...Object.fromEntries(Object.entries(templates).sort(([_an, a], [_bn, b]) => (a.index ?? Infinity) - (b.index ?? Infinity))), community}

  //Packaged metadata
  const packaged = JSON.parse(`${await fs.promises.readFile(__package)}`)

  //Descriptor metadata
  const descriptor = yaml.load(`${await fs.promises.readFile(__descriptor, "utf-8")}`)

  //Metadata
  return {plugins:Plugins, templates:Templates, packaged, descriptor}
}

/**Metadata extractor for templates */
metadata.plugin = async function({__plugins, name, logger}) {
  try {
    //Load meta descriptor
    const raw = `${await fs.promises.readFile(path.join(__plugins, name, "metadata.yml"), "utf-8")}`
    const {inputs, ...meta} = yaml.load(raw)

    //category
    if (!categories.includes(meta.category))
      meta.category = "community"

    //Inputs parser
    {
      meta.inputs = function({data:{user = null} = {}, q, account}, defaults = {}) {
        //Support check
        if (!account)
          logger(`metrics/inputs > account type not set for plugin ${name}!`)
        if (account !== "bypass") {
          const context = q.repo ? "repository" : account
          if (!meta.supports?.includes(context))
            throw {error:{message:`Not supported for: ${context}`, instance:new Error()}}
        }
        //Special values replacer
        const replacer = value => {
          value = `${value}`.trim()
          if (user) {
            if (value === ".user.login")
              return user.login ?? value
            if (value === ".user.twitter")
              return user.twitterUsername ?? value
            if (value === ".user.website")
              return user.websiteUrl ?? value
          }
          return value
        }
        //Inputs checks
        const result = Object.fromEntries(
          Object.entries(inputs).map(([key, {type, format, default:defaulted, min, max, values, inherits:_inherits}]) => [
            //Format key
            metadata.to.query(key, {name}),
            //Format value
            (defaulted => {
              //Default value
              let value = q[metadata.to.query(key)] ?? q[key] ?? defaulted
              //Apply type conversion
              switch (type) {
                //Booleans
                case "boolean": {
                  if (/^(?:[Tt]rue|[Oo]n|[Yy]es|1)$/.test(value))
                    return true
                  if (/^(?:[Ff]alse|[Oo]ff|[Nn]o|0)$/.test(value))
                    return false
                  return defaulted
                }
                //Numbers
                case "number": {
                  value = Number(value)
                  if (!Number.isFinite(value))
                    value = defaulted
                  if (Number.isFinite(min))
                    value = Math.max(min, value)
                  if (Number.isFinite(max))
                    value = Math.min(value, max)
                  return value
                }
                //Array
                case "array": {
                  try {
                    value = decodeURIComponent(value)
                  }
                  catch {
                    logger(`metrics/inputs > failed to decode uri : ${value}`)
                    value = defaulted
                  }
                  const separators = {"comma-separated":",", "space-separated":" "}
                  const separator = separators[[format].flat().filter(s => s in separators)[0]] ?? ","
                  return value.split(separator).map(v => replacer(v).toLocaleLowerCase()).filter(v => Array.isArray(values) ? values.includes(v) : true).filter(v => v)
                }
                //String
                case "string": {
                  value = replacer(value)
                  if ((Array.isArray(values)) && (!values.includes(value)))
                    return defaulted
                  return value
                }
                //JSON
                case "json": {
                  if (typeof value === "object")
                    return value
                  try {
                    value = JSON.parse(value)
                  }
                  catch (error) {
                    try {
                      value = JSON.parse(decodeURIComponent(value))
                    }
                    catch (error) {
                      logger(`metrics/inputs > failed to parse json : ${value}`)
                      value = JSON.parse(defaulted)
                    }
                  }
                  return value
                }
                //Token
                case "token": {
                  return value
                }
                //Default
                default: {
                  return value
                }
              }
            })(defaults[key] ?? defaulted),
          ]),
        )
        logger(`metrics/inputs > ${name} > ${JSON.stringify(result)}`)
        return result
      }
      Object.assign(meta.inputs, inputs, Object.fromEntries(Object.entries(inputs).map(([key, value]) => [metadata.to.query(key, {name}), value])))
    }

    //Action metadata
    {
      //Extract comments
      const comments = {}
      raw.split(/(?:\r?\n){2,}/m)
        .map(x => x.trim()).filter(x => x)
        .map(x => x.split("\n").map(y => y.trim()).join("\n"))
        .map(x => {
          const input = x.match(new RegExp(`^\\s*(?<input>${Object.keys(inputs).join("|")}):`, "m"))?.groups?.input ?? null
          if (input)
            comments[input] = x.match(new RegExp(`(?<comment>[\\s\\S]*?)(?=(?:${Object.keys(inputs).sort((a, b) => b.length - a.length).join("|")}):)`))?.groups?.comment
        })

      //Action descriptor
      meta.action = Object.fromEntries(
        Object.entries(inputs).map(([key, value]) => [
          key,
          {
            comment:comments[key] ?? `# ${value.description}`,
            descriptor:yaml.dump({[key]:Object.fromEntries(Object.entries(value).filter(([key]) => ["description", "default", "required"].includes(key)))}, {quotingType:'"', noCompatMode:true}),
          },
        ]),
      )

      //Action inputs
      meta.inputs.action = function({core}) {
        //Build query object from inputs
        const q = {}
        for (const key of Object.keys(inputs)) {
          const value = `${core.getInput(key)}`.trim()
          try {
            q[key] = decodeURIComponent(value)
          }
          catch {
            logger(`metrics/inputs > failed to decode uri : ${value}`)
            q[key] = value
          }
        }
        return meta.inputs({q, account:"bypass"})
      }
    }

    //Web metadata
    {
      meta.web = Object.fromEntries(
        Object.entries(inputs).map(([key, {type, description:text, example, default:defaulted, min = 0, max = 9999, values}]) => [
          //Format key
          metadata.to.query(key),
          //Value descriptor
          (() => {
            switch (type) {
              case "boolean":
                return {text, type:"boolean", defaulted:/^(?:[Tt]rue|[Oo]n|[Yy]es|1)$/.test(defaulted) ? true : /^(?:[Ff]alse|[Oo]ff|[Nn]o|0)$/.test(defaulted) ? false : defaulted}
              case "number":
                return {text, type:"number", min, max, defaulted}
              case "array":
                return {text, type:"text", placeholder:example ?? defaulted, defaulted}
              case "string": {
                if (Array.isArray(values))
                  return {text, type:"select", values, defaulted}
                return {text, type:"text", placeholder:example ?? defaulted, defaulted}
              }
              case "json":
                return {text, type:"text", placeholder:example ?? defaulted, defaulted}
              default:
                return null
            }
          })(),
        ]).filter(([key, value]) => (value) && (key !== name)),
      )
    }

    //Readme metadata
    {
      //Extract demos
      const raw = `${await fs.promises.readFile(path.join(__plugins, name, "README.md"), "utf-8")}`
      const demo = raw.match(/(?<demo><table>[\s\S]*?<[/]table>)/)?.groups?.demo?.replace(/<[/]?(?:table|tr)>/g, "")?.trim() ?? "<td></td>"

      //Options table
      let flags = new Set()
      const table = [
        "| Option | Type *(format)* **[default]** *{allowed values}* | Description |",
        "| ------ | -------------------------------- | ----------- |",
        Object.entries(inputs).map(([option, {description, type, ...o}]) => {
          let row = []
          {
            let cell = []
            if (o.required) {
              cell.push("✔️")
              flags.add("required")
            }
            if (type === "token") {
              cell.push("🔐")
              flags.add("secret")
            }
            if (o.inherits) {
              cell.push("⏩")
              flags.add("inherits")
            }
            if (o.global) {
              cell.push("⏭️")
              flags.add("global")
            }
            if (o.testing) {
              cell.push("🔧")
              flags.add("testing")
            }
            if (!Object.keys(previous?.inputs ?? {}).includes(option)) {
              cell.push("✨")
              flags.add("beta")
            }
            if (o.extras) {
              cell.push("🧰")
              flags.add("extras")
            }
            cell = cell.map(flag => `<sup>${flag}</sup>`)
            cell.unshift(`${"`"}${option}${"`"}`)
            row.push(cell.join(" "))
          }
          {
            const cell = [`${"`"}${type}${"`"}`]
            if ("format" in o)
              cell.push(`*(${Array.isArray(o.format) ? o.format[0] : o.format})*`)
            if ("default" in o) {
              let text = o.default
              if (o.default === ".user.login")
                text = "*→ User login*"
              if (o.default === ".user.twitter")
                text = "*→ User attached twitter*"
              if (o.default === ".user.website")
                text = "*→ User attached website*"
              cell.push(`**[${text}]**`)
            }
            if ("values" in o)
              cell.push(`*{${o.values.map(value => `"${value}"`).join(", ")}}*`)
            if ("min" in o)
              cell.push(`*{${o.min} ≤`)
            if (("min" in o)||("max" in o))
              cell.push(`${"min" in o ? "" : "*{"}𝑥${"max" in o ? "" : "}*"}`)
            if ("max" in o)
              cell.push(`≤ ${o.max}}*`)
            row.push(cell.join(" "))
          }
          row.push(description)
          return `| ${row.join(" | ")} |`
        }).join("\n"),
        "\n",
        flags.size ? "Legend for option icons:" : "",
        flags.has("required") ? "* ✔️ Value must be provided" : "",
        flags.has("secret") ? "* 🔐 Value should be stored in repository secrets" : "",
        flags.has("inherits") ? "* ⏩ Value inherits from its related global-level option" : "",
        flags.has("global") ? "* ⏭️ Value be inherited by its related plugin-level option" : "",
        flags.has("testing") ? "* 🔧 For development purposes, use with caution" : "",
        flags.has("beta") ? "* ✨ Currently in beta-testing on `master`/`main`" : "",
        flags.has("extras") ? "* 🧰 Must be enabled in `settings.json` (for web instances)" : "",
      ].flat(Infinity).filter(s => s).join("\n")

      //Readme descriptor
      meta.readme = {demo, table}
    }

    //Icon
    meta.icon = meta.name.split(" ")[0] ?? null

    //Result
    return meta
  }
  catch (error) {
    logger(`metrics/metadata > failed to load plugin ${name}: ${error}`)
    return null
  }
}

/**Metadata extractor for templates */
metadata.template = async function({__templates, name, plugins, logger}) {
  try {
    //Load meta descriptor
    const raw = fs.existsSync(path.join(__templates, name, "metadata.yml")) ? `${await fs.promises.readFile(path.join(__templates, name, "metadata.yml"), "utf-8")}` : ""
    const readme = fs.existsSync(path.join(__templates, name, "README.md")) ? `${await fs.promises.readFile(path.join(__templates, name, "README.md"), "utf-8")}` : ""
    const meta = yaml.load(raw) ?? {}

    //Compatibility
    const partials = path.join(__templates, name, "partials")
    const compatibility = Object.fromEntries(Object.entries(plugins).map(([key]) => [key, false]))
    if ((fs.existsSync(partials)) && ((await fs.promises.lstat(partials)).isDirectory())) {
      for (let plugin of await fs.promises.readdir(partials)) {
        plugin = plugin.match(/(?<plugin>^[\s\S]+(?=[.]ejs$))/)?.groups?.plugin ?? null
        if (plugin in compatibility)
          compatibility[plugin] = true
      }
    }

    //Demo for main and individual readmes
    function demo({colspan = null} = {}) {
      return [
        `    <td ${colspan ? `colspan="${colspan}"` : ""} align="center">`,
        `${Object.entries(meta.examples ?? {}).map(([text, link]) => {
          let img = `<img src="${link}" alt=""></img>`
          if (text !== "default") {
            const open = text.charAt(0) === "+" ? " open" : ""
            img = `<details><summary${open}>${open ? text.substring(1) : text}</summary>${img}</details>`
          }
          return `      ${img}`
        }).join("\n")}`,
        `      <img width="900" height="1" alt="">`,
        `    </td>`
      ].join("\n")
    }

    //Header table
    const header = [
      "<table>",
      `  <tr><th colspan="2"><h3>${meta.name ?? "(unnamed template)"}</h3></th></tr>`,
      `  <tr><td colspan="2" align="center">${(meta.description ?? "").replaceAll("\n", "<br>")}</td></tr>`,
      `  <tr>`,
      `    <th rowspan="3">Supported features<br><sub><a href="metadata.yml">→ Full specification</a></sub></th>`,
      `    <td>${Object.entries(compatibility).filter(([_, value]) => value).map(([id]) => `<a href="/source/plugins/${id}" title="${plugins[id].name}">${plugins[id].icon}</a>`).join(" ")}${meta.formats?.includes("markdown") ? " <code>✓ embed()</code>" : ""}</td>`,
      `  </tr>`,
      `  <tr>`,
      `    <td>${[
        meta.supports?.includes("user") ? "👤 Users" : "",
        meta.supports?.includes("organization") ? "👥 Organizations" : "",
        meta.supports?.includes("repository") ? "📓 Repositories" : ""
      ].filter(v => v).join(", ")}</td>`,
      `  </tr>`,
      `  <tr>`,
      `    <td>${[
        meta.formats?.includes("svg") ? "*️⃣ SVG" : "",
        meta.formats?.includes("png") ? "*️⃣ PNG" : "",
        meta.formats?.includes("jpeg") ? "*️⃣ JPEG" : "",
        meta.formats?.includes("json") ? "#️⃣ JSON" : "",
        meta.formats?.includes("markdown") ? "🔠 Markdown" : "",
        meta.formats?.includes("markdown-pdf") ? "🔠 Markdown (PDF)" : "",
      ].filter(v => v).join(", ")}</td>`,
      `  </tr>`,
      `  <tr>`,
      demo({colspan:2}),
      `  </tr>`,
      "</table>"
    ].join("\n")

    //Result
    return {
      name:meta.name ?? "(unnamed template)",
      description:meta.description ?? "",
      index:meta.index ?? null,
      formats:meta.formats ?? null,
      supports:meta.supports ?? null,
      readme:{
        demo:demo(),
        compatibility:{
          ...Object.fromEntries(Object.entries(compatibility).filter(([_, value]) => value)),
          ...Object.fromEntries(Object.entries(compatibility).filter(([_, value]) => !value).map(([key, value]) => [key, meta.formats?.includes("markdown") ? "embed" : value])),
          base:true
        },
        header
      },
      check({q, account = "bypass", format = null}) {
        //Support check
        if (account !== "bypass") {
          const context = q.repo ? "repository" : account
          if ((Array.isArray(this.supports)) && (!this.supports.includes(context)))
            throw new Error(`not supported for: ${context}`)
        }
        //Format check
        if ((format) && (Array.isArray(this.formats)) && (!this.formats.includes(format)))
          throw new Error(`not supported for: ${format}`)
      },
    }
  }
  catch (error) {
    logger(`metrics/metadata > failed to load template ${name}: ${error}`)
    return null
  }
}

/**Metadata converters */
metadata.to = {
  query(key, {name = null} = {}) {
    key = key.replace(/^plugin_/, "").replace(/_/g, ".")
    return name ? key.replace(new RegExp(`^(${name}.)`, "g"), "") : key
  },
}
