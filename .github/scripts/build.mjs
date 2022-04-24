//Imports
import ejs from "ejs"
import fss from "fs"
import fs from "fs/promises"
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
const __documentation = paths.join(__metrics, ".github/readme/partials/templated")
const __templates = paths.join(paths.join(__metrics, "source/templates/"))
const __plugins = paths.join(paths.join(__metrics, "source/plugins/"))
const __test_cases = paths.join(paths.join(__metrics, "tests/cases"))
const __test_secrets = paths.join(paths.join(__metrics, "tests/secrets.json"))

//Git setup
const git = sgit(__metrics)
const staged = new Set()
const secrets = Object.assign(JSON.parse(`${await fs.readFile(__test_secrets)}`), {$regex: /\$\{\{\s*secrets\.(?<secret>\w+)\s*\}\}/})
const {plugins, templates} = await metadata({log: false, diff: true})
const workflow = []

//Plugins
for (const id of Object.keys(plugins)) {
  const {examples, options, readme, tests, header, community} = await plugin(id)

  //Readme
  console.log(`Generating source/plugins/${community ? "community/" : ""}${id}/README.md`)
  await fs.writeFile(
    readme.path,
    readme.content
      .replace(/(<!--header-->)[\s\S]*(<!--\/header-->)/g, `$1\n${header}\n$2`)
      .replace(/(<!--examples-->)[\s\S]*(<!--\/examples-->)/g, `$1\n${examples.map(({test, prod, ...step}) => ["```yaml", yaml.dump(step, {quotingType: '"', noCompatMode: true}), "```"].join("\n")).join("\n")}\n$2`)
      .replace(/(<!--options-->)[\s\S]*(<!--\/options-->)/g, `$1\n${options}\n$2`),
  )
  staged.add(readme.path)

  //Tests
  console.log(`Generating tests/plugins/${community ? "community/" : ""}${id}.yml`)
  workflow.push(...examples.map(example => testcase(plugins[id].name, "prod", example)).filter(t => t))
  await fs.writeFile(tests.path, yaml.dump(examples.map(example => testcase(plugins[id].name, "test", example)).filter(t => t)))
  staged.add(tests.path)
}

//Templates
for (const id of Object.keys(templates)) {
  const {examples, readme, tests, header} = await template(id)

  //Readme
  console.log(`Generating source/templates/${id}/README.md`)
  await fs.writeFile(
    readme.path,
    readme.content
      .replace(/(<!--header-->)[\s\S]*(<!--\/header-->)/g, `$1\n${header}\n$2`)
      .replace(/(<!--examples-->)[\s\S]*(<!--\/examples-->)/g, `$1\n${examples.map(({test, prod, ...step}) => ["```yaml", yaml.dump(step, {quotingType: '"', noCompatMode: true}), "```"].join("\n")).join("\n")}\n$2`),
  )
  staged.add(readme.path)

  //Tests
  console.log(`Generating tests/templates/${id}.yml`)
  workflow.push(...examples.map(example => testcase(templates[id].name, "prod", example)).filter(t => t))
  await fs.writeFile(tests.path, yaml.dump(examples.map(example => testcase(templates[id].name, "test", example)).filter(t => t), {quotingType: '"', noCompatMode: true}))
  staged.add(tests.path)
}

//Config and general documentation auto-generation
for (const step of ["config", "documentation"]) {
  switch (step) {
    case "config":
      await update({source: paths.join(__action, "action.yml"), output: "action.yml", context: {runsh: `${await fs.readFile(paths.join(__action, "run.sh"), "utf8")}`}})
      await update({source: paths.join(__web, "settings.example.json"), output: "settings.example.json"})
      break
    case "documentation":
      await update({source: paths.join(__documentation, "README.md"), output: "README.md", options: {root: __readme}})
      await update({source: paths.join(__documentation, "plugins.md"), output: "source/plugins/README.md"})
      await update({source: paths.join(__documentation, "plugins.community.md"), output: "source/plugins/community/README.md"})
      await update({source: paths.join(__documentation, "templates.md"), output: "source/templates/README.md"})
      await update({source: paths.join(__documentation, "compatibility.md"), output: ".github/readme/partials/documentation/compatibility.md"})
      break
  }
}

//Example workflows
await update({source: paths.join(__metrics, ".github/scripts/files/examples.yml"), output: ".github/workflows/examples.yml", context: {steps: yaml.dump(workflow, {quotingType: '"', noCompatMode: true})}})

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
async function update({source, output, context = {}, options = {}}) {
  console.log(`Generating ${output}`)
  const {plugins, templates, packaged, descriptor} = await metadata({log: false})
  const content = await ejs.renderFile(source, {plugins, templates, packaged, descriptor, ...context}, {async: true, ...options})
  const file = paths.join(__metrics, output)
  await fs.writeFile(file, content.replace(/^[ ]+$/gm, ""))
  staged.add(file)
}

//Get plugin infos
async function plugin(id) {
  const path = paths.join(__plugins, plugins[id].community ? "community" : "", id)
  const readme = paths.join(path, "README.md")
  const examples = paths.join(path, "examples.yml")
  const tests = paths.join(__test_cases, `${id}.plugin.yml`)
  return {
    community: plugins[id].community,
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
  const {prod = {}, test = {}, ...step} = JSON.parse(JSON.stringify(args))
  const context = {prod, test}[env] ?? {}
  const {with: overrides} = context
  if (context.skip)
    return null

  Object.assign(step.with, context.with ?? {})
  delete context.with
  const result = {...step, ...context, name: `${name} - ${step.name ?? "(unnamed)"}`}
  for (const [k, v] of Object.entries(result.with)) {
    if ((env === "test") && (secrets.$regex.test(v)))
      result.with[k] = v.replace(secrets.$regex, secrets[v.match(secrets.$regex)?.groups?.secret])
  }

  if (env === "prod") {
    result.if = "${{ success() || failure() }}"
    result.uses = "lowlighter/metrics@master"
    Object.assign(result.with, {output_action: "none", delay: 120})

    for (const {property, value} of [{property: "user", value: "lowlighter"}, {property: "plugins_errors_fatal", value: "yes"}]) {
      if (!(property in result.with))
        result.with[property] = value
    }
    if ((overrides?.output_action) && (overrides?.committer_branch === "examples"))
      Object.assign(result.with, {output_action: overrides.output_action, committer_branch: "examples"})
  }

  if (env === "test") {
    if (!result.with.base)
      delete result.with.base
    delete result.with.filename
    Object.assign(result.with, {use_mocked_data: "yes", verify: "yes"})
  }

  return result
}
