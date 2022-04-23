//Imports
import processes from "child_process"
import fs from "fs/promises"
import yaml from "js-yaml"
import fetch from "node-fetch"
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
  await sgit().clone(`https://github-actions[bot]:${process.env.GITHUB_TOKEN}@github.com/lowlighter/metrics`, __presets, {"--branch": "presets", "--single-branch": true})
const git = sgit(__presets)
await git.pull()
const staged = new Set()

//Web instance
const web = {}
web.run = async vars => await fetch(`http://localhost:3000/lowlighter?${new url.URLSearchParams(Object.fromEntries(Object.entries(vars).map(([key, value]) => [key.replace(/^plugin_/, "").replace(/_/g, "."), value])))}`).then(response => response.text())
web.start = async () =>
  new Promise(solve => {
    let stdout = ""
    web.instance = processes.spawn("node", ["source/app/web/index.mjs"], {env: {...process.env, SANDBOX: true}})
    web.instance.stdout.on("data", data => (stdout += data, /Server ready !/.test(stdout) ? solve() : null))
    web.instance.stderr.on("data", data => console.error(`${data}`))
  })
web.stop = async () => await web.instance.kill("SIGKILL")

//Generate presets examples
await web.start()
for (const path of await fs.readdir(__presets)) {
  if (/^[.@]/.test(path))
    continue
  if (!(await fs.lstat(paths.join(__presets, path))).isDirectory())
    continue
  const preset = path

  //Example
  console.log(`generating: ${preset}/example.svg`)
  const svg = await web.run({config_presets: `@${preset}`, plugins_errors_fatal: true})
  await fs.writeFile(paths.join(__presets, path, "example.svg"), svg)
  staged.add(paths.join(__presets, path, "example.svg"))

  //Readme
  console.log(`generating: ${preset}/README.svg`)
  const {name, description} = await yaml.load(await fs.readFile(paths.join(__presets, preset, "preset.yml")))
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
await web.stop()

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
