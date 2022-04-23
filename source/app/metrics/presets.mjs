//Imports
import fs from "fs/promises"
import yaml from "js-yaml"
import fetch from "node-fetch"
import metadata from "./metadata.mjs"

/**Presets parser */
export default async function presets(list, {log = true, core = null} = {}) {
  //Init
  const {plugins} = await metadata({log: false})
  const {"config.presets": files} = plugins.core.inputs({q: {"config.presets": list}, account: "bypass"})
  const logger = log ? console.debug : () => null
  const allowed = Object.entries(metadata.inputs).filter(([_, {type, preset}]) => (type !== "token") && (!/^(?:[Ff]alse|[Oo]ff|[Nn]o|0)$/.test(preset))).map(([key]) => key)
  const env = core ? "action" : "web"
  const options = {}

  //Load presets
  for (const file of files) {
    try {
      //Load and parse preset
      logger(`metrics/presets > loading ${file}`)
      let text = ""
      if (file.startsWith("@")) {
        logger(`metrics/presets > ${file} seems to be predefined preset, fetching`)
        text = await fetch(`https://raw.githubusercontent.com/lowlighter/metrics/presets/${file.substring(1)}/preset.yml`).then(response => response.text())
      }
      else if (file.startsWith("https://")) {
        logger(`metrics/presets > ${file} seems to be an url, fetching`)
        text = await fetch(file).then(response => response.text())
      }
      else if (env === "action") {
        logger(`metrics/presets > ${file} seems to be a local file, reading`)
        text = `${await fs.readFile(file)}`
      }
      else {
        logger(`metrics/presets > ${file} cannot be loaded in current environment ${env}, skipping`)
        continue
      }
      const {schema, with: inputs} = yaml.load(text)
      logger(`metrics/presets > ${file} preset schema is ${schema}`)

      //Evaluate preset
      switch (`${schema}`) {
        case "v1": {
          for (let [key, value] of Object.entries(inputs)) {
            if (!allowed.includes(key)) {
              logger(`metrics/presets > ${key} is specified but is not allowed in preset, skipping`)
              continue
            }
            if (env === "web")
              key = metadata.to.query(key)
            if (key in options)
              logger(`metrics/presets > ${key} was already specified by another preset, overwriting`)
            options[key] = value
          }
          break
        }
        default:
          throw new Error(`unsupported preset schema: ${schema}`)
      }
    }
    //Handle errors
    catch (error) {
      if (env === "action")
        console.log(`::warning::skipping preset ${file}: ${error.message}`)
      logger(`metrics/presets > an error occured while loading preset ${file} (${error}), ignoring`)
    }
  }
  return options
}
