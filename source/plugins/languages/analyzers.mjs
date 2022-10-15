//Imports
import { IndepthAnalyzer } from "./analyzer/indepth.mjs"
import { RecentAnalyzer } from "./analyzer/recent.mjs"
import { cli } from "./analyzer/cli.mjs"

/**Indepth analyzer */
export async function indepth({login, data, imports, rest, context, repositories}, {skipped, categories, timeout}) {
  return new IndepthAnalyzer(login, {shell:imports, uid:data.user.databaseId, skipped, authoring:data.shared["commits.authoring"], timeout, rest, context}).run({repositories, categories})
}

/**Recent languages activity */
export async function recent({login, data, imports, rest, context, account}, {skipped = [], categories, days = 0, load = 0, tempdir = "recent", timeout}) {
  return new RecentAnalyzer(login, {shell:imports, uid:data.user.databaseId, skipped, authoring:data.shared["commits.authoring"], timeout, account, rest, context, days}).run({categories, tempdir, load})
}

//import.meta.main
if (/languages.analyzers.mjs$/.test(process.argv[1])) {
  (async () => {
    console.log(await cli())
    process.exit(0)
  })()
}
