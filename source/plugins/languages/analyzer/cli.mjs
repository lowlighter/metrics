//Imports
import OctokitRest from "@octokit/rest"
import yargsparser from "yargs-parser"
import { IndepthAnalyzer } from "./indepth.mjs"
import { RecentAnalyzer } from "./recent.mjs"

const help = `

`.trim()

/**Cli */
export async function cli() {
  //Parse inputs
  console.log("== metrics indepth analyzer cli ====================")
  const argv = yargsparser(process.argv.slice(2))
  if (argv.help) {
    console.log(help)
    return null
  }
  const {default: setup} = await import("../../../app/metrics/setup.mjs")
  const {conf: {metadata}} = await setup({log: false})
  const {login, _: repositories, mode = "indepth"} = argv
  const {
    "commits.authoring": authoring,
  } = await metadata.plugins.base.inputs({
    q: {
      "commits.authoring": argv["commits-authoring"] || login,
    },
    account: "bypass",
  })
  const {
    categories,
    "analysis.timeout": _timeout_global,
    "analysis.timeout.repositories": _timeout_repositories,
    "recent.load": _recent_load,
    "recent.days": _recent_days,
  } = await metadata.plugins.languages.inputs({
    q: {
      categories: argv.categories || "",
      "analysis.timeout": argv["timeout-global"] || "",
      "analysis.timeout.repositories": argv["timeout-repositories"] || "",
      "recent.load": argv["recent-load"] || "",
      "recent.days": argv["recent-days"] || "",
    },
    account: "bypass",
  })

  //Prepare call
  const imports = await import("../../../app/metrics/utils.mjs")
  const rest = argv.token ? new OctokitRest.Octokit({auth: argv.token, baseUrl: argv["api-url"]}) : null

  //Language analysis
  console.log(`analysis mode             | ${mode}`)
  console.log(`login                     | ${login}`)
  console.log(`rest token                | ${rest ? "(provided)" : "(none)"}`)
  console.log(`commits authoring         | ${authoring}`)
  console.log(`analysis timeout (global) | ${_timeout_global}`)
  switch (mode) {
    case "recent": {
      console.log(`events to load            | ${_recent_load}`)
      console.log(`events maximum age        | ${_recent_days}`)
      return new RecentAnalyzer(login, {rest, shell: imports, authoring, categories, timeout: {global: _timeout_global, repositories: _timeout_repositories}, load: _recent_load, days: _recent_days}).run({})
    }
    case "indepth": {
      console.log(`repositories              | ${repositories}`)
      return new IndepthAnalyzer(login, {rest, shell: imports, authoring, categories, timeout: {global: _timeout_global, repositories: _timeout_repositories}}).run({repositories})
    }
  }
}
