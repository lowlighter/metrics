//Imports
import fs from "fs/promises"
import processes from "child_process"
import yaml from "js-yaml"
import paths from "path"
import sgit from "simple-git"
import url from "url"

//Mode
const [mode = "dryrun"] = process.argv.slice(2)
console.log(`Mode: ${mode}`)

//Git setup
const __metrics = paths.join(paths.dirname(url.fileURLToPath(import.meta.url)), "../..")
const __presets = paths.join(__metrics, ".presets")

if ((!await fs.access(__presets).then(_ => true).catch(_ => false)) || (!(await fs.lstat(__presets)).isDirectory()))
  await sgit().clone(`https://github-actions[bot]:${process.env.GITHUB_TOKEN}@github.com/lowlighter/metrics`, __presets, { "--branch": "presets", "--single-branch": true })
const git = sgit(__presets)
await git.pull()
const staged = new Set()

//Github action
const action = yaml.load(await fs.readFile(paths.join(__metrics, "action.yml"), "utf8"))
action.defaults = Object.fromEntries(Object.entries(action.inputs).map(([key, { default: value }]) => [key, value]))
action.input = vars => Object.fromEntries([...Object.entries(action.defaults), ...Object.entries(vars)].map(([key, value]) => [`INPUT_${key.toLocaleUpperCase()}`, value]))
action.run = async vars =>
  await new Promise((solve, reject) => {
    let [stdout, stderr] = ["", ""]
    const env = { ...process.env, ...action.input(vars), GITHUB_REPOSITORY: "lowlighter/metrics" }
    const child = processes.spawn("node", ["source/app/action/index.mjs"], { env })
    child.stdout.on("data", data => stdout += data)
    child.stderr.on("data", data => stderr += data)
    child.on("close", code => {
      if (code === 0)
        return solve(stdout.match(/(?<svg><svg [\s\S]+<\/svg>)/g)?.groups.svg ?? `<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>`)
      console.log(stdout, stderr)
      reject(stdout)
    })
  })

//Generate presets examples
for (const path of await fs.readdir(__presets)) {
  if (/^[.@]/.test(path))
    continue
  if (!(await fs.lstat(paths.join(__presets, path))).isDirectory())
    continue
  const preset = path

  //Example
  console.log(`generating: ${preset}/example.svg`)
  const svg = await action.run({ config_presets: `@${preset}`, debug_print: true, plugins_errors_fatal: true, dryrun: true, use_mocked_data: true, verify: true, token: "MOCKED_TOKEN" })
  await fs.writeFile(paths.join(__presets, path, "example.svg"), svg)
  staged.add(paths.join(__presets, path, "example.svg"))

  //Readme
  console.log(`generating: ${preset}/README.svg`)
  const { name, description } = await yaml.load(await fs.readFile(paths.join(__presets, preset, "preset.yml")))
  await fs.writeFile(
    paths.join(__presets, path, "README.md"),
    `
<table>
  <tr><th><h3>${name}</h3></th></tr>
  <tr><td align="center"><p>${description}</p></td></tr>
  <tr><td align="center">
    <img src="example.svg">
    <img width="900" height="1" alt="">
  </td></tr>
</table>
`.trim(),
  )
  staged.add(paths.join(__presets, path, "README.md"))
}

//Commit and push
if (mode === "publish") {
  console.log(`Pushing staged changes: \n${[...staged].map(file => `  - ${file}`).join("\n")}`)
  const gitted = await git
    .addConfig("user.name", "github-actions[bot]")
    .addConfig("user.email", "41898282+github-actions[bot]@users.noreply.github.com")
    .add([...staged])
    .commit("ci: auto-regenerate files")
    .push("origin", "presets")
  console.log(gitted)
}
console.log("Success!")
