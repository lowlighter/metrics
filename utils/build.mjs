//Imports
  import fs from "fs"
  import path from "path"
  import url from "url"
  import ncc from "@vercel/ncc"
  import colors from "colors"

//Initialization
  const __dirname = path.join(path.dirname(url.fileURLToPath(import.meta.url)), "..")
  const __action = path.join(__dirname, "action")
  const __src = path.join(__dirname, "src")
  const __plugins = path.join(__src, "plugins")
  const __templates = path.join(__src, "templates")
  process.on("unhandledRejection", error => { throw error })

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

    //Action
      {
        //Build
          let {code} = await ncc(`${__action}/index.mjs`, {
            minify:true,
            sourceMap:false,
            sourceMapRegister:false,
          })
          console.log(`Generated action`.grey)

        //Perform assets includes
          const assets = {}
          const templates = (await fs.promises.readdir(__templates)).filter(name => !/.*[.]mjs$/.test(name)).sort()
          for (const name of templates) {
            const files = [
              `${__templates}/${name}/query.graphql`,
              `${__templates}/${name}/image.svg`,
              `${__templates}/${name}/style.css`,
              `${__templates}/${name}/fonts.css`,
            ]
            const [query, image, style, fonts] = await Promise.all(files.map(async file => `${await fs.promises.readFile(path.resolve(file))}`))
            assets[name] = {query, image, style, fonts}
            console.log(`Prepared template ${name}`.grey)
          }
          code = code.replace(/<#assets>/g, Buffer.from(JSON.stringify(assets)).toString("base64"))
          console.log(`Included ${templates.length} templates to generated action`.grey)

        //Perform version include
          const version = JSON.parse(await fs.promises.readFile(path.join(__dirname, "package.json"))).version
          code = code.replace(/<#version>/g, version)
          console.log(`Included version number (${version}) to generated action`.grey)

        //Save build
          if (actions.includes("build")) {
            fs.promises.writeFile(path.join(__action, "dist/index.js"), code)
            console.log(`Generated action saved to ${path.join(__action, "dist/index.js")}`.green)
          }

        //Check build
          if (actions.includes("check")) {
            const status = `${await fs.promises.readFile(path.join(__action, "dist/index.js"))}` === code
            if (status)
              console.log(`Action is up-to-date`.grey)
            else {
              console.log(`Action is outdated`.red)
              errors.push(`Action is outdated, run "npm run build" to fix it`)
            }
          }
      }

    //
      if (errors.length)
        throw new Error(`${errors.length} errors occured :\n${errors.map(error => `  - ${error}`).join("\n")}`)
  }

//Main
  if (/build.mjs/.test(process.argv[1])) {
    //Build
      await build()
      console.log("Build success !".green)
  }