//Imports
import { IndepthAnalyzer } from "./indepth.mjs"

/**Cli */
export async function cli() {
  //Parse inputs
  const [_authoring, path] = process.argv.slice(2)
  if ((!_authoring) || (!path)) {
    console.log("Usage is:\n  npm run indepth -- <commits authoring> <repository local path>\n\n")
    process.exit(1)
  }
  const {default: setup} = await import("../../../app/metrics/setup.mjs")
  const {conf: {metadata}} = await setup({log: false})
  const {"commits.authoring": authoring} = await metadata.plugins.base.inputs({q: {"commits.authoring": _authoring}, account: "bypass"})

  //Prepare call
  const imports = await import("../../../app/metrics/utils.mjs")
  console.debug = log => /exited with code null/.test(log) ? console.error(log.replace(/^.*--max-count=(?<step>\d+) --skip=(?<start>\d+).*$/, (_, step, start) => `error: skipped commits ${start} from ${Number(start) + Number(step)}`)) : null

  //Analyze repository
  console.log(`commits authoring | ${authoring}\nrepository path   | ${path}\n`)
  return new IndepthAnalyzer("cli", {shell:imports, authoring}).analyze(path)
}
