//Imports
  import fs from "fs"
  import path from "path"
  import url from "url"
  import ncc from "@vercel/ncc"

//Dirname
  const __dirname =  path.join(path.dirname(url.fileURLToPath(import.meta.url)), "..", "action")

//Build code
  let {code} = await ncc(`${__dirname}/index.mjs`, {
    minify:true,
    sourceMap:false,
    sourceMapRegister:false,
  })

//Perform static includes
  for (const match of [...code.match(/(?<=`)<#include (.+?)>(?=`)/g)]) {
    const file = match.match(/<#include (.+?)>/)[1]
    code = code.replace(`<#include ${file}>`, `${await fs.promises.readFile(path.join(__dirname, "..", "src", file))}`.replace(/([$`])/g, "\\$1"))
    console.log(`Included ${file}`)
  }

//Perform version include
  const version = JSON.parse(await fs.promises.readFile(path.join(__dirname, "..", "package.json"))).version
  code = code.replace(`<#version>`, version)

//Save build
  await fs.promises.writeFile(`${__dirname}/dist/index.js`, code)
