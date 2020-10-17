//Imports
  import path from "path"
  import fs from "fs"
  import metrics from "../src/metrics.mjs"
  import build from "../utils/build.mjs"
  import octokit from "@octokit/graphql"
  import OctokitRest from "@octokit/rest"
  import libxmljs from "libxmljs"
  import url from "url"

//Dirname
  const __dirname =  path.join(path.dirname(url.fileURLToPath(import.meta.url)), "..", "action")

//Die on unhandled rejections
  process.on("unhandledRejection", error => { throw error })

//Load GitHub handlers
  const token = process.argv.slice(2)[0] ?? "73a71c11ec07d9b114f5e2af26a3cdde1c6fe65a"
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

  console.log("Test success !")