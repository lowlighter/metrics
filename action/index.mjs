//Imports
  import * as _setup from "./../src/setup.mjs"
  import * as _metrics from "./../src/metrics.mjs"
  import * as _octokit from "@octokit/graphql"
  import * as _core from "@actions/core"
  import * as _github from "@actions/github"

;((async function () {
  //Hack because ES modules are not correctly transpiled with ncc
    const [core, github, octokit, setup, metrics] = [_core, _github, _octokit, _setup, _metrics].map(m => (m && m.default) ? m.default : m)
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
        if ((github.context.eventName === "push")&&(github.context.payload)&&(github.context.payload.head_commit)) {
          if (/\[Skip GitHub Action\]/.test(github.context.payload.head_commit.message)) {
            console.log(`Skipped because [Skip GitHub Action] is in commit message`)
            process.exit(0)
          }
        }

      //Load configuration
        const conf = await setup({log:false})
        console.log(`Configuration       | loaded`)

      //Load svg template, style and query
        const template = core.getInput("template") || "classic"
        console.log(`Template to use     | ${template}`)

      //Token for data gathering
        const token = core.getInput("token")
        console.log(`Github token        | ${token ? "provided" : "missing"}`)
        if (!token)
          throw new Error("You must provide a valid GitHub token to gather your metrics")
        const graphql = octokit.graphql.defaults({headers:{authorization: `token ${token}`}})
        console.log(`Github GraphQL API  | ok`)
        const rest = github.getOctokit(token)
        console.log(`Github REST API     | ok`)

      //SVG output
        const filename = core.getInput("filename") || "github-metrics.svg"
        console.log(`SVG output file     | ${filename}`)

      //SVG optimization
        const optimize = bool(core.getInput("optimize"), true)
        conf.optimize = optimize
        console.log(`SVG optimization    | ${optimize}`)

      //GitHub user
        const user = core.getInput("user") || (await rest.users.getAuthenticated()).data.login
        console.log(`GitHub user         | ${user}`)

      //Debug mode
        const debug = bool(core.getInput("debug"))
        if (!debug)
          console.debug = () => null
        console.log(`Debug mode          | ${debug}`)

      //Base elements
        const base = {}
        let parts = (core.getInput("base")||"").split(",").map(part => part.trim())
        if (!pars.length)
          parts = conf.settings.plugins.base.parts
        for (const part of parts)
          base[`base.${part}`] = true
        console.log(`Base parts         | ${parts.join(", ")}`)

      //Additional plugins
        const plugins = {
          lines:{enabled:bool(core.getInput("plugin_lines"))},
          traffic:{enabled:bool(core.getInput("plugin_traffic"))},
          pagespeed:{enabled:bool(core.getInput("plugin_pagespeed"))},
          habits:{enabled:bool(core.getInput("plugin_habits")), from:Number(core.getInput("plugin_habits_from")) || 100},
          selfskip:{enabled:bool(core.getInput("plugin_selfskip"))},
          languages:{enabled:bool(core.getInput("plugin_languages"))},
          followup:{enabled:bool(core.getInput("plugin_followup"))},
        }
        const q = Object.fromEntries(Object.entries(plugins).filter(([key, plugin]) => plugin.enabled).map(([key]) => [key, true]))
        console.log(`Plugins enabled     | ${Object.entries(plugins).filter(([key, plugin]) => plugin.enabled).map(([key]) => key).join(", ")}`)
        if (plugins.pagespeed.enabled) {
          plugins.pagespeed.token = core.getInput("pagespeed_token")
          console.log(`Pagespeed token     | ${plugins.pagespeed.token ? "provided" : "missing"}`)
        }

      //Repositories to use
        const repositories = Number(core.getInput("repositories")) || 100
        console.log(`Repositories to use | ${repositories}`)

      //Render metrics
        const rendered = await metrics({login:user, q:{...q, ...base, repositories, template}}, {graphql, rest, plugins, conf})
        console.log(`Render              | complete`)

      //Commit to repository
        {
          //Committer token
            const token = core.getInput("committer_token") || core.getInput("token")
            console.log(`Committer token     | ${token ? "provided" : "missing"}`)
            if (!token)
              throw new Error("You must provide a valid GitHub token to commit your metrics")
            const rest = github.getOctokit(token)
            console.log(`Committer REST API  | ok`)
            console.log(`Committer           | ${(await rest.users.getAuthenticated()).data.login}`)
          //Retrieve previous render SHA to be able to update file content through API
            let sha = null
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
              owner:user, repo:user, path:filename, message:`Update ${filename} - [Skip GitHub Action]`,
              content:Buffer.from(rendered).toString("base64"),
              ...(sha ? {sha} : {})
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