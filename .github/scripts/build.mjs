//Imports
import fs from "fs/promises"
import ejs from "ejs"
import fss from "fs"
import yaml from "js-yaml"
import paths from "path"
import sgit from "simple-git"
import url from "url"
import metadata from "../../source/app/metrics/metadata.mjs"

//Mode
const [mode = "dryrun"] = process.argv.slice(2)
console.log(`Mode: ${mode}`)

//Paths
const __metrics = paths.join(paths.dirname(url.fileURLToPath(import.meta.url)), "../..")
const __action = paths.join(__metrics, "source/app/action")
const __web = paths.join(__metrics, "source/app/web")
const __readme = paths.join(__metrics, ".github/readme")
const __templates = paths.join(paths.join(__metrics, "source/templates/"))
const __plugins = paths.join(paths.join(__metrics, "source/plugins/"))
const __test_cases = paths.join(paths.join(__metrics, "tests/cases"))
const __test_secrets = paths.join(paths.join(__metrics, "tests/secrets.json"))

//Git setup
const git = sgit(__metrics)
const staged = new Set()
const secrets = Object.assign(JSON.parse(`${await fs.readFile(__test_secrets)}`), { $regex: /\$\{\{\s*secrets\.(?<secret>\w+)\s*\}\}/ })
const { plugins, templates } = await metadata({ log: false, diff: true })
const workflow = []

//Config and general documentation auto-generation
for (const step of ["config", "documentation"]) {
  switch (step) {
    case "config":
      await update({ source: paths.join(__action, "action.yml"), output: "action.yml" })
      await update({ source: paths.join(__web, "settings.example.json"), output: "settings.example.json" })
      break
    case "documentation":
      await update({ source: paths.join(__readme, "README.md"), output: "README.md", options: { root: __readme } })
      await update({ source: paths.join(__readme, "partials/documentation/plugins.md"), output: "source/plugins/README.md" })
      await update({ source: paths.join(__readme, "partials/documentation/templates.md"), output: "source/templates/README.md" })
      break
  }
}

//Plugins
for (const id of Object.keys(plugins)) {
  const { examples, options, readme, tests, header } = await plugin(id)

  //Readme
  await fs.writeFile(
    readme.path,
    readme.content
      .replace(/(<!--header-->)[\s\S]*(<!--\/header-->)/g, `$1\n${header}\n$2`)
      .replace(/(<!--examples-->)[\s\S]*(<!--\/examples-->)/g, `$1\n${examples.map(({ test, prod, ...step }) => ["```yaml", yaml.dump(step), "```"].join("\n")).join("\n")}\n$2`)
      .replace(/(<!--options-->)[\s\S]*(<!--\/options-->)/g, `$1\n${options}\n$2`),
  )
  console.log(`Generating source/plugins/${id}/README.md`)

  //Tests
  workflow.push(...examples.map(example => testcase(plugins[id].name, "prod", example)).filter(t => t))
  await fs.writeFile(tests.path, yaml.dump(examples.map(example => testcase(plugins[id].name, "test", example)).filter(t => t)))
  console.log(`Generating tests/plugins/${id}.yml`)
}

//Templates
for (const id of Object.keys(templates)) {
  const { examples, readme, tests, header } = await template(id)

  //Readme
  await fs.writeFile(
    readme.path,
    readme.content
      .replace(/(<!--header-->)[\s\S]*(<!--\/header-->)/g, `$1\n${header}\n$2`)
      .replace(/(<!--examples-->)[\s\S]*(<!--\/examples-->)/g, `$1\n${examples.map(({ test, prod, ...step }) => ["```yaml", yaml.dump(step), "```"].join("\n")).join("\n")}\n$2`),
  )
  console.log(`Generating source/templates/${id}/README.md`)

  //Tests
  workflow.push(...examples.map(example => testcase(templates[id].name, "prod", example)).filter(t => t))
  await fs.writeFile(tests.path, yaml.dump(examples.map(example => testcase(templates[id].name, "test", example)).filter(t => t)))
  console.log(`Generating tests/templates/${id}.yml`)
}

//Example workflows
await update({ source: paths.join(__metrics, ".github/scripts/files/examples.yml"), output: ".github/workflows/examples.yml", context: { steps: yaml.dump(workflow) } })

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

//==================================================================================

//Update generated files
async function update({ source, output, context = {}, options = {} }) {
  console.log(`Generating ${output}`)
  const { plugins, templates, packaged, descriptor } = await metadata({ log: false })
  const content = await ejs.renderFile(source, { plugins, templates, packaged, descriptor, ...context }, { async: true, ...options })
  const file = paths.join(__metrics, output)
  await fs.writeFile(file, content)
  staged.add(file)
}

//Get plugin infos
async function plugin(id) {
  const path = paths.join(__plugins, id)
  const readme = paths.join(path, "README.md")
  const examples = paths.join(path, "examples.yml")
  const tests = paths.join(__test_cases, `${id}.plugin.yml`)
  return {
    readme: {
      path: readme,
      content: `${await fs.readFile(readme)}`,
    },
    tests: {
      path: tests,
    },
    examples: fss.existsSync(examples) ? yaml.load(await fs.readFile(examples), "utf8") ?? [] : [],
    options: plugins[id].readme.table,
    header: plugins[id].readme.header,
  }
}

//Get template infos
async function template(id) {
  const path = paths.join(__templates, id)
  const readme = paths.join(path, "README.md")
  const examples = paths.join(path, "examples.yml")
  const tests = paths.join(__test_cases, `${id}.template.yml`)
  return {
    readme: {
      path: readme,
      content: `${await fs.readFile(readme)}`,
    },
    tests: {
      path: tests,
    },
    examples: fss.existsSync(examples) ? yaml.load(await fs.readFile(examples), "utf8") ?? [] : [],
    header: templates[id].readme.header,
  }
}

//Testcase generator
function testcase(name, env, args) {
  const { prod = {}, test = {}, ...step } = JSON.parse(JSON.stringify(args))
  const context = { prod, test }[env] ?? {}
  if (context.skip)
    return null

  Object.assign(step.with, context.with ?? {})
  delete context.with
  const result = { ...step, ...context, name: `${name} - ${step.name ?? "(unnamed)"}` }
  for (const [k, v] of Object.entries(result.with)) {
    if ((env === "test") && (secrets.$regex.test(v)))
      result.with[k] = v.replace(secrets.$regex, secrets[v.match(secrets.$regex)?.groups?.secret])
  }

  if (env === "prod") {
    result.if = "${{ success() || failure() }}"
    result.uses = "lowlighter/metrics@master"
    Object.assign(result.with, { plugins_errors_fatal: "yes", output_action: "none", delay: 5 })
  }

  if (env === "test") {
    if (!result.with.base)
      delete result.with.base
    delete result.with.filename
    Object.assign(result.with, { use_mocked_data: "yes", verify: "yes" })
  }

  return result
}
