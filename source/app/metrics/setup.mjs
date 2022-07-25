//Imports
import OctokitRest from "@octokit/rest"
import processes from "child_process"
import fs from "fs"
import yaml from "js-yaml"
import path from "path"
import url from "url"
import util from "util"
import metadata from "./metadata.mjs"

//Templates and plugins
const Templates = {}
const Plugins = {}

/**Setup */
export default async function({log = true, sandbox = false, community = {}, extras = false} = {}) {
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
    authenticated: null,
    templates: {},
    queries: {},
    settings: {port: 3000},
    metadata: {},
    paths: {
      statics: __statics,
      templates: __templates,
      node_modules: __modules,
    },
  }

  //Load settings
  {
    logger("metrics/setup > load settings.json")
    let fd
    try {
      fd = await fs.promises.open(__settings, "r")
      if (sandbox)
        logger("metrics/setup > load settings.json > skipped because in sandbox is enabled")
      else {
        conf.settings = JSON.parse(`${await fs.promises.readFile(fd)}`)
        logger("metrics/setup > load settings.json > success")
      }
    }
    catch (error) {
      if (error?.code === "ENOENT")
        logger("metrics/setup > load settings.json > (missing)")
      else
        logger(`metrics/setup > load settings.json > (error : ${error})`)
    }
    finally {
      await fd?.close()
    }
  }

  if (!conf.settings.templates)
    conf.settings.templates = {default: "classic", enabled: []}
  if (!conf.settings.plugins)
    conf.settings.plugins = {}
  conf.settings.community = {...conf.settings.community, ...community}
  conf.settings.plugins.base = {parts: ["header", "activity", "community", "repositories", "metadata"]}
  if (conf.settings.debug)
    logger(util.inspect(conf.settings, {depth: Infinity, maxStringLength: 256}))

  //Load package settings
  logger("metrics/setup > load package.json")
  conf.package = JSON.parse(`${await fs.promises.readFile(__package)}`)
  logger("metrics/setup > load package.json > success")

  //Load community templates
  if ((conf.settings.extras?.features?.includes?.("metrics.setup.community.templates")) || (conf.settings.extras?.features === true) || (conf.settings.extras?.default) || (extras) || (sandbox)) {
    if ((typeof conf.settings.community.templates === "string") && (conf.settings.community.templates.length)) {
      logger("metrics/setup > parsing community templates list")
      conf.settings.community.templates = [...new Set([...decodeURIComponent(conf.settings.community.templates).split(",").map(v => v.trim().toLocaleLowerCase()).filter(v => v)])]
    }
    if ((Array.isArray(conf.settings.community.templates)) && (conf.settings.community.templates.length)) {
      //Clean remote repository
      logger(`metrics/setup > ${conf.settings.community.templates.length} community templates to install`)
      await fs.promises.rm(path.join(__templates, ".community"), {recursive: true, force: true})
      //Download community templates
      for (const template of conf.settings.community.templates) {
        try {
          //Parse community template
          logger(`metrics/setup > load community template ${template}`)
          const {repo, branch, name, trust = false} = template.match(/^(?<repo>[\s\S]+?)@(?<branch>[\s\S]+?):(?<name>[\s\S]+?)(?<trust>[+]trust)?$/)?.groups ?? null
          const command = `git clone --single-branch --branch ${branch} https://github.com/${repo}.git ${path.join(__templates, ".community")}`
          logger(`metrics/setup > run ${command}`)
          //Clone remote repository
          processes.execSync(command, {stdio: "ignore"})
          //Extract template
          logger(`metrics/setup > extract ${name} from ${repo}@${branch}`)
          await fs.promises.rm(path.join(__templates, `@${name}`), {recursive: true, force: true})
          await fs.promises.rename(path.join(__templates, ".community/source/templates", name), path.join(__templates, `@${name}`))
          //JavaScript file
          if (trust)
            logger(`metrics/setup > keeping @${name}/template.mjs (unsafe mode is enabled)`)
          else if (fs.existsSync(path.join(__templates, `@${name}`, "template.mjs"))) {
            logger(`metrics/setup > removing @${name}/template.mjs`)
            await fs.promises.unlink(path.join(__templates, `@${name}`, "template.mjs"))
            const inherit = yaml.load(`${fs.promises.readFile(path.join(__templates, `@${name}`, "metadata.yml"))}`).extends ?? null
            if (inherit) {
              logger(`metrics/setup > @${name} extends from ${inherit}`)
              if (fs.existsSync(path.join(__templates, inherit, "template.mjs"))) {
                logger(`metrics/setup > @${name} extended from ${inherit}`)
                await fs.promises.copyFile(path.join(__templates, inherit, "template.mjs"), path.join(__templates, `@${name}`, "template.mjs"))
              }
              else {
                logger(`metrics/setup > @${name} could not extends ${inherit} as it does not exist`)
              }
            }
          }
          else {
            logger(`metrics/setup > @${name}/template.mjs does not exist`)
          }

          //Clean remote repository
          logger(`metrics/setup > clean ${repo}@${branch}`)
          await fs.promises.rm(path.join(__templates, ".community"), {recursive: true, force: true})
          logger(`metrics/setup > loaded community template ${name}`)
        }
        catch (error) {
          logger(`metrics/setup > failed to load community template ${template}`)
          logger(error)
        }
      }
    }
    else {
      logger("metrics/setup > no community templates to install")
    }
  }
  else {
    logger("metrics/setup > community templates are disabled")
  }

  //Load templates
  for (const name of await fs.promises.readdir(__templates)) {
    //Search for templates
    const directory = path.join(__templates, name)
    if ((!(await fs.promises.lstat(directory)).isDirectory()) || (!fs.existsSync(path.join(directory, "partials/_.json"))))
      continue
    logger(`metrics/setup > load template [${name}]`)
    //Cache templates files
    const files = ["image.svg", "style.css", "fonts.css"].map(file => path.join(__templates, fs.existsSync(path.join(directory, file)) ? name : "classic", file))
    const [image, style, fonts] = await Promise.all(files.map(async file => `${await fs.promises.readFile(file)}`))
    const partials = JSON.parse(`${await fs.promises.readFile(path.join(directory, "partials/_.json"))}`)
    conf.templates[name] = {image, style, fonts, partials, views: [directory]}

    //Cache templates scripts
    Templates[name] = await (async () => {
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
          return {image, style, fonts, partials, views: [directory]}
        },
      })
    }
  }

  //Load plugins
  for (const name of await fs.promises.readdir(__plugins)) {
    switch (name) {
      case "community": {
        const ___plugins = path.join(__plugins, "community")
        for (const name of await fs.promises.readdir(___plugins))
          await load.plugin(name, {__plugins: ___plugins, Plugins, conf, logger})
        continue
      }
      default:
        await load.plugin(name, {__plugins, Plugins, conf, logger})
    }
  }

  //Load metadata
  conf.metadata = await metadata({log})

  //Modes
  if ((!conf.settings.modes) || (!conf.settings.modes.length))
    conf.settings.modes = ["embed", "insights"]
  logger(`metrics/setup > setup > enabled modes ${JSON.stringify(conf.settings.modes)}`)

  //Allowed outputs formats
  if ((!conf.settings.outputs) || (!conf.settings.outputs.length))
    conf.settings.outputs = metadata.inputs.config_output.values
  else
    conf.settings.outputs = conf.settings.outputs.filter(format => metadata.inputs.config_output.values.includes(format))
  logger(`metrics/setup > setup > allowed outputs ${JSON.stringify(conf.settings.outputs)}`)

  //Store authenticated user
  if (conf.settings.token) {
    try {
      conf.authenticated = (await (new OctokitRest.Octokit({auth: conf.settings.token})).users.getAuthenticated()).data.login
      logger(`metrics/setup > setup > authenticated as ${conf.authenticated}`)
    }
    catch (error) {
      logger(`metrics/setup > setup > could not verify authentication : ${error}`)
    }
  }

  //Set no token property
  Object.defineProperty(conf.settings, "notoken", {
    get() {
      return conf.settings.token === "NOT_NEEDED"
    },
  })

  //Conf
  logger("metrics/setup > setup > success")
  return {Templates, Plugins, conf}
}

const load = {
  async plugin(name, {__plugins, Plugins, conf, logger}) {
    //Search for plugins
    const directory = path.join(__plugins, name)
    if (!(await fs.promises.lstat(directory)).isDirectory())
      return
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
      Object.keys(queries).map(query =>
        queries[query.substring(1)] = (vars = {}) => {
          let queried = queries[query]
          for (const [key, value] of Object.entries(vars))
            queried = queried.replace(new RegExp(`[$]${key}`, "g"), value)
          return queried
        }
      )
    }
  },
}
