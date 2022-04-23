//Imports
const processes = require("child_process")
const yaml = require("js-yaml")
const fss = require("fs")
const paths = require("path")

//Git setup
const __metrics = paths.join(paths.dirname(__dirname, ".."))
const __presets = paths.join(__metrics, ".presets")

//Clone presets branch
try {
  fss.accessSync(__presets)
}
catch {
  let {HEAD_REF: branch, REPO: repo} = process.env
  branch = branch || "presets"
  repo = repo || "lowlighter/metrics"
  if (!/^[/-\w\d]+$/.test(branch))
    throw new Error(`invalid branch: ${branch}`)
  if (!/^[-\w\d]+\/[-\w\d]+$/.test(repo))
    throw new Error(`invalid repo: ${repo}`)
  console.log(`cloning: ${repo}@${branch}`)
  processes.execFileSync("git", ["clone", `https://github.com/${repo}.git`, __presets, "--branch", branch, "--single-branch"])
}

//Generate presets examples
for (const path of fss.readdirSync(__presets)) {
  if (/^[.@]/.test(path))
    continue
  if (!(fss.lstatSync(paths.join(__presets, path))).isDirectory())
    continue

  describe(`Preset: ${path}`, () => {
    try {
      //Load preset
      const preset = yaml.load(fss.readFileSync(paths.join(__presets, path, "preset.yml")))
      test("syntax is valid", () => expect(true).toBe(true))
      try {
        //Load schema
        const {properties} = yaml.load(fss.readFileSync(paths.join(__presets, "@schema", `${preset.schema}.yml`)))
        test("schema is valid", () => expect(preset.schema).toBeDefined())
        //Test schema
        for (const [key, {type, required}] of Object.entries(properties)) {
          if (required)
            test(`preset.${key} is defined`, () => expect(preset[key]).toBeDefined())
          test(`preset.${key} type is ${type}`, () => {
            switch (true) {
              case /^'.*'$/.test(type): {
                const value = type.substring(1, type.length - 1)
                expect(preset[key]).toBe(value)
                return
              }
              case /\{\}$/.test(type): {
                const typed = type.substring(0, type.length - 2)
                expect(typeof preset[key]).toBe("object")
                if (typed !== "unknown") {
                  for (const value of Object.values(preset[key]))
                    expect(typeof value).toBe(typed)
                }
                return
              }
              case /\[\]$/.test(type): {
                const typed = type.substring(0, type.length - 2)
                expect(Array.isArray(preset[key])).toBe(true)
                if (typed !== "unknown") {
                  for (const value of Object.values(preset[key]))
                    expect(typeof value).toBe(typed)
                }
                return
              }
              default:
                expect(typeof preset[key]).toBe(type)
            }
          })
        }
      }
      catch (error) {
        test(`schema is valid (got ${preset.schema})`, () => expect(false).toBe(true))
      }
    }
    catch {
      test("syntax is valid", () => expect(false).toBe(true))
    }
  })
}
