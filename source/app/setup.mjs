//Imports
  import fs from "fs"
  import path from "path"
  import util from "util"
  import url from "url"
  const Templates = {}
  const Plugins = {}

/** Setup */
  export default async function ({log = true, nosettings = false} = {}) {

    //Paths
      const __metrics = path.join(path.dirname(url.fileURLToPath(import.meta.url)), "../..")
      const __statics = path.join(__metrics, "source/app/web/statics")
      const __templates = path.join(__metrics, "source/templates")
      const __plugins = path.join(__metrics, "source/plugins")
      const __queries = path.join(__metrics, "source/queries")
      const __package = path.join(__metrics, "package.json")
      const __settings = path.join(__metrics, "settings.json")
      const __modules = path.join(__metrics, "node_modules")

    //Init
      const logger = log ? console.debug : () => null
      logger(`metrics/setup > setup`)
      const conf = {
        templates:{},
        queries:{},
        settings:{},
        statics:__statics,
        node_modules:__modules,
      }

    //Load settings
      logger(`metrics/setup > load settings.json`)
      if (fs.existsSync(__settings)) {
        if (nosettings)
          logger(`metrics/setup > load settings.json > skipped because no settings is enabled`)
        else {
          conf.settings = JSON.parse(`${await fs.promises.readFile(__settings)}`)
          logger(`metrics/setup > load settings.json > success`)
        }
      }
      else
        logger(`metrics/setup > load settings.json > (missing)`)
      if (!conf.settings.templates)
        conf.settings.templates = {default:"classic", enabled:[]}
      if (!conf.settings.plugins)
        conf.settings.plugins = {}
      conf.settings.plugins.base = {parts:["header", "activity", "community", "repositories", "metadata"]}
      if (conf.settings.debug)
        logger(util.inspect(conf.settings, {depth:Infinity, maxStringLength:256}))

    //Load package settings
      logger(`metrics/setup > load package.json`)
      conf.package = JSON.parse(`${await fs.promises.readFile(__package)}`)
      logger(`metrics/setup > load package.json > success`)

    //Load templates
      for (const name of await fs.promises.readdir(__templates)) {
        //Cache templates file
          if (!(await fs.promises.lstat(path.join(__templates, name))).isDirectory())
            continue
          logger(`metrics/setup > load template [${name}]`)
          const files = ["image.svg", "style.css", "fonts.css"].map(file => path.join(__templates, (fs.existsSync(path.join(__templates, name, file)) ? name : "classic"), file))
          const [image, style, fonts] = await Promise.all(files.map(async file => `${await fs.promises.readFile(file)}`))
          conf.templates[name] = {image, style, fonts}
        //Cache templates scripts
          Templates[name] = (await import(url.pathToFileURL(path.join(__templates, name, "template.mjs")).href)).default
          logger(`metrics/setup > load template [${name}] > success`)
        //Debug
          if (conf.settings.debug) {
            Object.defineProperty(conf.templates, name, {
              get() {
                logger(`metrics/setup > reload template [${name}]`)
                const [image, style, fonts] = files.map(file => `${fs.readFileSync(file)}`)
                logger(`metrics/setup > reload template [${name}] > success`)
                return {image, style, fonts}
              }
            })
          }
      }

    //Load plugins
      for (const name of await fs.promises.readdir(__plugins)) {
        //Cache plugins scripts
          logger(`metrics/setup > load plugin [${name}]`)
          Plugins[name] = (await import(url.pathToFileURL(path.join(__plugins, name, "index.mjs")).href)).default
          logger(`metrics/setup > load plugin [${name}] > success`)
      }

    //Load queries
      for (const query of await fs.promises.readdir(__queries)) {
        //Cache queries
          const name = query.replace(/[.]graphql$/, "")
          logger(`metrics/setup > load query [${name}]`)
          conf.queries[`_${name}`] = `${await fs.promises.readFile(path.join(__queries, query))}`
          logger(`metrics/setup > load query [${name}] > success`)
        //Debug
          if (conf.settings.debug) {
            Object.defineProperty(conf.queries, `_${name}`, {
              get() {
                logger(`metrics/setup > reload query [${name}]`)
                const raw = `${fs.readFileSync(path.join(__queries, query))}`
                logger(`metrics/setup > reload query [${name}] > success`)
                return raw
              }
            })
          }
      }

    //Create queries formatters
      Object.keys(conf.queries).map(name => conf.queries[name.substring(1)] = (vars = {}) => {
        let query = conf.queries[name]
        for (const [key, value] of Object.entries(vars))
          query = query.replace(new RegExp(`[$]${key}`, "g"), value)
        return query
      })

    //Conf
      logger(`metrics/setup > setup > success`)
      return {Templates, Plugins, conf}

  }