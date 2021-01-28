//Imports
  import fs from "fs"
  import path from "path"
  import yaml from "js-yaml"
  import url from "url"

/** Metadata descriptor parser */
  export default async function metadata() {
    //Paths
      const __metrics = path.join(path.dirname(url.fileURLToPath(import.meta.url)), "../../..")
      const __templates = path.join(__metrics, "source/templates")
      const __plugins = path.join(__metrics, "source/plugins")

    //Load plugins metadata
      let Plugins = {}
      console.debug(`metrics/metadata > loading plugins metadata`)
      for (const name of await fs.promises.readdir(__plugins)) {
        if (!(await fs.promises.lstat(path.join(__plugins, name))).isDirectory())
          continue
        console.debug(`metrics/metadata > loading plugin metadata [${name}]`)
        Plugins[name] = await metadata.plugin({__plugins, name})
      }
    //Reorder keys
      const {base, core, ...plugins} = Plugins
      Plugins = {base, core, ...plugins}

    //Load templates metadata
      let Templates = {}
      console.debug(`metrics/metadata > loading templates metadata`)
      for (const name of await fs.promises.readdir(__templates)) {
        if (!(await fs.promises.lstat(path.join(__templates, name))).isDirectory())
          continue
        if (/^@/.test(name))
          continue
        console.debug(`metrics/metadata > loading template metadata [${name}]`)
        Templates[name] = await metadata.template({__templates, name, plugins})
      }
    //Reorder keys
      const {classic, repository, community, ...templates} = Templates
      Templates = {classic, repository, ...templates, community}

    //Metadata
      return {plugins:Plugins, templates:Templates}
  }

/** Metadata extractor for templates */
  metadata.plugin = async function ({__plugins, name}) {
    try {
      //Load meta descriptor
        const raw = `${await fs.promises.readFile(path.join(__plugins, name, "metadata.yml"), "utf-8")}`
        const {inputs, ...meta} = yaml.load(raw)

      //Inputs parser
        {
          meta.inputs = function ({data:{user}, q, account}, defaults = {}) {
            //Support check
              if (account !== "bypass") {
                if (!meta.supports?.includes(account))
                  throw {error:{message:`Not supported for: ${account}`, instance:new Error()}}
                if ((q.repo)&&(!meta.supports?.includes("repository")))
                  throw {error:{message:`Not supported for: ${account} repositories`, instance:new Error()}}
              }
            //Inputs checks
              const result = Object.fromEntries(Object.entries(inputs).map(([key, {type, default:defaulted, min, max, values}]) => [
                //Format key
                  key.replace(/^plugin_/, "").replace(/_/g, ".").replace(new RegExp(`^(${name}.)`, "g"), ""),
                //Format value
                  (defaulted => {
                    //Default value
                      let value = q[key.replace(/^plugin_/, "").replace(/_/g, ".")] ?? defaulted
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
                              console.debug(`metrics/inputs > failed to decode uri : ${value}`)
                              value = defaulted
                            }
                            return value.split(",").map(v => v.trim().toLocaleLowerCase()).filter(v => Array.isArray(values) ? values.includes(v) : true)
                          }
                        //String
                          case "string":{
                            value = value.trim()
                            if (value === ".user.login")
                              return user.login
                            if (value === ".user.twitter")
                              return user.twitterUsername
                            if (value === ".user.website")
                              return user.websiteUrl
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
                              console.debug(`metrics/inputs > failed to parse json : ${value}`)
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
                  })(defaults[key] ?? defaulted)
              ]))
              console.debug(`metrics/inputs > ${name} > ${JSON.stringify(result)}`)
              return result
          }
        }

      //Action metadata
        {
          //Extract comments
            const comments = {}
            raw.split(/(\r?\n){2,}/m)
              .map(x => x.trim()).filter(x => x)
              .map(x => x.split("\n").map(y => y.trim()).join("\n"))
              .map(x => {
                const input = x.match(new RegExp(`^\\s*(?<input>${Object.keys(inputs).join("|")}):`, "m"))?.groups?.input ?? null
                if (input)
                  comments[input] = x.match(new RegExp(`(?<comment>[\\s\\S]*)(?=(?:${Object.keys(inputs).join("|")}):)`))?.groups?.comment
              })

          //Action descriptor
            meta.action = Object.fromEntries(Object.entries(inputs).map(([key, value]) => [
              key,
              {
                comment:comments[key] ?? "",
                descriptor:yaml.dump({[key]:Object.fromEntries(Object.entries(value).filter(([key]) => ["description", "default", "required"].includes(key)))})
              }
            ]))
        }

      //Web metadata
        {
          meta.web = Object.fromEntries(Object.entries(inputs).map(([key, {type, description:text, example, default:defaulted, min = 0, max = 9999, values}]) => [
            //Format key
              key.replace(/^plugin_/, "").replace(/_/g, "."),
            //Value descriptor
              (() => {
                switch (type) {
                  case "boolean":
                    return {text, type:"boolean"}
                  case "number":
                    return {text, type:"number", min, max, defaulted}
                  case "array":
                    return {text, type:"text", placeholder:example ?? defaulted, defaulted}
                  case "string":{
                    if (Array.isArray(values))
                      return {text, type:"select", values}
                    else
                      return {text, type:"text", placeholder:example ?? defaulted, defaulted}
                  }
                  case "json":
                    return {text, type:"text", placeholder:example ?? defaulted, defaulted}
                  default:
                    return null
                }
              })()
          ]).filter(([key, value]) => (value)&&(key !== name)))
        }

      //Readme metadata
        {
          //Extract demos
            const raw = `${await fs.promises.readFile(path.join(__plugins, name, "README.md"), "utf-8")}`
            const demo = raw.match(/(?<demo><table>[\s\S]*?<[/]table>)/)?.groups?.demo?.replace(/<[/]?(?:table|tr)>/g, "")?.trim() ?? null

          //Readme descriptor
            meta.readme = {demo}
        }

      //Icon
        meta.icon = meta.name.split(" ")[0] ?? null

      //Result
        return meta
    }
    catch (error) {
      console.debug(`metrics/metadata > failed to load plugin ${name}: ${error}`)
      return null
    }
  }

/** Metadata extractor for templates */
  metadata.template = async function ({__templates, name, plugins}) {
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
          name:raw.match(/^### (?<name>[\s\S]+?)\n/)?.groups?.name?.trim() ?? "",
          readme:{
            demo:raw.match(/(?<demo><table>[\s\S]*?<[/]table>)/)?.groups?.demo ?? null,
            compatibility:{...compatibility, base:true},
          }
        }
    }
    catch (error) {
      console.debug(`metrics/metadata > failed to load template ${name}: ${error}`)
      return null
    }
  }
