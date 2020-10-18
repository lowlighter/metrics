//Imports
  import path from "path"
  import fs from "fs"
  import metrics from "../src/metrics.mjs"
  import build from "../utils/build.mjs"
  import octokit from "@octokit/graphql"
  import OctokitRest from "@octokit/rest"
  import libxmljs from "libxmljs"
  import url from "url"

//Initialization
  const __dirname =  path.join(path.dirname(url.fileURLToPath(import.meta.url)), "..", "action")
  process.on("unhandledRejection", error => { throw error })

/** Test function */
  export default async function test() {
    //Load GitHub handlers
      const token = process.argv.slice(2)[0]
      const graphql = octokit.graphql.defaults({headers:{authorization: `token ${token}`}})
      const rest = new OctokitRest.Octokit({auth:token})

    //Load svg template, style and query
      const [template, style, query] = await Promise.all(["template.svg", "style.css", "query.graphql"].map(async file => `${await fs.promises.readFile(path.join("src", file))}`))

    //Compute render
      const rendered = await metrics({login:"lowlighter", q:{}}, {template, style, query, graphql, rest, plugins:{}})

    //Ensure it's a well-formed SVG image
      const parsed = libxmljs.parseXml(rendered)
      if (parsed.errors.length)
        throw new Error(`Malformed SVG : \n${parsed.errors.join("\n")}`)

    //Ensure that action has been rebuild
      const action = `${await fs.promises.readFile(`${__dirname}/dist/index.js`)}`
      const code = await build()
      if (action !== code)
        throw new Error(`GitHub Action has not been rebuild. Run "npm run build" to solve this issue`)
  }

  //Main
    if (/metrics.mjs/.test(process.argv[1])) {
      //Test
        await test()
        console.log("Test success !")
    }
