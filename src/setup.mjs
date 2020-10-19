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
      if (fs.existsSync(path.resolve("settings.json"))) {
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
        //Cache templates
          console.debug(`metrics/setup > load template [${name}]`)
          const files = [
            `src/templates/${name}/query.graphql`,
            `src/templates/${name}/image.svg`,
            `src/templates/${name}/style.css`,
          ]
          const [query, image, style] = await Promise.all(files.map(async file => `${await fs.promises.readFile(path.resolve(file))}`))
          conf.templates[name] = {query, image, style}
          console.debug(`metrics/setup > load template [${name}] > success`)
        //Debug
          if (conf.settings.debug) {
            Object.defineProperty(conf.templates, name, {
              get() {
                console.debug(`metrics/setup > reload template [${name}]`)
                const [query, image, style] = files.map(file => `${fs.readFileSync(path.resolve(file))}`)
                console.debug(`metrics/setup > reload template [${name}] > success`)
                return {query, image, style}
              }
            })
          }
      }

    //Conf
      console.debug(`metrics/setup > setup > success`)
      return conf

  }