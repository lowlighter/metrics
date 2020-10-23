//Imports
  import path from "path"
  import fs from "fs"
  import metrics from "../src/metrics.mjs"
  import setup from "../src/setup.mjs"
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

    //Perform tests
      await test.build()
      for (const template of [
        "classic",
        "terminal",
      ]) {
        for (const q of [
          {},
          {followup:1},
          {languages:1},
          {followup:1, languages:1},
          {habits:1, "habits.events":1},
          {lines:1},
          {traffic:1},
          {selfskip:1},
          {pagespeed:1},
          {followup:1, languages:1, habits:1, "habits.events":1, lines:1, traffic:1, selfskip:1, pagespeed:1}
        ]) {
          await test.metrics({graphql, rest, q:{template, repositories:1, ...q}})
        }
      }
  }

/** Metrics tests */
  test.metrics = async function ({graphql, rest, q}) {
    //Preparation
      console.log(`### Checking metrics with plugins [${Object.keys(q).filter(key => /^\w+$/.test(key)).join(", ")}]`)
      const plugins = {
        lines:{enabled:true},
        traffic:{enabled:true},
        pagespeed:{enabled:true},
        habits:{enabled:true},
        selfskip:{enabled:true},
        languages:{enabled:true},
        followup:{enabled:true},
      }

    //Compute render
      console.log("#### Checking that SVG can be generated")
      const conf = await setup({log:false})
      const rendered = await metrics({login:"lowlighter", q}, {graphql, rest, plugins, conf})

    //Ensure it's a well-formed SVG image
      console.log("#### Checking that generated SVG can be parsed")
      const parsed = libxmljs.parseXml(rendered)
      if (parsed.errors.length)
        throw new Error(`Malformed SVG : \n${parsed.errors.join("\n")}`)
  }

/** Build test */
  test.build = async function () {
    //Ensure that action has been rebuild
      console.log("### Checking that code has been rebuild")
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
