//Imports
import ejs from "ejs"
import fs from "fs/promises"
import fss from "fs"
import paths from "path"
import url from "url"
import sgit from "simple-git"
import metadata from "../source/app/metrics/metadata.mjs"
import yaml from "js-yaml"

//Mode
const [mode = "dryrun"] = process.argv.slice(2)
console.log(`Mode: ${mode}`)

//Paths
const __metrics = paths.join(paths.dirname(url.fileURLToPath(import.meta.url)), "..")
const __action = paths.join(__metrics, "source/app/action")
const __web = paths.join(__metrics, "source/app/web")
const __readme = paths.join(__metrics, ".github/readme")
const __templates = paths.join(paths.join(__metrics, "source/templates/"))
const __plugins = paths.join(paths.join(__metrics, "source/plugins/"))
const __test_plugins = paths.join(paths.join(__metrics, "tests/plugins"))
const __test_secrets = paths.join(paths.join(__metrics, "tests/secrets.json"))

//Git setup
const git = sgit(__metrics)
const staged = new Set()

//Config and general documentation auto-generation
for (const step of ["config", "documentation"]) {

  //Load plugins metadata
  const {plugins, templates, packaged, descriptor} = await metadata({log:false})

  //Update generated files
  async function update({source, output, options = {}}) {
    //Regenerate file
    console.log(`Generating ${output}`)
    const content = await ejs.renderFile(source, {plugins, templates, packaged, descriptor}, {async:true, ...options})
    //Save result
    const file = paths.join(__metrics, output)
    await fs.writeFile(file, content)
    //Add to git
    staged.add(file)
  }

  //Templating
  switch (step) {
    case "config":
      await update({source:paths.join(__action, "action.yml"), output:"action.yml"})
      await update({source:paths.join(__web, "settings.example.json"), output:"settings.example.json"})
      break
    case "documentation":
      await update({source:paths.join(__readme, "README.md"), output:"README.md", options:{root:__readme}})
      await update({source:paths.join(__readme, "partials/documentation/plugins.md"), output:"source/plugins/README.md"})
      await update({source:paths.join(__readme, "partials/documentation/templates.md"), output:"source/templates/README.md"})
      break
  }
}

{
  //Load plugins metadata and secrets
  const {plugins, templates} = await metadata({log:false, diff:true})
  const secrets = Object.assign(JSON.parse(`${await fs.readFile(__test_secrets)}`), {$regex:/\$\{\{\s*secrets\.(?<secret>\w+)\s*\}\}/})

  //Get plugin infos
  async function plugin(id) {
    const path = paths.join(__plugins, id)
    const readme = paths.join(path, "README.md")
    const examples = paths.join(path, "examples.yml")
    const tests = paths.join(__test_plugins, `${id}.yml`)
    return {
      readme:{
        path:readme,
        content:`${await fs.readFile(readme)}`
      },
      tests:{
        path:tests
      },
      examples:fss.existsSync(examples) ? yaml.load(await fs.readFile(examples), "utf8") ?? [] : [],
      options:plugins[id].readme.table
    }
  }

  //Plugins
  for (const id of Object.keys(plugins)) {
    const {examples, options, readme, tests} = await plugin(id)

    //Plugin readme
    await fs.writeFile(readme.path, readme.content
      .replace(/(<!--examples-->)[\s\S]*(<!--\/examples-->)/g, `$1\n${examples.map(({test, prod, ...step}) => ["```yaml", yaml.dump(step), "```"].join("\n")).join("\n")}\n$2`)
      .replace(/(<!--options-->)[\s\S]*(<!--\/options-->)/g, `$1\n${options}\n$2`)
    )
    console.log(`Generating ${readme.path}`)

    //Plugin tests
    await fs.writeFile(tests.path, yaml.dump(examples.map(({prod, test = {}, name = "", ...step}) => {
      if (test.skip)
        return null
      const result = {name:`${plugins[id].name} - ${name}`, ...step, ...test}
      test.with ??= {}
      for (const [k, v] of Object.entries(result.with)) {
        if (k in test.with)
          result.with[k] = test.with[k]
        if (secrets.$regex.test(v))
          result.with[k] = v.replace(secrets.$regex, secrets[v.match(secrets.$regex)?.groups?.secret])
      }
      if (!result.with.base)
        delete result.with.base
      delete result.with.filename
      return result
    }).filter(t => t)))
    console.log(`Generating ${tests.path}`)

  }

}

//Commit and push
if (mode === "publish") {
  console.log(`Pushing staged changes: \n${[...staged].map(file => `  - ${file}`).join("\n")}`)
  const gitted = await git
    .addConfig("user.name", "github-actions[bot]")
    .addConfig("user.email", "41898282+github-actions[bot]@users.noreply.github.com")
    .add([...staged])
    .commit("ci: auto-regenerate files")
    .push("origin", "master")
  console.log(gitted)
}
console.log("Success!")
