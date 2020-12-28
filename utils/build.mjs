//Imports
  import fs from "fs"
  import path from "path"
  import url from "url"
  import ncc from "@vercel/ncc"
  import minify from "babel-minify"
  import colors from "colors"
  import ejs from "ejs"

//Initialization
  const __dirname = path.join(path.dirname(url.fileURLToPath(import.meta.url)), "..")
  const __action = path.join(__dirname, "action")
  const __workflows = path.join(__dirname, ".github/workflows")
  const __utils = path.join(__dirname, "utils")
  const __src = path.join(__dirname, "src")
  const __plugins = path.join(__src, "plugins")
  const __templates = path.join(__src, "templates")
  const __queries = path.join(__src, "queries")
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

    //Workflow
      {
        //Build
          const code = await ejs.renderFile(path.join(__utils, "workflow.yml"), {
            releases:["master"],
            templates:(await fs.promises.readdir(__templates)).filter(name => !/.*[.]mjs$/.test(name)).sort(),
            testcase(context = {}) {
              return [`with:`, ...Object.entries({
                token:"${{ secrets.METRICS_TOKEN }}",
                dryrun:true,
                repositories:0,
                template:"${{ matrix.template }}",
                base:"",
                plugins_errors_fatal:true,
                ...context
              }).map(([key, value]) => `${"  ".repeat(5)}${key}: ${
                typeof value === "boolean" ? (value ? "yes" : "no") :
                typeof value === "string" ? (!value ? `""` : value) :
                value
              }`)].join("\n")
            },
          }, {async:true})
          console.log(`Generated workflow`.grey)

        //Save build
          if (actions.includes("build")) {
            fs.promises.writeFile(path.join(__workflows, "workflow.yml"), code)
            console.log(`Generated workflow saved to ${path.join(__workflows, "dist/index.js")}`.green)
          }

        //Check build
          if (actions.includes("check")) {
            const status = `${await fs.promises.readFile(path.join(__workflows, "workflow.yml"))}` === code
            if (status)
              console.log(`Workflow is up-to-date`.grey)
            else {
              console.log(`Workflow is outdated`.red)
              errors.push(`Workflow is outdated, run "npm run build" to fix it`)
            }
          }
      }

    //Action
      {
        //Build
          let {code} = await ncc(`${__action}/index.mjs`, {sourceMap:false, sourceMapRegister:false})
          console.log(`Generated action`.grey)

        //Perform assets includes
          {
            const assets = {}
            const templates = (await fs.promises.readdir(__templates)).filter(name => !/.*[.]mjs$/.test(name)).sort()
            for (const name of templates) {
              const files = [
                `${__templates}/${name}/image.svg`,
                `${__templates}/${name}/style.css`,
                `${__templates}/${name}/fonts.css`,
              ].map(file => fs.existsSync(path.resolve(file)) ? file : file.replace(`${__templates}/${name}/`, `${__templates}/classic/`))
              const [image, style, fonts] = await Promise.all(files.map(async file => `${await fs.promises.readFile(path.resolve(file))}`))
              assets[name] = {image, style, fonts}
              console.log(`Prepared template ${name}`.grey)
            }
            code = code.replace(/<#assets>/g, Buffer.from(JSON.stringify(assets)).toString("base64"))
            console.log(`Included ${templates.length} templates to generated action`.grey)
          }

        //Perform queries includes
          {
            const assets = {}
            const queries = (await fs.promises.readdir(__queries)).sort()
            for (const query of queries) {
              const name = query.replace(/[.]graphql$/, "")
              assets[`_${name}`] = await fs.promises.readFile(path.resolve(`${__queries}/${query}`))
              console.log(`Prepared query ${name}`.grey)
            }
            code = code.replace(/<#queries>/g, Buffer.from(JSON.stringify(assets)).toString("base64"))
            console.log(`Included ${queries.length} queries to generated action`.grey)
          }

        //Perform version include
          {
            const version = JSON.parse(await fs.promises.readFile(path.join(__dirname, "package.json"))).version
            code = code.replace(/<#version>/g, version)
            console.log(`Included version number (${version}) to generated action`.grey)
          }

        //Minify
          code = minify(code).code
          console.log(`Minified code`.grey)
          if (!code)
            throw new Error(`Failed to minify code`)

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