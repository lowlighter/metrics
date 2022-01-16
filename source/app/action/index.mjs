//Imports
import core from "@actions/core"
import github from "@actions/github"
import octokit from "@octokit/graphql"
import fs from "fs/promises"
import processes from "child_process"
import paths from "path"
import sgit from "simple-git"
import mocks from "../../../tests/mocks/index.mjs"
import metrics from "../metrics/index.mjs"
import setup from "../metrics/setup.mjs"
process.on("unhandledRejection", error => {
  throw error
})

//Debug message buffer
let DEBUG = true
const debugged = []

//Info logger
const info = (left, right, {token = false} = {}) => console.log(`${`${left}`.padEnd(56 + 9 * (/0m$/.test(left)))} │ ${
    Array.isArray(right)
      ? right.join(", ") || "(none)"
      : right === undefined
      ? "(default)"
      : token
      ? /^MOCKED/.test(right) ? "(MOCKED TOKEN)" : /^NOT_NEEDED$/.test(right) ? "(NOT NEEDED)" : (right ? "(provided)" : "(missing)")
      : typeof right === "object"
      ? JSON.stringify(right)
      : right
  }`)
info.section = (left = "", right = " ") => info(`\x1b[36m${left}\x1b[0m`, right)
info.group = ({metadata, name, inputs}) => {
  info.section(metadata.plugins[name]?.name?.match(/(?<section>[\w\s]+)/i)?.groups?.section?.trim(), " ")
  for (const [input, value] of Object.entries(inputs))
    info(metadata.plugins[name]?.inputs[input]?.description ?? input, value, {token:metadata.plugins[name]?.inputs[input]?.type === "token"})
}
info.break = () => console.log("─".repeat(88))

//Waiter
async function wait(seconds) {
  await new Promise(solve => setTimeout(solve, seconds * 1000))
}

//Retry wrapper
async function retry(func, {retries = 1, delay = 0} = {}) {
  let error = null
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.debug(`::group::Attempt ${attempt}/${retries}`)
      const result = await func()
      console.debug("::endgroup::")
      return result
    }
    catch (_error) {
      error = _error
      console.debug("::endgroup::")
      console.debug(`::warning::${error.message}`)
      await wait(delay)
    }
  }
  if (error)
    throw error
  return null
}

