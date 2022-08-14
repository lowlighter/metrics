//Imports
const processes = require("child_process")
const yaml = require("js-yaml")
const fs = require("fs")
const path = require("path")
const url = require("url")
const axios = require("axios")
const faker = require("@faker-js/faker").faker
const ejs = require("ejs")

//GitHub action
const action = yaml.load(fs.readFileSync(path.join(__dirname, "../action.yml"), "utf8"))
action.defaults = Object.fromEntries(Object.entries(action.inputs).map(([key, {default: value}]) => [key, value]))
action.input = vars => Object.fromEntries([...Object.entries(action.defaults), ...Object.entries(vars)].map(([key, value]) => [`INPUT_${key.toLocaleUpperCase()}`, value]))
action.run = async vars =>
  await new Promise((solve, reject) => {
    let [stdout, stderr] = ["", ""]
    const env = {...process.env, ...action.input(vars), GITHUB_REPOSITORY: "lowlighter/metrics"}
    const child = processes.spawn("node", ["source/app/action/index.mjs"], {env})
    child.stdout.on("data", data => stdout += data)
    child.stderr.on("data", data => stderr += data)
    child.on("close", code => {
      if (code === 0)
        return solve(true)
      console.log(stdout, stderr)
      reject(stdout)
    })
  })

//Web instance
const web = {}
web.run = async vars => (await axios(`http://localhost:3000/lowlighter?${new url.URLSearchParams(Object.fromEntries(Object.entries(vars).map(([key, value]) => [key.replace(/^plugin_/, "").replace(/_/g, "."), value])))}`)).status === 200
web.start = async () =>
  new Promise(solve => {
    let stdout = ""
    web.instance = processes.spawn("node", ["source/app/web/index.mjs"], {env: {...process.env, SANDBOX: true}})
    web.instance.stdout.on("data", data => (stdout += data, /Server ready !/.test(stdout) ? solve() : null))
    web.instance.stderr.on("data", data => console.error(`${data}`))
  })
web.stop = async () => await web.instance.kill("SIGKILL")

//Web instance placeholder
require("./../source/app/web/statics/embed/app.placeholder.js")
const placeholder = globalThis.placeholder
delete globalThis.placeholder
placeholder.init({
  faker,
  ejs,
  axios: {
    async get(url) {
      return axios(`http://localhost:3000${url}`)
    },
  },
})
placeholder.run = async vars => {
  const options = Object.fromEntries(Object.entries(vars).map(([key, value]) => [key.replace(/^plugin_/, "").replace(/_/g, "."), value]))
  const enabled = Object.fromEntries(Object.entries(vars).filter(([key]) => /^plugin_[a-z]+$/.test(key)))
  const config = Object.fromEntries(Object.entries(options).filter(([key]) => /^config[.]/.test(key)))
  const base = Object.fromEntries(Object.entries(options).filter(([key]) => /^base[.]/.test(key)))
  return typeof await placeholder({
    templates: {selected: vars.template},
    plugins: {enabled: {...enabled, base}, options},
    config,
    version: "TEST",
    user: "lowlighter",
    avatar: "https://github.com/lowlighter.png",
  }) === "string"
}

//Setup
beforeAll(async () => {
  //Clean community template
  await fs.promises.rm(path.join(__dirname, "../source/templates/@classic"), {recursive: true, force: true})
  //Start web instance
  await web.start()
})
//Teardown
afterAll(async () => {
  //Stop web instance
  await web.stop()
  //Clean community template
  await fs.promises.rm(path.join(__dirname, "../source/templates/@classic"), {recursive: true, force: true})
})

//Load metadata (as jest doesn't support ESM modules, we use this dirty hack)
const metadata = JSON.parse(`${
  processes.spawnSync("node", [
    "--input-type",
    "module",
    "--eval",
    'import metadata from "./source/app/metrics/metadata.mjs";console.log(JSON.stringify(await metadata({log:false})))',
  ]).stdout
}`)

//Build tests index
const tests = []
for (const type of ["plugins", "templates"]) {
  for (const name in metadata[type]) {
    const cases = yaml
      .load(fs.readFileSync(path.join(__dirname, "../tests/cases", `${name}.${type.replace(/s$/, "")}.yml`), "utf8"))
      ?.map(({name: test, with: inputs, modes = [], timeout}) => {
        const skip = new Set(Object.entries(metadata.templates).filter(([_, {readme: {compatibility}}]) => !compatibility[name]).map(([template]) => template))
        if (!(metadata[type][name].supports?.includes("repository")))
          skip.add("repository")
        return [test, inputs, {skip: [...skip], modes, timeout}]
      }) ?? []
    tests.push(...cases)
  }
}

//Tests run
describe("GitHub Action", () =>
  describe.each([
    ["classic", {}],
    ["terminal", {}],
    ["repository", {repo: "metrics"}],
  ])("Template : %s", (template, query) => {
    for (const [name, input, {skip = [], modes = [], timeout} = {}] of tests) {
      if ((skip.includes(template)) || ((modes.length) && (!modes.includes("action"))))
        test.skip(name, () => null)
      else
        test(name, async () => expect(await action.run({template, base: "", query: JSON.stringify(query), plugins_errors_fatal: true, dryrun: true, use_mocked_data: true, verify: true, retries: 1, ...input})).toBe(true), timeout)
    }
  }))

describe("Web instance", () =>
  describe.each([
    ["classic", {}],
    ["terminal", {}],
    ["repository", {repo: "metrics"}],
  ])("Template : %s", (template, query) => {
    for (const [name, input, {skip = [], modes = [], timeout} = {}] of tests) {
      if ((skip.includes(template)) || ((modes.length) && (!modes.includes("web"))))
        test.skip(name, () => null)
      else
        test(name, async () => expect(await web.run({template, base: 0, ...query, plugins_errors_fatal: true, verify: true, ...input})).toBe(true), timeout)
    }
  }))

describe("Web instance (placeholder)", () =>
  describe.each([
    ["classic", {}],
    ["terminal", {}],
  ])("Template : %s", (template, query) => {
    for (const [name, input, {skip = [], modes = [], timeout} = {}] of tests) {
      if ((skip.includes(template)) || ((modes.length) && (!modes.includes("placeholder"))))
        test.skip(name, () => null)
      else
        test(name, async () => expect(await placeholder.run({template, base: 0, ...query, ...input})).toBe(true), timeout)
    }
  }))
