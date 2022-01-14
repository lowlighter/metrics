//Imports
import fs from "fs/promises"
import fss from "fs"
import paths from "path"
import url from "url"
import metadata from "../source/app/metrics/metadata.mjs"
import yaml from "js-yaml"

//Paths
const __metrics = paths.join(paths.dirname(url.fileURLToPath(import.meta.url)), "..")
const __templates = paths.join(paths.join(__metrics, "source/templates/"))
const __plugins = paths.join(paths.join(__metrics, "source/plugins/"))

//Load plugins metadata
const {plugins, templates} = await metadata({log:false, diff:true})

async function plugin(id) {
  const path = paths.join(__plugins, id)
  const readme = paths.join(path, "README.md")
  const examples = paths.join(path, "examples.yml")
  return {
    readme:{
      path:readme,
      content:`${await fs.readFile(readme)}`
    },
    examples:fss.existsSync(examples) ? yaml.load(await fs.readFile(examples), "utf8") ?? [] : [],
    options:plugins[id].readme.table
  }
}

//Plugins
for (const id of Object.keys(plugins)) {
  const {examples, options, readme} = await plugin(id)
  //Plugin readme
  await fs.writeFile(readme.path, readme.content
    .replace(/(<!--examples-->)[\s\S]*(<!--\/examples-->)/g, `$1\n${examples.map(({test, prod, ...step}) => ["```yaml", yaml.dump(step), "```"].join("\n")).join("\n")}\n$2`)
    .replace(/(<!--options-->)[\s\S]*(<!--\/options-->)/g, `$1\n${options}\n$2`)
  )
  //Plugin tests
}

//Templates

//Workflow