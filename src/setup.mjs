//Imports
  import fs from "fs"
  import path from "path"

/** Setup */
  export default async function ({log = true} = {}) {

    //Init
      const logger = log ? console.debug : () => null
      logger(`metrics/setup > setup`)
      const templates = "src/templates"
      const conf = {
        templates:{},
        settings:{},
        statics:path.resolve("src/html"),
        node_modules:path.resolve("node_modules"),
      }

    //Load settings
      logger(`metrics/setup > load settings.json`)
      if (fs.existsSync(path.resolve("settings.json"))) {
        conf.settings = JSON.parse(`${await fs.promises.readFile(path.resolve("settings.json"))}`)
        logger(`metrics/setup > load settings.json > success`)
      }
      else
        logger(`metrics/setup > load settings.json > (missing)`)
      if (!conf.settings.templates)
        conf.settings.templates = {default:"classic", enabled:[]}
      if (!conf.settings.plugins)
        conf.settings.plugins = {}
      if (conf.settings.debug)
        logger(conf.settings)

    //Load package settings
      logger(`metrics/setup > load package.json`)
      if (fs.existsSync(path.resolve("package.json"))) {
        conf.package = JSON.parse(`${await fs.promises.readFile(path.resolve("package.json"))}`)
        logger(`metrics/setup > load package.json > success`)
      }
      else {
        logger(`metrics/setup > load package.json > (missing)`)
        conf.package = {version:"<#version>"}
      }

    //Load templates
      if (fs.existsSync(path.resolve(templates))) {
        for (const name of await fs.promises.readdir(templates)) {
          //Cache templates
            if (/.*[.]mjs$/.test(name))
              continue
            logger(`metrics/setup > load template [${name}]`)
            const files = [
              `${templates}/${name}/query.graphql`,
              `${templates}/${name}/image.svg`,
              `${templates}/${name}/placeholder.svg`,
              `${templates}/${name}/style.css`,
            ]
            const [query, image, placeholder, style] = await Promise.all(files.map(async file => `${await fs.promises.readFile(path.resolve(file))}`))
            conf.templates[name] = {query, image, placeholder, style}
            logger(`metrics/setup > load template [${name}] > success`)
          //Debug
            if (conf.settings.debug) {
              Object.defineProperty(conf.templates, name, {
                get() {
                  logger(`metrics/setup > reload template [${name}]`)
                  const [query, image, placeholder, style] = files.map(file => `${fs.readFileSync(path.resolve(file))}`)
                  logger(`metrics/setup > reload template [${name}] > success`)
                  return {query, image, placeholder, style}
                }
              })
            }
        }
      }
      else {
        logger(`metrics/setup > load templates from build`)
        conf.templates = JSON.parse(Buffer.from(`<#assets>`, "base64").toString("utf8"))
      }

    //Conf
      logger(`metrics/setup > setup > success`)
      return conf

  }