//Runner
(async function() {
  try {
    //Initialization
    info.break()
    info.section("Metrics")

    //Skip process if needed
    if ((github.context.eventName === "push") && (github.context.payload?.head_commit)) {
      if (/\[Skip GitHub Action\]/.test(github.context.payload.head_commit.message)) {
        console.log("Skipped because [Skip GitHub Action] is in commit message")
        process.exit(0)
      }
      if (/Auto-generated metrics for run #\d+/.test(github.context.payload.head_commit.message)) {
        console.log("Skipped because this seems to be an automated pull request merge")
        process.exit(0)
      }
    }

    //Load configuration
    const {conf, Plugins, Templates} = await setup({log:false, nosettings:true, community:{templates:core.getInput("setup_community_templates")}})
    const {metadata} = conf
    conf.settings.extras = {default:true}
    info("Setup", "complete")
    info("Version", conf.package.version)

    //Core inputs
    const {
      user:_user,
      repo:_repo,
      token,
      template,
      query,
      "setup.community.templates":_templates,
      filename:_filename,
      optimize,
      verify,
      "markdown.cache":_markdown_cache,
      debug,
      "debug.flags":dflags,
      "use.mocked.data":mocked,
      dryrun,
      "plugins.errors.fatal":die,
      "committer.token":_token,
      "committer.branch":_branch,
      "committer.message":_message,
      "committer.gist":_gist,
      "use.prebuilt.image":_image,
      retries,
      "retries.delay":retries_delay,
      "retries.output.action":retries_output_action,
      "retries.delay.output.action":retries_delay_output_action,
      "output.action":_action,
      "output.condition":_output_condition,
      delay,
      ...config
    } = metadata.plugins.core.inputs.action({core})
    const q = {...query, ...(_repo ? {repo:_repo} : null), template}
    const _output = ["svg", "jpeg", "png", "json", "markdown", "markdown-pdf", "insights"].includes(config["config.output"]) ? config["config.output"] : metadata.templates[template].formats[0] ?? null
    const filename = _filename.replace(/[*]/g, {jpeg:"jpg", markdown:"md", "markdown-pdf":"pdf", insights:"html"}[_output] ?? _output)

    //Docker image
    if (_image)
      info("Using prebuilt image", _image)

    //Debug mode and flags
    info("Debug mode", debug)
    if (!debug) {
      console.debug = message => debugged.push(message)
      DEBUG = false
    }
    info("Debug flags", dflags)
    q["debug.flags"] = dflags.join(" ")

    //Token for data gathering
    info("GitHub token", token, {token:true})
    if (!token)
      throw new Error("You must provide a valid GitHub personal token to gather your metrics (see https://github.com/lowlighter/metrics/blob/master/.github/readme/partials/setup/action/setup.md for more informations)")
    conf.settings.token = token
    const api = {}
    api.graphql = octokit.graphql.defaults({headers:{authorization:`token ${token}`}})
    info("Github GraphQL API", "ok")
    api.rest = github.getOctokit(token)
    info("Github REST API", "ok")
    //Apply mocking if needed
    if (mocked) {
      Object.assign(api, await mocks(api))
      info("Use mocked API", true)
    }
    //Test token validity
    else if (!/^NOT_NEEDED$/.test(token)) {
      const {headers} = await api.rest.request("HEAD /")
      if (!("x-oauth-scopes" in headers)) {
        throw new Error(
          'GitHub API did not send any "x-oauth-scopes" header back from provided "token". It means that your token may not be valid or you\'re using GITHUB_TOKEN which cannot be used since metrics will fetch data outside of this repository scope. Use a personal access token instead (see https://github.com/lowlighter/metrics/blob/master/.github/readme/partials/setup/action/setup.md for more informations).',
        )
      }
      info("Token validity", "seems ok")
    }
    //Extract octokits
    const {graphql, rest} = api

    //GitHub user
    let authenticated
    try {
      authenticated = (await rest.users.getAuthenticated()).data.login
    }
    catch {
      authenticated = github.context.repo.owner
    }
    conf.authenticated = authenticated
    const user = _user || authenticated
    info("GitHub account", user)
    if (q.repo)
      info("GitHub repository", `${user}/${q.repo}`)

    //Current repository
    info("Current repository", `${github.context.repo.owner}/${github.context.repo.repo}`)

    //Committer
    const committer = {}
    if (!dryrun) {
      //Compute committer informations
      committer.token = _token || token
      committer.gist = _action === "gist" ? _gist : null
      committer.commit = true
      committer.message = _message.replace(/[$][{]filename[}]/g, filename)
      committer.pr = /^pull-request/.test(_action)
      committer.merge = _action.match(/^pull-request-(?<method>merge|squash|rebase)$/)?.groups?.method ?? null
      committer.branch = _branch || github.context.ref.replace(/^refs[/]heads[/]/, "")
      committer.head = committer.pr ? `metrics-run-${github.context.runId}` : committer.branch
      info("Committer token", committer.token, {token:true})
      if (!committer.token)
        throw new Error("You must provide a valid GitHub token to commit your metrics")
      info("Committer branch", committer.branch)
      info("Committer head branch", committer.head)
      //Gist
      if (committer.gist)
        info("Committer Gist id", committer.gist)
      //Instantiate API for committer
      committer.rest = github.getOctokit(committer.token)
      info("Committer REST API", "ok")
      try {
        info("Committer account", (await committer.rest.users.getAuthenticated()).data.login)
      }
      catch {
        info("Committer account", "(github-actions)")
      }
      //Create head branch if needed
      try {
        await committer.rest.git.getRef({...github.context.repo, ref:`heads/${committer.head}`})
        info("Committer head branch status", "ok")
      }
      catch (error) {
        console.debug(error)
        if (/not found/i.test(`${error}`)) {
          const {data:{object:{sha}}} = await committer.rest.git.getRef({...github.context.repo, ref:`heads/${committer.branch}`})
          info("Committer branch current sha", sha)
          await committer.rest.git.createRef({...github.context.repo, ref:`refs/heads/${committer.head}`, sha})
          info("Committer head branch status", "(created)")
        }
        else
          throw error

      }
      //Retrieve previous render SHA to be able to update file content through API
      committer.sha = null
      try {
        const {repository:{object:{oid}}} = await graphql(
          `
            query Sha {
              repository(owner: "${github.context.repo.owner}", name: "${github.context.repo.repo}") {
                object(expression: "${committer.head}:${filename}") { ... on Blob { oid } }
              }
            }
          `,
          {headers:{authorization:`token ${committer.token}`}},
        )
        committer.sha = oid
      }
      catch (error) {
        console.debug(error)
      }
      info("Previous render sha", committer.sha ?? "(none)")
    }
    else
      info("Dry-run", true)


    //SVG file
    conf.settings.optimize = optimize
    info("SVG output", filename)
    info("SVG optimization", optimize)
    info("SVG verification after generation", verify)

    //Template
    info.break()
    info.section("Templates")
    info("Community templates", _templates)
    info("Template used", template)
    info("Query additional params", query)

    //Core config
    info.break()
    info.group({metadata, name:"core", inputs:config})
    info("Plugin errors", die ? "(exit with error)" : "(displayed in generated image)")
    const convert = _output || null
    Object.assign(q, config)
    if (/markdown/.test(convert))
      info("Markdown cache", _markdown_cache)
    if (/insights/.test(convert)) {
      try {
        await new Promise(async (solve, reject) => {
          let stdout = ""
          setTimeout(() => reject("Timeout while waiting for Insights webserver"), 5 * 60 * 1000)
          const web = await processes.spawn("node", ["/metrics/source/app/web/index.mjs"], {env:{...process.env, NO_SETTINGS:true}})
          web.stdout.on("data", data => (console.debug(`web > ${data}`), stdout += data, /Server ready !/.test(stdout) ? solve() : null))
          web.stderr.on("data", data => console.debug(`web > ${data}`))
        })
        info("Insights webserver", "ok")
      }
      catch (error) {
        info("Insights webserver", "(failed to initialize)")
        throw error
      }
    }

    //Base content
    info.break()
    const {base:parts, repositories:_repositories, ...base} = metadata.plugins.base.inputs.action({core})
    conf.settings.repositories = _repositories
    info.group({metadata, name:"base", inputs:{repositories:conf.settings.repositories, ...base}})
    info("Base sections", parts)
    base.base = false
    for (const part of conf.settings.plugins.base.parts)
      base[`base.${part}`] = parts.includes(part)
    Object.assign(q, base)

    //Additional plugins
    const plugins = {}
    for (const name of Object.keys(Plugins).filter(key => !["base", "core"].includes(key))) {
      //Parse inputs
      const {[name]:enabled, ...inputs} = metadata.plugins[name].inputs.action({core})
      plugins[name] = {enabled}
      //Register user inputs
      if (enabled) {
        info.break()
        info.group({metadata, name, inputs})
        q[name] = true
        for (const [key, value] of Object.entries(inputs)) {
          //Store token in plugin configuration
          if (metadata.plugins[name].inputs[key].type === "token")
            plugins[name][key] = value
          //Store value in query
          else
            q[`${name}.${key}`] = value
        }
      }
    }

    //Render metrics
    info.break()
    info.section("Rendering")
    let rendered = await retry(async () => {
      const {rendered} = await metrics({login:user, q}, {graphql, rest, plugins, conf, die, verify, convert}, {Plugins, Templates})
      return rendered
    }, {retries, delay:retries_delay})
    if (!rendered)
      throw new Error("Could not render metrics")
    info("Status", "complete")

    //Output condition
    info.break()
    info.section("Saving")
    info("Output condition", _output_condition)
    if ((_output_condition === "data-changed") && ((committer.commit) || (committer.pr))) {
      const {svg} = await import("../metrics/utils.mjs")
      let data = ""
      await retry(async () => {
        try {
          data = `${Buffer.from((await committer.rest.repos.getContent({...github.context.repo, ref:`heads/${committer.head}`, path:filename})).data.content, "base64")}`
        }
        catch (error) {
          if (error.response.status !== 404)
            throw error
        }
      }, {retries:retries_output_action, delay:retries_delay_output_action})
      const previous = await svg.hash(data)
      info("Previous hash", previous)
      const current = await svg.hash(rendered)
      info("Current hash", current)
      const changed = (previous !== current)
      info("Content changed", changed)
      if (!changed)
        committer.commit = false
    }

    //Save output to renders output folder
    if (dryrun)
      info("Actions to perform", "(none)")
    else {
      await fs.mkdir(paths.dirname(paths.join("/renders", filename)), {recursive:true})
      await fs.writeFile(paths.join("/renders", filename), Buffer.from(typeof rendered === "object" ? JSON.stringify(rendered) : `${rendered}`))
      info(`Save to /metrics_renders/${filename}`, "ok")
      info("Output action", _action)
    }

    //No output action apart from file on runner
    if (_action === "none") {
      info.break()
      console.log("Success, thanks for using metrics!")
      process.exit(0)
    }

    //Cache embed svg for markdown outputs
    if (/markdown/.test(convert)) {
      const regex = /(?<match><img class="metrics-cachable" data-name="(?<name>[\s\S]+?)" src="data:image[/](?<format>(?:svg[+]xml)|jpeg|png);base64,(?<content>[/+=\w]+?)">)/
      let matched = null
      while (matched = regex.exec(rendered)?.groups) { //eslint-disable-line no-cond-assign
        await retry(async () => {
          const {match, name, format, content} = matched
          let path = `${_markdown_cache}/${name}.${format.replace(/[+].*$/g, "")}`
          console.debug(`Processing ${path}`)
          let sha = null
          try {
            const {repository:{object:{oid}}} = await graphql(
              `
                query Sha {
                  repository(owner: "${github.context.repo.owner}", name: "${github.context.repo.repo}") {
                    object(expression: "${committer.head}:${path}") { ... on Blob { oid } }
                  }
                }
              `,
              {headers:{authorization:`token ${committer.token}`}},
            )
            sha = oid
          }
          catch (error) {
            console.debug(error)
          }
          finally {
            await committer.rest.repos.createOrUpdateFileContents({
              ...github.context.repo,
              path,
              content,
              message:`${committer.message} (cache)`,
              ...(sha ? {sha} : {}),
              branch:committer.pr ? committer.head : committer.branch,
            })
            rendered = rendered.replace(match, `<img src="https://github.com/${github.context.repo.owner}/${github.context.repo.repo}/blob/${committer.branch}/${path}">`)
            info(`Saving ${path}`, "ok")
          }
        }, {retries:retries_output_action, delay:retries_delay_output_action})
      }
    }

    //Check editions
    if ((committer.commit) || (committer.pr)) {
      const git = sgit()
      const sha = await git.hashObject(paths.join("/renders", filename))
      info("Current render sha", sha)
      if (committer.sha === sha) {
        info(`Commit to branch ${committer.branch}`, "(no changes)")
        committer.commit = false
      }
    }

    //Upload to gist (this is done as user since committer_token may not have gist rights)
    if (committer.gist) {
      await retry(async () => {
        await rest.gists.update({gist_id:committer.gist, files:{[filename]:{content:rendered}}})
        info(`Upload to gist ${committer.gist}`, "ok")
        committer.commit = false
      }, {retries:retries_output_action, delay:retries_delay_output_action})
    }

    //Commit metrics
    if (committer.commit) {
      await retry(async () => {
        await committer.rest.repos.createOrUpdateFileContents({
          ...github.context.repo,
          path:filename,
          message:committer.message,
          content:Buffer.from(typeof rendered === "object" ? JSON.stringify(rendered) : `${rendered}`).toString("base64"),
          branch:committer.pr ? committer.head : committer.branch,
          ...(committer.sha ? {sha:committer.sha} : {}),
        })
        info(`Commit to branch ${committer.branch}`, "ok")
      }, {retries:retries_output_action, delay:retries_delay_output_action})
    }

    //Pull request
    if (committer.pr) {
      //Create pull request
      let number = null
      await retry(async () => {
        try {
          ({data:{number}} = await committer.rest.pulls.create({...github.context.repo, head:committer.head, base:committer.branch, title:`Auto-generated metrics for run #${github.context.runId}`, body:" ", maintainer_can_modify:true}))
          info(`Pull request from ${committer.head} to ${committer.branch}`, "(created)")
        }
        catch (error) {
          console.debug(error)
          //Check if pull request has already been created previously
          if (/A pull request already exists/.test(error)) {
            info(`Pull request from ${committer.head} to ${committer.branch}`, "(already existing)")
            const q = `repo:${github.context.repo.owner}/${github.context.repo.repo}+type:pr+state:open+Auto-generated metrics for run #${github.context.runId}+in:title`
            const prs = (await committer.rest.search.issuesAndPullRequests({q})).data.items.filter(({user:{login}}) => login === "github-actions[bot]")
            if (prs.length < 1)
              throw new Error("0 matching prs. Cannot proceed.")
            if (prs.length > 1)
              throw new Error(`Found more than one matching prs: ${prs.map(({number}) => `#${number}`).join(", ")}. Cannot proceed.`)
            ;({number} = prs.shift())
          }
          //Check if pull request could not been created because there are no diff between head and base
          else if (/No commits between/.test(error)) {
            info(`Pull request from ${committer.head} to ${committer.branch}`, "(no diff)")
            committer.merge = false
            number = "(none)"
          }
          else
            throw error

        }
        info("Pull request number", number)
      }, {retries:retries_output_action, delay:retries_delay_output_action})
      //Merge pull request
      if (committer.merge) {
        info("Merge method", committer.merge)
        let attempts = 240
        do {
          const success = await retry(async () => {
            //Check pull request mergeability (https://octokit.github.io/rest.js/v18#pulls-get)
            const {data:{mergeable, mergeable_state:state}} = await committer.rest.pulls.get({...github.context.repo, pull_number:number})
            console.debug(`Pull request #${number} mergeable state is "${state}"`)
            if (mergeable === null) {
              await wait(15)
              return false
            }
            if (!mergeable)
              throw new Error(`Pull request #${number} is not mergeable (state is "${state}")`)
            //Merge pull request
            await committer.rest.pulls.merge({...github.context.repo, pull_number:number, merge_method:committer.merge})
            info(`Merge #${number} to ${committer.branch}`, "ok")
            return true
          }, {retries:retries_output_action, delay:retries_delay_output_action})
          if (!success)
            continue
          //Delete head branch
          await retry(async () => {
            try {
              await wait(15)
              await committer.rest.git.deleteRef({...github.context.repo, ref:`heads/${committer.head}`})
            }
            catch (error) {
              console.debug(error)
              if (!/reference does not exist/i.test(`${error}`))
                throw error
            }
            info(`Branch ${committer.head}`, "(deleted)")
          }, {retries:retries_output_action, delay:retries_delay_output_action})
          break
        } while (--attempts)
      }
    }

    //Delay
    if (delay) {
      info.break()
      info("Delay before ending job", `${delay}s`)
      await new Promise(solve => setTimeout(solve, delay * 1000))
    }

    //Success
    info.break()
    console.log("Success, thanks for using metrics!")
    process.exit(0)
  }
  //Errors
  catch (error) {
    console.error(error)
    //Print debug buffer if debug was not enabled (if it is, it's already logged on the fly)
    if (!DEBUG) {
      for (const log of [info.break(), "An error occured, logging debug message :", ...debugged])
        console.log(log)
    }
    core.setFailed(error.message)
    process.exit(1)
  }
})()
