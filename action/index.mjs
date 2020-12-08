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

      //Load svg template, style, fonts and query
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
        for (const part of conf.settings.plugins.base.parts)
          base[`base.${part}`] = parts.includes(part)
        console.log(`Base parts          | ${parts.join(", ") || "(none)"}`)

      //Additional plugins
        const plugins = {
          lines:{enabled:bool(core.getInput("plugin_lines"))},
          traffic:{enabled:bool(core.getInput("plugin_traffic"))},
          pagespeed:{enabled:bool(core.getInput("plugin_pagespeed"))},
          habits:{enabled:bool(core.getInput("plugin_habits")), from:Number(core.getInput("plugin_habits_from")) || 100},
          selfskip:{enabled:bool(core.getInput("plugin_selfskip"))},
          languages:{enabled:bool(core.getInput("plugin_languages"))},
          followup:{enabled:bool(core.getInput("plugin_followup"))},
          music:{enabled:bool(core.getInput("plugin_music"))},
          posts:{enabled:bool(core.getInput("plugin_posts"))},
          isocalendar:{enabled:bool(core.getInput("plugin_isocalendar"))},
          gists:{enabled:bool(core.getInput("plugin_gists"))},
          topics:{enabled:bool(core.getInput("plugin_topics"))},
          projects:{enabled:bool(core.getInput("projects"))},
        }
        let q = Object.fromEntries(Object.entries(plugins).filter(([key, plugin]) => plugin.enabled).map(([key]) => [key, true]))
        console.log(`Plugins enabled     | ${Object.entries(plugins).filter(([key, plugin]) => plugin.enabled).map(([key]) => key).join(", ")}`)
      //Additional plugins options
        //Pagespeed
          if (plugins.pagespeed.enabled) {
            plugins.pagespeed.token = core.getInput("plugin_pagespeed_token")
            console.log(`Pagespeed token     | ${plugins.pagespeed.token ? "provided" : "missing"}`)
          }
        //Music
          if (plugins.music.enabled) {
            for (const option of ["provider", "mode", "playlist", "limit"])
              q[`music.${option}`] = core.getInput(`plugin_music_${option}`) || null
            console.log(`Music provider      | ${q["music.provider"]}`)
            console.log(`Music plugin mode   | ${q["music.mode"]}`)
            console.log(`Music playlist      | ${q["music.playlist"]}`)
            console.log(`Music tracks limit  | ${q["music.limit"]}`)
            plugins.music.token = core.getInput("plugin_music_token") || ""
            console.log(`Music token         | ${plugins.music.token ? "provided" : "missing"}`)
          }
        //Posts
          if (plugins.posts.enabled) {
            for (const option of ["source", "limit"])
              q[`posts.${option}`] = core.getInput(`plugin_posts_${option}`) || null
            console.log(`Posts provider      | ${q["posts.provider"]}`)
            console.log(`Posts limit         | ${q["posts.limit"]}`)
          }
        //Isocalendar
          if (plugins.isocalendar.enabled) {
            q["isocalendar.duration"] = core.getInput("plugin_isocalendar_duration") ?? "half-year"
            console.log(`Isocalendar duration| ${q["isocalendar.duration"]}`)
          }
        //Topics
          if (plugins.topics.enabled) {
            for (const option of ["sort", "limit"])
              q[`topics.${option}`] = core.getInput(`plugin_topics_${option}`) || null
            console.log(`Topics sort mode    | ${q["topics.sort"]}`)
            console.log(`Topics limit        | ${q["topics.limit"]}`)
          }
        //Projects
          if (plugins.projects.enabled) {
            for (const option of ["limit"])
              q[`projects.${option}`] = core.getInput(`plugin_projects_${option}`) || null
            console.log(`Projects limit        | ${q["projects.limit"]}`)
          }

      //Repositories to use
        const repositories = Number(core.getInput("repositories")) || 100
        console.log(`Repositories to use | ${repositories}`)

      //Die on plugins errors
        const die = bool(core.getInput("plugins_errors_fatal"))
        console.log(`Plugin errors       | ${die ? "die" : "ignore"}`)

      //Built query
        q = {...q, base:false, ...base, repositories, template}

      //Render metrics
        const rendered = await metrics({login:user, q}, {graphql, rest, plugins, conf, die})
        console.log(`Render              | complete`)

      //Verify svg
        const verify = bool(core.getInput("verify"))
        console.log(`Verify SVG          | ${verify}`)
        if (verify) {
          const [libxmljs] = [await import("libxmljs")].map(m => (m && m.default) ? m.default : m)
          const parsed = libxmljs.parseXml(rendered)
          if (parsed.errors.length)
            throw new Error(`Malformed SVG : \n${parsed.errors.join("\n")}`)
          console.log(`SVG valid           | yes`)
        }

      //Commit to repository
        const dryrun = bool(core.getInput("dryrun"))
        if (dryrun)
          console.log(`Dry-run             | complete`)
        else {
          //Repository
            console.log(`Repository          | ${github.context.repo.owner}/${github.context.repo.repo}`)
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
              const {data} = await rest.repos.getContent({...github.context.repo, path:filename})
              sha = data.sha
            } catch (error) { console.debug(error) }
            console.log(`Previous render sha | ${sha || "none"}`)
          //Update file content through API
            await rest.repos.createOrUpdateFileContents({
              ...github.context.repo, path:filename, message:`Update ${filename} - [Skip GitHub Action]`,
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