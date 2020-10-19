//Imports
  import fs from "fs"
  import path from "path"

/** Setup */
  export default async function () {

    //Init
      console.debug(`metrics/setup > setup`)
      const conf = {
        templates:{},
        settings:{},
        statics:path.resolve("src/html")
      }

    //Load settings
      console.debug(`metrics/setup > load settings.json`)
      if (await fs.promises.exists(path.resolve("settings.json"))) {
        conf.settings = JSON.parse(`${await fs.promises.readFile(path.resolve("settings.json"))}`)
        console.debug(`metrics/setup > load settings.json > success`)
      }
      else
        console.debug(`metrics/setup > load settings.json > (missing)`)
      if (!conf.settings.templates)
        conf.settings.templates = {default:"classic", enabled:[]}
      if (conf.settings.debug)
        console.debug(conf.settings)

    //Load templates
      for (const name of await fs.promises.readdir("src/templates")) {
        console.debug(`metrics/setup > load template [${name}]`)
        const [query, image, style] = await Promise.all([
          `src/templates/${name}/query.graphql`,
          `src/templates/${name}/image.svg`,
          `src/templates/${name}/style.css`,
        ].map(async file => `${await fs.promises.readFile(path.resolve(file))}`))
        conf.templates[name] = {query, image, style}
        console.debug(`metrics/setup > load template [${name}] > success`)
      }

    //Conf
      console.debug(`metrics/setup > setup > success`)
      return conf

  }