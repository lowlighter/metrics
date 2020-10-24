//Imports
  import fs from "fs"
  import path from "path"
  import url from "url"
  import ncc from "@vercel/ncc"

//Initialization
  const __dirname =  path.join(path.dirname(url.fileURLToPath(import.meta.url)), "..", "action")
  process.on("unhandledRejection", error => { throw error })

/** Build function */
  export default async function build() {
    //Build code
      let {code} = await ncc(`${__dirname}/index.mjs`, {
        minify:true,
        sourceMap:false,
        sourceMapRegister:false,
      })

    //Perform assets includes
      const assets = {}
      const templates = path.join(__dirname, "..", "src/templates")
      for (const name of await fs.promises.readdir(templates)) {
        if (/.*[.]mjs$/.test(name))
          continue
        console.log(`Including template ${name}`)
        const files = [
          `${templates}/${name}/query.graphql`,
          `${templates}/${name}/image.svg`,
          `${templates}/${name}/style.css`,
        ]
        const [query, image, style] = await Promise.all(files.map(async file => `${await fs.promises.readFile(path.resolve(file))}`))
        assets[name] = {query, image, style}
      }
      code = code.replace(/<#assets>/g, Buffer.from(JSON.stringify(assets)).toString("base64"))

    //Perform version include
      const version = JSON.parse(await fs.promises.readFile(path.join(__dirname, "..", "package.json"))).version
      code = code.replace(/<#version>/g, version)

    //Code
      return code
  }

//Main
  if (/build.mjs/.test(process.argv[1])) {
    //Save build
      await fs.promises.writeFile(`${__dirname}/dist/index.js`, await build())
      console.log("Build success !")
  }