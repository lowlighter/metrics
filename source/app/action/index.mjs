//Imports
import core from "@actions/core"
import github from "@actions/github"
import octokit from "@octokit/graphql"
import processes from "child_process"
import fs from "fs/promises"
import paths from "path"
import sgit from "simple-git"
import util from "util"
import mocks from "../../../tests/mocks/index.mjs"
import metrics from "../metrics/index.mjs"
import presets from "../metrics/presets.mjs"
import setup from "../metrics/setup.mjs"
process.on("unhandledRejection", error => {
  throw error
})

//Debug message buffer
let DEBUG = true
const debugged = []

//Preset
const preset = {}

//Info logger
const info = (left, right, {token = false} = {}) =>
  console.log(`${`${left}`.padEnd(63 + 9 * (/0m$/.test(left)))} │ ${
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
    info(metadata.plugins[name]?.inputs[input]?.description?.split("\n")[0] ?? metadata.plugins[name]?.inputs[input]?.description ?? input, `${input in preset ? "*" : ""}${value}`, {token: metadata.plugins[name]?.inputs[input]?.type === "token"})
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

//Process exit
function quit(reason) {
  const code = {success: 0, skipped: 0, failed: 1}[reason] ?? 0
  process.exit(code)
} //=====================================================================================================
//Runner

;(async function() {
  try {
    //Initialization
    info.break()
    info.section("Metrics")

    //Skip process if needed
    if ((github.context.eventName === "push") && (github.context.payload?.head_commit)) {
      if (/\[Skip GitHub Action\]/.test(github.context.payload.head_commit.message)) {
        console.log("Skipped because [Skip GitHub Action] is in commit message")
        quit("skipped")
      }
      if (/Auto-generated metrics for run #\d+/.test(github.context.payload.head_commit.message)) {
        console.log("Skipped because this seems to be an automated pull request merge")
        quit("skipped")
      }
    }

    //Load configuration
    const {conf, Plugins, Templates} = await setup({log: false, community: {templates: core.getInput("setup_community_templates")}, extras: true})
    const {metadata} = conf
    conf.settings.extras = {default: true}
    info("Setup", "complete")
    info("Version", conf.package.version)

    //Docker run environment default values
    if (!metadata.env.ghactions) {
      info("Docker environment", "(enabled)")
      process.env.INPUT_OUTPUT_ACTION = process.env.INPUT_OUTPUT_ACTION ?? "none"
      process.env.INPUT_COMMITTER_TOKEN = process.env.INPUT_COMMITTER_TOKEN ?? process.env.INPUT_TOKEN
      process.env.GITHUB_REPOSITORY = process.env.GITHUB_REPOSITORY ?? "octocat/hello-world"
    }

    //Core inputs
    Object.assign(preset, await presets(core.getInput("config_presets"), {log: false, core}))
    const {
      user: _user,
      repo: _repo,
      token,
      template,
      query,
      "setup.community.templates": _templates,
      filename: _filename,
      optimize,
      verify,
      "markdown.cache": _markdown_cache,
      debug,
      "debug.flags": dflags,
      "debug.print": dprint,
      "use.mocked.data": mocked,
      dryrun,
      "plugins.errors.fatal": die,
      "committer.token": _token,
      "committer.branch": _branch,
      "committer.message": _message,
      "committer.gist": _gist,
      "use.prebuilt.image": _image,
      retries,
      "retries.delay": retries_delay,
      "retries.output.action": retries_output_action,
      "retries.delay.output.action": retries_delay_output_action,
      "output.action": _action,
      "output.condition": _output_condition,
      delay,
      "quota.required.rest": _quota_required_rest,
      "quota.required.graphql": _quota_required_graphql,
      "quota.required.search": _quota_required_search,
      "notice.release": _notice_releases,
      "clean.workflows": _clean_workflows,
      ...config
    } = metadata.plugins.core.inputs.action({core, preset})
    const q = {...query, ...(_repo ? {repo: _repo} : null), template}
    const _output = ["svg", "jpeg", "png", "json", "markdown", "markdown-pdf", "insights"].includes(config["config.output"]) ? config["config.output"] : metadata.templates[template]?.formats?.[0] ?? null
    const filename = _filename.replace(/[*]/g, {jpeg: "jpg", markdown: "md", "markdown-pdf": "pdf", insights: "html"}[_output] ?? _output ?? "*")

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
    info("GitHub token", token, {token: true})
    //A GitHub token should start with "gh" along an additional letter for type
    //See https://github.blog/2021-04-05-behind-githubs-new-authentication-token-formats
    info("GitHub token format", /^gh[pousr]_/.test(token) ? "correct" : "(old or invalid)")
    if (!token)
      throw new Error("You must provide a valid GitHub personal token to gather your metrics (see https://github.com/lowlighter/metrics/blob/master/.github/readme/partials/documentation/setup/action.md for more informations)")
    conf.settings.token = token
    const api = {}
    const resources = {}
    api.graphql = octokit.graphql.defaults({headers: {authorization: `token ${token}`}})
    info("Github GraphQL API", "ok")
    const octoraw = github.getOctokit(token)
    api.rest = octoraw.rest
    api.rest.request = octoraw.request
    info("Github REST API", "ok")
    //Apply mocking if needed
    if (mocked) {
      Object.assign(api, await mocks(api))
      info("Use mocked API", true)
    }
    //Test token validity and requests count
    else if (!/^NOT_NEEDED$/.test(token)) {
      //Check rate limit
      let ratelimit = false
      const {data} = await api.rest.rateLimit.get().catch(() => ({data: {resources: {}}}))
      Object.assign(resources, data.resources)
      for (const type of ["core", "graphql", "search"]) {
        const name = {core: "REST", graphql: "GraphQL", search: "Search"}[type]
        const quota = {core: _quota_required_rest, graphql: _quota_required_graphql, search: _quota_required_search}[type] ?? 1
        info(`API requests (${name})`, resources[type] ? `${resources[type].remaining}/${resources[type].limit}${quota ? ` (${quota}+ required)` : ""}` : "(unknown)")
        if ((resources[type]) && (resources[type].remaining < quota))
          ratelimit = true
      }
      if (ratelimit) {
        console.warn("::warning::It seems you have reached your API requests limit or configured quota. Please retry later.")
        info.break()
        console.log("Nothing can be done currently, thanks for using metrics!")
        quit("skipped")
      }
      //Check scopes
      try {
        const {headers} = await api.rest.request("HEAD /")
        if (!("x-oauth-scopes" in headers)) {
          throw new Error(
            'GitHub API did not send any "x-oauth-scopes" header back from provided "token". It means that your token may not be valid or you\'re using GITHUB_TOKEN which cannot be used since metrics will fetch data outside of this repository scope. Use a personal access token instead (see https://github.com/lowlighter/metrics/blob/master/.github/readme/partials/documentation/setup/action.md for more informations).',
          )
        }
        info("Token validity", "seems ok")
      }
      catch {
        info("Token validity", "(could not verify)")
      }
    }
    //Extract octokits
    const {graphql, rest} = api

    //Check for new versions
    if (_notice_releases) {
      const {data: [{tag_name: tag}]} = await rest.repos.listReleases({owner: "lowlighter", repo: "metrics"})
      const current = Number(conf.package.version.match(/(\d+\.\d+)/)?.[1] ?? 0)
      const latest = Number(tag.match(/(\d+\.\d+)/)?.[1] ?? 0)
      if (latest > current)
        console.info(`::notice::A new version of metrics (v${latest}) has been released, check it out for even more features!`)
    }

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
    if (metadata.env.ghactions)
      info("Current repository", `${github.context.repo.owner}/${github.context.repo.repo}`)

    //Committer
    const committer = {}
    if ((!dryrun) && (_action !== "none")) {
      //Compute committer informations
      committer.token = _token || token
      committer.gist = _action === "gist" ? _gist : null
      committer.commit = true
      committer.message = _message.replace(/[$][{]filename[}]/g, filename)
      committer.pr = /^pull-request/.test(_action)
      committer.merge = _action.match(/^pull-request-(?<method>merge|squash|rebase)$/)?.groups?.method ?? null
      committer.branch = _branch || github.context.ref.replace(/^refs[/]heads[/]/, "")
      committer.head = committer.pr ? `metrics-run-${github.context.runId}` : committer.branch
      info("Committer token", committer.token, {token: true})
      if (!committer.token)
        throw new Error("You must provide a valid GitHub token to commit your metrics")
      info("Committer branch", committer.branch)
      info("Committer head branch", committer.head)
      //Gist
      if (committer.gist)
        info("Committer Gist id", committer.gist)
      //Instantiate API for committer
      committer.rest = github.getOctokit(committer.token).rest
      info("Committer REST API", "ok")
      try {
        info("Committer account", (await committer.rest.users.getAuthenticated()).data.login)
      }
      catch {
        info("Committer account", "(github-actions)")
      }
      //Create head branch if needed
      try {
        await committer.rest.git.getRef({...github.context.repo, ref: `heads/${committer.head}`})
        info("Committer head branch status", "ok")
      }
      catch (error) {
        console.debug(error)
        if (/not found/i.test(`${error}`)) {
          const {data: {object: {sha}}} = await committer.rest.git.getRef({...github.context.repo, ref: `heads/${committer.branch}`})
          info("Committer branch current sha", sha)
          await committer.rest.git.createRef({...github.context.repo, ref: `refs/heads/${committer.head}`, sha})
          info("Committer head branch status", "(created)")
        }
        else {
          throw error
        }
      }
      //Retrieve previous render SHA to be able to update file content through API
      committer.sha = null
      try {
        const {repository: {object: {oid}}} = await graphql(
          `
            query Sha {
              repository(owner: "${github.context.repo.owner}", name: "${github.context.repo.repo}") {
                object(expression: "${committer.head}:${filename}") { ... on Blob { oid } }
              }
            }
          `,
          {headers: {authorization: `token ${committer.token}`}},
        )
        committer.sha = oid
      }
      catch (error) {
        console.debug(error)
      }
      info("Previous render sha", committer.sha ?? "(none)")
    }
    else if (dryrun) {
      info("Dry-run", true)
    }

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
    info.group({metadata, name: "core", inputs: config})
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
          const web = await processes.spawn("node", ["/metrics/source/app/web/index.mjs"], {env: {...process.env}})
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
    const {base: parts, repositories: _repositories, indepth: _base_indepth, ...base} = metadata.plugins.base.inputs.action({core, preset})
    conf.settings.repositories = _repositories
    info.group({metadata, name: "base", inputs: {repositories: conf.settings.repositories, indepth: _base_indepth, ...base}})
    info("Base sections", parts)
    base.base = false
    for (const part of conf.settings.plugins.base.parts)
      base[`base.${part}`] = parts.includes(part)
    base["base.indepth"] = _base_indepth
    Object.assign(q, base)

    //Additional plugins
    const plugins = {}
    for (const name of Object.keys(Plugins).filter(key => !["base", "core"].includes(key))) {
      //Parse inputs
      const {[name]: enabled, ...inputs} = metadata.plugins[name].inputs.action({core, preset})
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
      const {rendered, errors} = await metrics({login: user, q}, {graphql, rest, plugins, conf, die, verify, convert}, {Plugins, Templates})
      if (errors.length) {
        console.warn(`::group::${errors.length} error(s) occured`)
        console.warn(util.inspect(errors, {depth: Infinity, maxStringLength: 256}))
        console.warn("::endgroup::")
      }
      return rendered
    }, {retries, delay: retries_delay})
    if (!rendered)
      throw new Error("Could not render metrics")
    info("Status", "complete")

    //Debug print
    if (dprint) {
      info.break()
      info.section("Debug print")
      console.log(rendered)
    }

    //Output condition
    info.break()
    info.section("Saving")
    info("Output condition", _output_condition)
    if ((_output_condition === "data-changed") && ((committer.commit) || (committer.pr))) {
      const {svg} = await import("../metrics/utils.mjs")
      let data = ""
      await retry(async () => {
        try {
          data = `${Buffer.from((await committer.rest.repos.getContent({...github.context.repo, ref: `heads/${committer.head}`, path: filename})).data.content, "base64")}`
        }
        catch (error) {
          if (error.response.status !== 404)
            throw error
        }
      }, {retries: retries_output_action, delay: retries_delay_output_action})
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
      await fs.mkdir(paths.dirname(paths.join("/renders", filename)), {recursive: true})
      await fs.writeFile(paths.join("/renders", filename), Buffer.from(typeof rendered === "object" ? JSON.stringify(rendered) : `${rendered}`))
      info(`Save to /metrics_renders/${filename}`, "ok")
      info("Output action", _action)
    }

    //No output action apart from file on runner
    if (_action === "none") {
      info.break()
      console.log("Success, thanks for using metrics!")
    }
    //Perform output action
    else {
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
              const {repository: {object: {oid}}} = await graphql(
                `
                  query Sha {
                    repository(owner: "${github.context.repo.owner}", name: "${github.context.repo.repo}") {
                      object(expression: "${committer.head}:${path}") { ... on Blob { oid } }
                    }
                  }
                `,
                {headers: {authorization: `token ${committer.token}`}},
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
                message: `${committer.message} (cache)`,
                ...(sha ? {sha} : {}),
                branch: committer.pr ? committer.head : committer.branch,
              })
              rendered = rendered.replace(match, `<img src="https://github.com/${github.context.repo.owner}/${github.context.repo.repo}/blob/${committer.branch}/${path}">`)
              info(`Saving ${path}`, "ok")
            }
          }, {retries: retries_output_action, delay: retries_delay_output_action})
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
          await rest.gists.update({gist_id: committer.gist, files: {[filename]: {content: rendered}}})
          info(`Upload to gist ${committer.gist}`, "ok")
          committer.commit = false
        }, {retries: retries_output_action, delay: retries_delay_output_action})
      }

      //Commit metrics
      if (committer.commit) {
        await retry(async () => {
          await committer.rest.repos.createOrUpdateFileContents({
            ...github.context.repo,
            path: filename,
            message: committer.message,
            content: Buffer.from(typeof rendered === "object" ? JSON.stringify(rendered) : `${rendered}`).toString("base64"),
            branch: committer.pr ? committer.head : committer.branch,
            ...(committer.sha ? {sha: committer.sha} : {}),
          })
          info(`Commit to branch ${committer.branch}`, "ok")
        }, {retries: retries_output_action, delay: retries_delay_output_action})
      }

      //Pull request
      if (committer.pr) {
        //Create pull request
        let number = null
        await retry(async () => {
          try {
            ;({data: {number}} = await committer.rest.pulls.create({...github.context.repo, head: committer.head, base: committer.branch, title: `Auto-generated metrics for run #${github.context.runId}`, body: " ", maintainer_can_modify: true}))
            info(`Pull request from ${committer.head} to ${committer.branch}`, "(created)")
          }
          catch (error) {
            console.debug(error)
            //Check if pull request has already been created previously
            if (/A pull request already exists/.test(error)) {
              info(`Pull request from ${committer.head} to ${committer.branch}`, "(already existing)")
              const q = `repo:${github.context.repo.owner}/${github.context.repo.repo}+type:pr+state:open+Auto-generated metrics for run #${github.context.runId}+in:title`
              const prs = (await committer.rest.search.issuesAndPullRequests({q})).data.items.filter(({user: {login}}) => login === "github-actions[bot]")
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
            else {
              throw error
            }
          }
          info("Pull request number", number)
        }, {retries: retries_output_action, delay: retries_delay_output_action})
        //Merge pull request
        if (committer.merge) {
          info("Merge method", committer.merge)
          let attempts = 240
          do {
            const success = await retry(async () => {
              //Check pull request mergeability (https://octokit.github.io/rest.js/v18#pulls-get)
              const {data: {mergeable, mergeable_state: state}} = await committer.rest.pulls.get({...github.context.repo, pull_number: number})
              console.debug(`Pull request #${number} mergeable state is "${state}"`)
              if (mergeable === null) {
                await wait(15)
                return false
              }
              if (!mergeable)
                throw new Error(`Pull request #${number} is not mergeable (state is "${state}")`)
              //Merge pull request
              await committer.rest.pulls.merge({...github.context.repo, pull_number: number, merge_method: committer.merge})
              info(`Merge #${number} to ${committer.branch}`, "ok")
              return true
            }, {retries: retries_output_action, delay: retries_delay_output_action})
            if (!success)
              continue
            //Delete head branch
            await retry(async () => {
              try {
                await wait(15)
                await committer.rest.git.deleteRef({...github.context.repo, ref: `heads/${committer.head}`})
              }
              catch (error) {
                console.debug(error)
                if (!/reference does not exist/i.test(`${error}`))
                  throw error
              }
              info(`Branch ${committer.head}`, "(deleted)")
            }, {retries: retries_output_action, delay: retries_delay_output_action})
            break
          } while (--attempts)
        }
      }

      //Clean workflows
      if (_clean_workflows.length) {
        try {
          //Get workflow metadata
          const run_id = github.context.runId
          const {data: {workflow_id}} = await rest.actions.getWorkflowRun({...github.context.repo, run_id})
          const {data: {path}} = await rest.actions.getWorkflow({...github.context.repo, workflow_id})
          const workflow = paths.basename(path)
          info.break()
          info.section("Cleaning workflows")
          info("Current workflow run id", run_id)
          info("Current workflow file", workflow)

          //Fetch workflows runs to clean
          info("States to clean", _clean_workflows)
          const runs = []
          let pages = 1
          for (let page = 1; page <= pages; page++) {
            try {
              console.debug(`Fetching page ${page}/${pages} of workflow ${workflow}`)
              const {data: {workflow_runs, total_count}} = await rest.actions.listWorkflowRuns({...github.context.repo, workflow_id: workflow, branch: committer.branch, status: "completed", page})
              pages = total_count / 100
              runs.push(...workflow_runs.filter(({conclusion}) => (_clean_workflows.includes("all")) || (_clean_workflows.includes(conclusion))).map(({id}) => ({id})))
            }
            catch (error) {
              console.debug(error)
              break
            }
          }
          info("Runs to clean", runs.length)

          //Clean workflow runs
          let cleaned = 0
          for (const {id} of runs) {
            try {
              await rest.actions.deleteWorkflowRun({...github.context.repo, run_id: id})
              cleaned++
            }
            catch (error) {
              console.debug(error)
              continue
            }
          }
          info("Runs cleaned", cleaned)
        }
        catch (error) {
          if (error.response.status === 404)
            console.log('::warning::Workflow data could not be fetched. If this is a private repository, you may need to grant full "repo" scope.')
          console.debug(error)
        }
      }
    }

    //Consumed API requests
    if ((!mocked) && (!/^NOT_NEEDED$/.test(token))) {
      info.break()
      info.section("Consumed API requests")
      info("  * provided that no other app used your quota during execution", "")
      const {data: current} = await rest.rateLimit.get().catch(() => ({data: {resources: {}}}))
      for (const type of ["core", "graphql", "search"]) {
        const used = resources[type].remaining - current.resources[type].remaining
        info({core: "REST API", graphql: "GraphQL API", search: "Search API"}[type], (Number.isFinite(used) && (used >= 0)) ? used : "(unknown)")
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
    quit("success")
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
    quit("failed")
  }
})()
