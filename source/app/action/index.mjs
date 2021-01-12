//Imports
  import core from "@actions/core"
  import github from "@actions/github"
  import octokit from "@octokit/graphql"
  import setup from "../setup.mjs"
  import mocks from "../mocks.mjs"
  import metrics from "../metrics.mjs"

;((async function () {
  //Input parser
    const input = {
      get:(name) => {
        const value = `${core.getInput(name)}`.trim()
        try { return decodeURIComponent(value) }
        catch { return value}
      },
      bool:(name, {default:defaulted = undefined} = {}) => /^(?:[Tt]rue|[Oo]n|[Yy]es)$/.test(input.get(name)) ? true : /^(?:[Ff]alse|[Oo]ff|[Nn]o)$/.test(input.get(name)) ? false : defaulted,
      number:(name, {default:defaulted = undefined} = {}) => Number.isFinite(Number(input.get(name))) ? Number(input.get(name)) : defaulted,
      string:(name, {default:defaulted = undefined} = {}) => input.get(name) || defaulted,
      array:(name, {separator = ","} = {}) => input.get(name).split(separator).map(value => value.trim()).filter(value => value),
      object:(name) => JSON.parse(input.get(name) || "{}"),
    }
  //Info logger
    const info = (left, right, {token = false} = {}) =>  console.log(`${`${left}`.padEnd(48)} │ ${
      Array.isArray(right) ? right.join(", ") || "(none)" :
      right === undefined ? "(default)" :
      token ? /^MOCKED/.test(right) ? "(MOCKED TOKEN)" : (right ? "(provided)" : "(missing)") :
      typeof right === "object" ? JSON.stringify(right) :
      right
    }`)
  //Debug message buffer
    const debugged = []
  //Runner
    try {
      //Initialization
        console.log("─".repeat(64))
        console.log(`Metrics`)
        console.log("─".repeat(64))
        process.on("unhandledRejection", error => { throw error })

      //Skip process if needed
        if ((github.context.eventName === "push")&&(github.context.payload?.head_commit)) {
          if (/\[Skip GitHub Action\]/.test(github.context.payload.head_commit.message)) {
            console.log(`Skipped because [Skip GitHub Action] is in commit message`)
            process.exit(0)
          }
        }

      //Load configuration
        const {conf, Plugins, Templates} = await setup({log:false, nosettings:true})
        info("Setup", "complete")
        info("Version", conf.package.version)

      //Debug mode
        const debug = input.bool("debug", {default:false})
        info("Debug mode", debug)
        if (!debug)
          console.debug = message => debugged.push(message)
        const dflags = input.array("debug_flags", {separator:" "})
        info("Debug flags", dflags)

      //Load svg template, style, fonts and query
        const template = input.string("template", {default:"classic"})
        info("Template used", template)

      //Token for data gathering
        const token = input.string("token")
        info("GitHub token", token, {token:true})
        if (!token)
          throw new Error("You must provide a valid GitHub token to gather your metrics")
        const api = {}
        api.graphql = octokit.graphql.defaults({headers:{authorization: `token ${token}`}})
        info("Github GraphQL API", "ok")
        api.rest = github.getOctokit(token)
        info("Github REST API", "ok")
      //Apply mocking if needed
        if (input.bool("use_mocked_data", {default:false})) {
          Object.assign(api, await mocks(api))
          info("Use mocked API", true)
        }
      //Extract octokits
        const {graphql, rest} = api

      //SVG output
        const filename = input.string("filename", {default:"github-metrics.svg"})
        info("SVG output", filename)

      //SVG optimization
        const optimize = input.bool("optimize", {default:true})
        conf.optimize = optimize
        info("SVG optimization", optimize)

      //Verify svg
        const verify = input.bool("verify")
        info("SVG verification after generation", verify)

      //GitHub user
        let authenticated
        try {
          authenticated = (await rest.users.getAuthenticated()).data.login
        }
        catch {
          authenticated = github.context.repo.owner
        }
        const user = input.string("user", {default:authenticated})
        info("Target GitHub user", user)

      //Base elements
        const base = {}
        const parts = input.array("base")
        for (const part of conf.settings.plugins.base.parts)
          base[`base.${part}`] = parts.includes(part)
        info("Base parts", parts)

      //Config
        const config = {
          "config.timezone":input.string("config_timezone"),
          "config.output":input.string("config_output"),
          "config.animations":input.bool("config_animations"),
          "config.padding":input.string("config_padding"),
          "config.order":input.array("config_order"),
        }
        info("Timezone", config["config.timezone"] ?? "(system default)")
        info("Convert SVG", config["config.output"] ?? "(no)")
        info("Enable SVG animations", config["config.animations"])
        info("SVG bottom padding", config["config.padding"])
        info("Content order", config["config.order"])

      //Additional plugins
        const plugins = {
          lines:{enabled:input.bool("plugin_lines")},
          traffic:{enabled:input.bool("plugin_traffic")},
          pagespeed:{enabled:input.bool("plugin_pagespeed")},
          habits:{enabled:input.bool("plugin_habits")},
          languages:{enabled:input.bool("plugin_languages")},
          followup:{enabled:input.bool("plugin_followup")},
          music:{enabled:input.bool("plugin_music")},
          posts:{enabled:input.bool("plugin_posts")},
          isocalendar:{enabled:input.bool("plugin_isocalendar")},
          gists:{enabled:input.bool("plugin_gists")},
          topics:{enabled:input.bool("plugin_topics")},
          projects:{enabled:input.bool("plugin_projects")},
          tweets:{enabled:input.bool("plugin_tweets")},
          stars:{enabled:input.bool("plugin_stars")},
          stargazers:{enabled:input.bool("plugin_stargazers")},
          activity:{enabled:input.bool("plugin_activity")},
          people:{enabled:input.bool("plugin_people")},
        }
        let q = Object.fromEntries(Object.entries(plugins).filter(([key, plugin]) => plugin.enabled).map(([key]) => [key, true]))
        info("Plugins enabled", Object.entries(plugins).filter(([key, plugin]) => plugin.enabled).map(([key]) => key))
      //Additional plugins options
        //Pagespeed
          if (plugins.pagespeed.enabled) {
            plugins.pagespeed.token = input.string("plugin_pagespeed_token")
            info("Pagespeed token", plugins.pagespeed.token, {token:true})
            for (const option of ["url"])
              info(`Pagespeed ${option}`, q[`pagespeed.${option}`] = input.string(`plugin_pagespeed_${option}`))
            for (const option of ["detailed", "screenshot"])
              info(`Pagespeed ${option}`, q[`pagespeed.${option}`] = input.bool(`plugin_pagespeed_${option}`))
          }
        //Languages
          if (plugins.languages.enabled) {
            for (const option of ["ignored", "skipped"])
              info(`Languages ${option}`, q[`languages.${option}`] = input.array(`plugin_languages_${option}`))
          }
        //Habits
          if (plugins.habits.enabled) {
            for (const option of ["facts", "charts"])
              info(`Habits ${option}`, q[`habits.${option}`] = input.bool(`plugin_habits_${option}`))
            for (const option of ["from", "days"])
              info(`Habits ${option}`, q[`habits.${option}`] = input.number(`plugin_habits_${option}`))
          }
        //Music
          if (plugins.music.enabled) {
            plugins.music.token = input.string("plugin_music_token")
            info("Music token", plugins.music.token, {token:true})
            for (const option of ["provider", "mode", "playlist"])
              info(`Music ${option}`, q[`music.${option}`] = input.string(`plugin_music_${option}`))
            for (const option of ["limit"])
              info(`Music ${option}`, q[`music.${option}`] = input.number(`plugin_music_${option}`))
          }
        //Posts
          if (plugins.posts.enabled) {
            for (const option of ["source", "user"])
              info(`Posts ${option}`, q[`posts.${option}`] = input.string(`plugin_posts_${option}`))
            for (const option of ["limit"])
              info(`Posts ${option}`, q[`posts.${option}`] = input.number(`plugin_posts_${option}`))
          }
        //Isocalendar
          if (plugins.isocalendar.enabled) {
            for (const option of ["duration"])
              info(`Isocalendar ${option}`, q[`isocalendar.${option}`] = input.string(`plugin_isocalendar_${option}`))
          }
        //Topics
          if (plugins.topics.enabled) {
            for (const option of ["mode", "sort"])
              info(`Topics ${option}`, q[`topics.${option}`] = input.string(`plugin_topics_${option}`))
            for (const option of ["limit"])
              info(`Topics ${option}`, q[`topics.${option}`] = input.number(`plugin_topics_${option}`))
          }
        //Projects
          if (plugins.projects.enabled) {
            for (const option of ["repositories"])
              info(`Projects ${option}`, q[`projects.${option}`] = input.string(`plugin_projects_${option}`))
            for (const option of ["limit"])
              info(`Projects ${option}`, q[`projects.${option}`] = input.number(`plugin_projects_${option}`))
          }
        //Tweets
          if (plugins.tweets.enabled) {
            plugins.tweets.token = input.string("plugin_tweets_token")
            info("Tweets token", plugins.tweets.token, {token:true})
            for (const option of ["user"])
              info(`Tweets ${option}`, q[`tweets.${option}`] = input.string(`plugin_tweets_${option}`))
            for (const option of ["limit"])
              info(`Tweets ${option}`, q[`tweets.${option}`] = input.number(`plugin_tweets_${option}`))
          }
        //Stars
          if (plugins.stars.enabled) {
            for (const option of ["limit"])
              info(`Stars ${option}`, q[`stars.${option}`] = input.number(`plugin_stars_${option}`))
          }
        //Activity
          if (plugins.activity.enabled) {
            for (const option of ["limit", "days"])
              info(`Activity ${option}`, q[`activity.${option}`] = input.number(`plugin_activity_${option}`))
            for (const option of ["filter"])
              info(`Activity ${option}`, q[`activity.${option}`] = input.array(`plugin_activity_${option}`))
          }
        //People
          if (plugins.people.enabled) {
            for (const option of ["limit", "size"])
              info(`People ${option}`, q[`people.${option}`] = input.number(`plugin_people_${option}`))
            for (const option of ["types"])
              info(`People ${option}`, q[`people.${option}`] = input.array(`plugin_people_${option}`))
            for (const option of ["identicons"])
              info(`People ${option}`, q[`people.${option}`] = input.bool(`plugin_people_${option}`))
          }

      //Repositories to use
        const repositories = input.number("repositories")
        info("Repositories to process", repositories)

      //Die on plugins errors
        const die = input.bool("plugins_errors_fatal")
        info("Plugin errors", die ? "(exit with error)" : "(displayed in generated SVG)")

      //Build query
        const query = input.object("query")
        info("Query additional params", query)
        q = {...query, ...q, base:false, ...base, ...config, repositories, template}

      //Render metrics
        const {rendered} = await metrics({login:user, q, dflags}, {graphql, rest, plugins, conf, die, verify}, {Plugins, Templates})
        info("Rendering", "complete")

      //Commit to repository
        const dryrun = input.bool("dryrun")
        if (dryrun)
          info("Dry-run", "complete")
        else {
          //Repository and branch
            const branch = input.string("committer_branch", {default:github.context.ref.replace(/^refs[/]heads[/]/, "")})
            info("Current repository", `${github.context.repo.owner}/${github.context.repo.repo}`)
            info("Current branch", branch)
          //Committer token
            const token = input.string("committer_token", {default:input.string("token")})
            info("Committer token", token, {token:true})
            if (!token)
              throw new Error("You must provide a valid GitHub token to commit your metrics")
            const rest = github.getOctokit(token)
            info("Committer REST API", "ok")
            try {
              info("Committer", (await rest.users.getAuthenticated()).data.login)
            }
            catch {
              info("Committer", "(github-actions)")
            }
          //Retrieve previous render SHA to be able to update file content through API
            let sha = null
            try {
              const {repository:{object:{oid}}} = await graphql(`
                  query Sha {
                    repository(owner: "${github.context.repo.owner}", name: "${github.context.repo.repo}") {
                      object(expression: "${branch}:${filename}") { ... on Blob { oid } }
                    }
                  }
                `
              )
              sha = oid
            } catch (error) { console.debug(error) }
            info("Previous render sha", sha ?? "(none)")
          //Update file content through API
            await rest.repos.createOrUpdateFileContents({
              ...github.context.repo, path:filename, message:`Update ${filename} - [Skip GitHub Action]`,
              content:Buffer.from(rendered).toString("base64"),
              ...(sha ? {sha} : {})
            })
            info("Commit to current repository", "ok")
        }

      //Success
        console.log(`Success, thanks for using metrics !`)
        process.exit(0)
    }
  //Errors
    catch (error) {
      console.error(error)
      if (!input.bool("debug"))
        for (const log of ["─".repeat(64), "An error occured, logging debug message :", ...debugged])
          console.log(log)
      core.setFailed(error.message)
      process.exit(1)
    }
})()).catch(error => process.exit(1))