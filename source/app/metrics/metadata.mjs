//Imports
  import fs from "fs"
  import path from "path"
  import url from "url"
  import yaml from "js-yaml"

//Defined categories
  const categories = ["core", "github", "social", "other"]

/**Metadata descriptor parser */
  export default async function metadata({log = true} = {}) {
    //Paths
      const __metrics = path.join(path.dirname(url.fileURLToPath(import.meta.url)), "../../..")
      const __templates = path.join(__metrics, "source/templates")
      const __plugins = path.join(__metrics, "source/plugins")
      const __package = path.join(__metrics, "package.json")

    //Init
      const logger = log ? console.debug : () => null

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
      Plugins = Object.fromEntries(Object.entries(Plugins).sort(([_an, a], [_bn, b]) => a.categorie === b.categorie ? (a.index ?? Infinity) - (b.index ?? Infinity) : categories.indexOf(a.categorie) - categories.indexOf(b.categorie)))
      logger(`metrics/metadata > loaded [${Object.keys(Plugins).join(", ")}]`)
    //Load templates metadata
      let Templates = {}
      logger("metrics/metadata > loading templates metadata")
      for (const name of await fs.promises.readdir(__templates)) {
        if (!(await fs.promises.lstat(path.join(__templates, name))).isDirectory())
          continue
        if (/^@/.test(name))
          continue
        logger(`metrics/metadata > loading template metadata [${name}]`)
        Templates[name] = await metadata.template({__templates, name, plugins, logger})
      }
    //Reorder keys
      const {classic, repository, markdown, community, ...templates} = Templates
      Templates = {classic, repository, ...templates, markdown, community}

    //Packaged metadata
      const packaged = JSON.parse(`${await fs.promises.readFile(__package)}`)

    //Metadata
      return {plugins:Plugins, templates:Templates, packaged}
  }

/**Metadata extractor for templates */
  metadata.plugin = async function({__plugins, name, logger}) {
    try {
      //Load meta descriptor
        const raw = `${await fs.promises.readFile(path.join(__plugins, name, "metadata.yml"), "utf-8")}`
        const {inputs, ...meta} = yaml.load(raw)

      //Categorie
        if (!categories.includes(meta.categorie))
          meta.categorie = "other"

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
            //Inputs checks
              const result = Object.fromEntries(Object.entries(inputs).map(([key, {type, format, default:defaulted, min, max, values}]) => [
                //Format key
                  metadata.to.query(key, {name}),
                //Format value
                  (defaulted => {
                    //Default value
                      let value = q[metadata.to.query(key)] ?? q[key] ?? defaulted
                    //Apply type conversion
                      switch (type) {
                        //Booleans
                          case "boolean":{
                            if (/^(?:[Tt]rue|[Oo]n|[Yy]es|1)$/.test(value))
                              return true
                            if (/^(?:[Ff]alse|[Oo]ff|[Nn]o|0)$/.test(value))
                              return false
                            return defaulted
                          }
                        //Numbers
                          case "number":{
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
                          case "array":{
                            try {
                              value = decodeURIComponent(value)
                            }
                            catch {
                              logger(`metrics/inputs > failed to decode uri : ${value}`)
                              value = defaulted
                            }
                            const separators = {"comma-separated":",", "space-separated":" "}
                            const separator = separators[[format].flat().filter(s => s in separators)[0]] ?? ","
                            return value.split(separator).map(v => v.trim().toLocaleLowerCase()).filter(v => Array.isArray(values) ? values.includes(v) : true).filter(v => v)
                          }
                        //String
                          case "string":{
                            value = `${value}`.trim()
                            if (user) {
                              if (value === ".user.login")
                                return user.login
                              if (value === ".user.twitter")
                                return user.twitterUsername
                              if (value === ".user.website")
                                return user.websiteUrl
                            }
                            if ((Array.isArray(values))&&(!values.includes(value)))
                              return defaulted
                            return value
                          }
                        //JSON
                          case "json":{
                            try {
                              value = JSON.parse(value)
                            }
                            catch {
                              logger(`metrics/inputs > failed to parse json : ${value}`)
                              value = JSON.parse(defaulted)
                            }
                            return value
                          }
                        //Token
                          case "token":{
                            return value
                          }
                        //Default
                          default:{
                            return value
                          }
                      }
                  })(defaults[key] ?? defaulted),
              ]))
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
            meta.action = Object.fromEntries(Object.entries(inputs).map(([key, value]) => [
              key,
              {
                comment:comments[key] ?? "",
                descriptor:yaml.dump({[key]:Object.fromEntries(Object.entries(value).filter(([key]) => ["description", "default", "required"].includes(key)))}, {quotingType:'"', noCompatMode:true}),
              },
            ]))

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
          meta.web = Object.fromEntries(Object.entries(inputs).map(([key, {type, description:text, example, default:defaulted, min = 0, max = 9999, values}]) => [
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
                  case "string":{
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
          ]).filter(([key, value]) => (value)&&(key !== name)))
        }

      //Readme metadata
        {
          //Extract demos
            const raw = `${await fs.promises.readFile(path.join(__plugins, name, "README.md"), "utf-8")}`
            const demo = raw.match(/(?<demo><table>[\s\S]*?<[/]table>)/)?.groups?.demo?.replace(/<[/]?(?:table|tr)>/g, "")?.trim() ?? "<td></td>"

          //Readme descriptor
            meta.readme = {demo}
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
        const raw = `${await fs.promises.readFile(path.join(__templates, name, "README.md"), "utf-8")}`

      //Compatibility
        const partials = path.join(__templates, name, "partials")
        const compatibility = Object.fromEntries(Object.entries(plugins).map(([key]) => [key, false]))
        if ((fs.existsSync(partials))&&((await fs.promises.lstat(partials)).isDirectory())) {
          for (let plugin of await fs.promises.readdir(partials)) {
            plugin = plugin.match(/(?<plugin>^[\s\S]+(?=[.]ejs$))/)?.groups?.plugin ?? null
            if (plugin in compatibility)
              compatibility[plugin] = true
          }
        }

      //Result
        return {
          name:raw.match(/^### (?<name>[\s\S]+?)\n/)?.groups?.name?.trim(),
          readme:{
            demo:raw.match(/(?<demo><table>[\s\S]*?<[/]table>)/)?.groups?.demo?.replace(/<[/]?(?:table|tr)>/g, "")?.trim() ?? (name === "community" ? '<td align="center" colspan="2">See <a href="/source/templates/community/README.md">documentation</a> 🌍</td>' : "<td></td>"),
            compatibility:{...compatibility, base:true},
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
