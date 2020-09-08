//Imports
  import fs from "fs"
  import path from "path"

//Perform static includes
  let generated = `${await fs.promises.readFile(path.join("action/dist", "index.js"))}`
  for (const match of [...generated.match(/(?<=`)<#include (.+?)>(?=`)/g)]) {
    const file = match.match(/<#include (.+?)>/)[1]
    generated = generated.replace(`<#include ${file}>`, `${await fs.promises.readFile(path.join("src", file))}`.replace(/([$`])/g, "\\$1"))
    console.log(`Included ${file}`)
  }
  await fs.promises.writeFile(path.join("action/dist", "index.js"), generated)
