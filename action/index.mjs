//Imports
  import path from "path"
  import * as _metrics from "./../src/metrics.mjs"
  import * as _octokit from "@octokit/graphql"
  import * as _core from "@actions/core"
  import * as _github from "@actions/github"
  import * as _axios from "axios"

;((async function () {
  //Hack because ES modules are not correctly transpiled with ncc
    const [core, github, octokit, axios, metrics] = [_core, _github, _octokit, _axios, _metrics].map(m => (m && m.default) ? m.default : m)
  //Yaml boolean converter
    const bool = (value, defaulted = false) => typeof value === "string" ? /^(?:[Tt]rue|[Oo]n|[Yy]es)$/.test(value) : defaulted
  //Runner
    try {
      //Initialization
        console.log(`GitHub metrics as SVG image`)
        console.log(`========================================================`)
        console.log(`Version             | <#version>`)
        process.on("unhandledRejection", error => { throw error })

      //Skip process if needed
      console.log((github.eventName === "push"), github.context.payload, github.context.payload.head_commit)
        if ((github.eventName === "push")&&(github.context.payload)&&(github.context.payload.head_commit)) {
          console.log(github.context.payload.head_commit.message)
          if (/\[Skip GitHub Action\]/.test(github.context.payload.head_commit.message)) {
            console.log(`Skipped because [Skip GitHub Action] is in commit message`)
            process.exit(0)
          }
        }
        console.log(github.event)

      //Load svg template, style and query
        const template = `<#include template.svg>`, style = `<#include style.css>`, query = `<#include query.graphql>`
        console.log(`Templates           | loaded`)

      //Token for data gathering
        const token = core.getInput("token")
        console.log(`Github token        | ${token ? "provided" : "missing"}`)
        if (!token)
          throw new Error("You must provide a valid GitHub token")
        const graphql = octokit.graphql.defaults({headers:{authorization: `token ${token}`}})
        console.log(`Github GraphQL API  | ok`)
        const rest = github.getOctokit(token)
        console.log(`Github REST API     | ok`)

      //SVG output
        const filename = core.getInput("filename") || "github-metrics.svg"
        const output = path.join(filename)
        console.log(`SVG output file     | ${output}`)

      //SVG optimization
        const optimize = bool(core.getInput("optimize"), true)
        console.log(`SVG optimization    | ${optimize}`)

      //GitHub user
        const user = core.getInput("user") || (await rest.users.getAuthenticated()).data.login
        console.log(`GitHub user         | ${user}`)

      //Debug mode
        const debug = bool(core.getInput("debug"))
        if (!debug)
          console.debug = () => null
        console.log(`Debug mode          | ${debug}`)

      //Additional plugins
        const plugins = {
          lines:{enabled:bool(core.getInput("plugin_lines"))},
          traffic:{enabled:bool(core.getInput("plugin_traffic"))},
          pagespeed:{enabled:bool(core.getInput("plugin_pagespeed"))},
          habits:{enabled:bool(core.getInput("plugin_habits"))},
          selfskip:{enabled:bool(core.getInput("plugin_selfskip"))},
        }
        const q = Object.fromEntries(Object.entries(plugins).filter(([key, plugin]) => plugin.enabled).map(([key]) => [key, true]))
        console.log(`Plugins enabled     | ${Object.entries(plugins).filter(([key, plugin]) => plugin.enabled).map(([key]) => key).join(", ")}`)
        if (plugins.pagespeed.enabled) {
          plugins.pagespeed.token = core.getInput("pagespeed_token")
          console.log(`Pagespeed token     | ${plugins.pagespeed.token ? "provided" : "missing"}`)
        }

      //Render metrics
        const rendered = await metrics({login:user, q}, {template, style, query, graphql, rest, plugins, optimize})
        console.log(`Render              | complete`)

      //Commit to repository
        {
          //Committer token
            const token = core.getInput("committer_token") || core.getInput("token")
            console.log(`Committer token     | ${token ? "provided" : "missing"}`)
            if (!token)
              throw new Error("You must provide a valid GitHub token")
            const rest = github.getOctokit(token)
            console.log(`Committer REST API  | ok`)
            console.log(`Committer           | ${(await rest.users.getAuthenticated()).data.login}`)
          //Retrieve previous render SHA to be able to update file content through API
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
          //Update file content through API
            await rest.repos.createOrUpdateFileContents({
              owner:user, repo:user, path:filename, sha, message:`Update ${filename} - [Skip GitHub Action]`,
              content:Buffer.from(rendered).toString("base64"),
            })
            console.log(`Commit to repo      | ok`)
        }

      //Success
        console.log(`Success !`)
        process.exit(0)

  //Errors
    } catch (error) {
      console.error(error)
      core.setFailed(error.message)
      process.exit(1)
    }
})()).catch(error => process.exit(1))