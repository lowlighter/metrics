//Imports
  import fs from "fs"
  import metadata from "./metadata.mjs"
  import path from "path"
  import processes from "child_process"
  import util from "util"
  import url from "url"

//Templates and plugins
  const Templates = {}
  const Plugins = {}

/**Setup */
  export default async function({log = true, nosettings = false, community = {}} = {}) {

    //Paths
      const __metrics = path.join(path.dirname(url.fileURLToPath(import.meta.url)), "../../..")
      const __statics = path.join(__metrics, "source/app/web/statics")
      const __templates = path.join(__metrics, "source/templates")
      const __plugins = path.join(__metrics, "source/plugins")
      const __package = path.join(__metrics, "package.json")
      const __settings = path.join(__metrics, "settings.json")
      const __modules = path.join(__metrics, "node_modules")

    //Init
      const logger = log ? console.debug : () => null
      logger("metrics/setup > setup")
      const conf = {
        templates:{},
        queries:{},
        settings:{},
        metadata:{},
        paths:{
          statics:__statics,
          templates:__templates,
          node_modules:__modules,
        },
      }

    //Load settings
      logger("metrics/setup > load settings.json")
      if (fs.existsSync(__settings)) {
        if (nosettings)
          logger("metrics/setup > load settings.json > skipped because no settings is enabled")
        else {
          conf.settings = JSON.parse(`${await fs.promises.readFile(__settings)}`)
          logger("metrics/setup > load settings.json > success")
        }
      }
      else
        logger("metrics/setup > load settings.json > (missing)")
      if (!conf.settings.templates)
        conf.settings.templates = {default:"classic", enabled:[]}
      if (!conf.settings.plugins)
        conf.settings.plugins = {}
      conf.settings.community = {...conf.settings.community, ...community}
      conf.settings.plugins.base = {parts:["header", "activity", "community", "repositories", "metadata"]}
      if (conf.settings.debug)
        logger(util.inspect(conf.settings, {depth:Infinity, maxStringLength:256}))

    //Load package settings
      logger("metrics/setup > load package.json")
      conf.package = JSON.parse(`${await fs.promises.readFile(__package)}`)
      logger("metrics/setup > load package.json > success")

    //Load community templates
      if ((typeof conf.settings.community.templates === "string")&&(conf.settings.community.templates.length)) {
        logger("metrics/setup > parsing community templates list")
        conf.settings.community.templates = [...new Set([...decodeURIComponent(conf.settings.community.templates).split(",").map(v => v.trim().toLocaleLowerCase()).filter(v => v)])]
      }
      if ((Array.isArray(conf.settings.community.templates))&&(conf.settings.community.templates.length)) {
        //Clean remote repository
          logger(`metrics/setup > ${conf.settings.community.templates.length} community templates to install`)
          await fs.promises.rmdir(path.join(__templates, ".community"), {recursive:true})
        //Download community templates
          for (const template of conf.settings.community.templates) {
            try {
              //Parse community template
                logger(`metrics/setup > load community template ${template}`)
                const {repo, branch, name, trust = false} = template.match(/^(?<repo>[\s\S]+?)@(?<branch>[\s\S]+?):(?<name>[\s\S]+?)(?<trust>[+]trust)?$/)?.groups ?? null
                const command = `git clone --single-branch --branch ${branch} https://github.com/${repo}.git ${path.join(__templates, ".community")}`
                logger(`metrics/setup > run ${command}`)
              //Clone remote repository
                processes.execSync(command, {stdio:"ignore"})
              //Extract template
                logger(`metrics/setup > extract ${name} from ${repo}@${branch}`)
                await fs.promises.rmdir(path.join(__templates, `@${name}`), {recursive:true})
                await fs.promises.rename(path.join(__templates, ".community/source/templates", name), path.join(__templates, `@${name}`))
              //JavaScript file
                if (trust)
                  logger(`metrics/setup > keeping @${name}/template.mjs (unsafe mode is enabled)`)
                else if (fs.existsSync(path.join(__templates, `@${name}`, "template.mjs"))) {
                  logger(`metrics/setup > removing @${name}/template.mjs`)
                  await fs.promises.unlink(path.join(__templates, `@${name}`, "template.mjs"))
                }
                else
                  logger(`metrics/setup > @${name}/template.mjs does not exist`)
              //Clean remote repository
                logger(`metrics/setup > clean ${repo}@${branch}`)
                await fs.promises.rmdir(path.join(__templates, ".community"), {recursive:true})
                logger(`metrics/setup > loaded community template ${name}`)
            }
 catch (error) {
              logger(`metrics/setup > failed to load community template ${template}`)
              logger(error)
            }
          }
      }
      else
        logger("metrics/setup > no community templates to install")

    //Load templates
      for (const name of await fs.promises.readdir(__templates)) {
        //Search for templates
          const directory = path.join(__templates, name)
          if ((!(await fs.promises.lstat(directory)).isDirectory())||(!fs.existsSync(path.join(directory, "partials/_.json"))))
            continue
          logger(`metrics/setup > load template [${name}]`)
        //Cache templates files
          const files = ["image.svg", "style.css", "fonts.css"].map(file => path.join(__templates, (fs.existsSync(path.join(directory, file)) ? name : "classic"), file))
          const [image, style, fonts] = await Promise.all(files.map(async file => `${await fs.promises.readFile(file)}`))
          const partials = JSON.parse(`${await fs.promises.readFile(path.join(directory, "partials/_.json"))}`)
          conf.templates[name] = {image, style, fonts, partials, views:[directory]}

        //Cache templates scripts
          Templates[name] = await (async() => {
            const template = path.join(directory, "template.mjs")
            const fallback = path.join(__templates, "classic", "template.mjs")
            return (await import(url.pathToFileURL(fs.existsSync(template) ? template : fallback).href)).default
          })()
          logger(`metrics/setup > load template [${name}] > success`)
        //Debug
          if (conf.settings.debug) {
            Object.defineProperty(conf.templates, name, {
              get() {
                logger(`metrics/setup > reload template [${name}]`)
                const [image, style, fonts] = files.map(file => `${fs.readFileSync(file)}`)
                const partials = JSON.parse(`${fs.readFileSync(path.join(directory, "partials/_.json"))}`)
                logger(`metrics/setup > reload template [${name}] > success`)
                return {image, style, fonts, partials, views:[directory]}
              },
            })
          }
      }

    //Load plugins
      for (const name of await fs.promises.readdir(__plugins)) {
        //Search for plugins
          const directory = path.join(__plugins, name)
          if (!(await fs.promises.lstat(directory)).isDirectory())
            continue
        //Cache plugins scripts
          logger(`metrics/setup > load plugin [${name}]`)
          Plugins[name] = (await import(url.pathToFileURL(path.join(directory, "index.mjs")).href)).default
          logger(`metrics/setup > load plugin [${name}] > success`)
        //Register queries
          const __queries = path.join(directory, "queries")
          if (fs.existsSync(__queries)) {
            //Alias for default query
              const queries = function() {
                if (!queries[name])
                  throw new ReferenceError(`Default query for ${name} undefined`)
                return queries[name](...arguments)
              }
              conf.queries[name] = queries
            //Load queries
              for (const file of await fs.promises.readdir(__queries)) {
                //Cache queries
                  const query = file.replace(/[.]graphql$/, "")
                  logger(`metrics/setup > load query [${name}/${query}]`)
                  queries[`_${query}`] = `${await fs.promises.readFile(path.join(__queries, file))}`
                  logger(`metrics/setup > load query [${name}/${query}] > success`)
                //Debug
                  if (conf.settings.debug) {
                    Object.defineProperty(queries, `_${query}`, {
                      get() {
                        logger(`metrics/setup > reload query [${name}/${query}]`)
                        const raw = `${fs.readFileSync(path.join(__queries, file))}`
                        logger(`metrics/setup > reload query [${name}/${query}] > success`)
                        return raw
                      },
                    })
                  }
              }
            //Create queries formatters
              Object.keys(queries).map(query => queries[query.substring(1)] = (vars = {}) => {
                let queried = queries[query]
                for (const [key, value] of Object.entries(vars))
                  queried = queried.replace(new RegExp(`[$]${key}`, "g"), value)
                return queried
              })
          }
      }

    //Load metadata (plugins)
      conf.metadata = await metadata({log})

    //Set no token property
      Object.defineProperty(conf.settings, "notoken", {get() {
 return conf.settings.token === "NOT_NEEDED"
}})

    //Conf
      logger("metrics/setup > setup > success")
      return {Templates, Plugins, conf}

  }
