//Imports
  import fs from "fs"
  import path from "path"
  import url from "url"
  import colors from "colors"

//Initialization
  const __dirname = path.join(path.dirname(url.fileURLToPath(import.meta.url)), "..")
  const __src = path.join(__dirname, "src")
  const __plugins = path.join(__src, "plugins")
  const __templates = path.join(__src, "templates")
  process.on("unhandledRejection", error => { throw error })
  colors.enable()

/** Build function */
  export default async function build({actions = ["build"]} = {}) {
    //Initialization
      const errors = []

    //Indexes
      for (const {name, source, entry} of [{name:"plugins", source:__plugins, entry:"index.mjs"}, {name:"templates", source:__templates, entry:"template.mjs"}]) {

        //Build
          const files = (await fs.promises.readdir(source)).filter(name => !/.*[.]mjs$/.test(name)).sort()
          const code = [
            `/* This file is generated automatically with "npm run build" */`,
            ``,
            `//Imports`,
            ...files.map(name => `  import ${name} from "./${name}/${entry}"`),
            ``,
            `//Exports`,
            `  export default {`,
            ...files.map(name => `    ${name},`),
            `  }`
          ].join("\n")
          console.log(`Generated index for ${name}`.grey)

        //Save build
          if (actions.includes("build")) {
            fs.promises.writeFile(path.join(source, "index.mjs"), code)
            console.log(`Generated index for ${name} saved to ${path.join(source, "index.mjs")}`.green)
          }

        //Check build
          if (actions.includes("check")) {
            const status = `${await fs.promises.readFile(path.join(source, "index.mjs"))}` === code
            if (status)
              console.log(`Index ${name} is up-to-date`.grey)
            else {
              console.log(`Index ${name} is outdated`.red)
              errors.push(`Index ${name} is outdated, run "npm run build" to fix it`)
            }
          }

      }

    //Throw on errors
      if (errors.length)
        throw new Error(`${errors.length} errors occured :\n${errors.map(error => `  - ${error}`).join("\n")}`)
  }

//Main
  if (/build.mjs/.test(process.argv[1])) {
    //Build
      await build()
      console.log("Build success !".green)
  }