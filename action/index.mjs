//Imports
  import path from "path"
  import * as _metrics from "./../src/metrics.mjs"
  import * as _octokit from "@octokit/graphql"
  import * as _core from "@actions/core"
  import * as _github from "@actions/github"

;((async function () {
  //Hack because ES modules are not correctly transpiled with ncc
    const [core, github, octokit, metrics] = [_core, _github, _octokit, _metrics].map(m => (m && m.default) ? m.default : m)
  //Runner
    try {
      //Initialization
        console.log(`GitHub metrics as SVG image`)
        console.log(`========================================================`)

      //Load svg template, style and query
        const template = `<#include template.svg>`, style = `<#include style.css>`, query = `<#include query.graphql>`
        console.log(`Templates           | loaded`)

      //Initialization
        const [token, user, filename] = [core.getInput("token"), core.getInput("user"), core.getInput("filename", {default:"github-metrics.svg"})]
        const output = path.join(filename)
        console.log(`GitHub user         | ${user}`)
        console.log(`Output file         | ${output}`)
        console.log(`Github token        | ${token ? "provided" : "missing"}`)
        if (!token)
          throw new Error("You must provide a valid GitHub token")
        const graphql = octokit.graphql.defaults({headers:{authorization: `token ${token}`}})
        const rest = github.getOctokit(token)

      //Additional plugins
        const plugins = {}, q = {}
        if (core.getInput("pagespeed_token")) {
          plugins.pagespeed = {enabled:true, token:core.getInput("pagespeed_token")}
          q.pagespeed = true
        }

      //Render metrics
        const rendered = await metrics({login:user, q}, {template, style, query, graphql, plugins})
        console.log(`Render              | complete`)

      //Commit to repository
        let sha = undefined
        try {
          const {data} = await rest.repos.getContent({
            owner:user,
            repo:user,
            path:filename,
          })
          sha = data.sha
        } catch (error) { }
        console.log(`Previous render sha | ${sha || "none"}`)
        await rest.repos.createOrUpdateFileContents({
          owner:user, repo:user, path:filename, sha, message:`Update ${filename} - [Skip GitHub Action]`,
          content:Buffer.from(rendered).toString("base64"),
        })
        console.log(`Commit to repo      | ok`)

      //Success
        console.log(`Success !`)
  //Errors
    } catch (error) {
      console.error(error)
      core.setFailed(error.message)
      process.exit(1)
    }
})()).catch(error => process.exit(1))