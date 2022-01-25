//Imports
import fs from "fs"
import paths from "path"
import url from "url"
import ejs from "ejs"

//Mode
const [mode, name] = process.argv.slice(2)

//Paths
const __metrics = paths.join(paths.dirname(url.fileURLToPath(import.meta.url)), "../../..")
const __quickstart = paths.join(__metrics, ".github/scripts/quickstart")

//Check arguments
if ((!mode)||(!name))
  throw new Error(`Usage is "npm run quickstart -- <mode> <name>"`)
if (!["plugin", "template"].includes(mode))
  throw new Error(`Unsupported mode ${mode}`)

//Check if target directory already exists
const target = paths.join(__metrics, `source/${{plugin:"plugins/community", template:"templates"}[mode]}`, name)
if (fs.existsSync(target))
  throw new Error(`A ${mode} named ${name} already exists!`)

//Copy quickstart content
console.log(`quickstart for ${mode}`)
await fs.promises.mkdir(target)
await rcopy(paths.join(__quickstart, mode), target)

//Recursive copy
async function rcopy(from, to) {
  for (const file of await fs.promises.readdir(from)) {
    const path = paths.join(from, file)
    if ((await fs.promises.lstat(path)).isDirectory()) {
      await fs.promises.mkdir(paths.join(to, file))
      await rcopy(path, paths.join(to, file))
    }
    else {
      console.log(`copying ${path} to ${paths.join(to, file)}`)
      await fs.promises.writeFile(paths.join(to, file), await ejs.renderFile(path, {name}, {async:true}))
    }
  }
}
