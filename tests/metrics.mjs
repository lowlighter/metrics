//Imports
  import path from "path"
  import fs from "fs"
  import metrics from "../src/metrics.mjs"
  import octokit from "@octokit/graphql"
  import OctokitRest from "@octokit/rest"
  import libxmljs from "libxmljs"

//Die on unhandled rejections
  process.on("unhandledRejection", error => { throw error })

//Load GitHub handlers
  const token = process.argv.slice(2)[0] ?? ""
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