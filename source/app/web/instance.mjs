//Imports
import octokit from "@octokit/graphql"
import OctokitRest from "@octokit/rest"
import compression from "compression"
import express from "express"
import ratelimit from "express-rate-limit"
import cache from "memory-cache"
import util from "util"
import mocks from "../../../tests/mocks/index.mjs"
import metrics from "../metrics/index.mjs"
import presets from "../metrics/presets.mjs"
import setup from "../metrics/setup.mjs"

/**App */
export default async function({sandbox = false} = {}) {
  //Load configuration settings
  const {conf, Plugins, Templates} = await setup({sandbox})
  //Sandbox mode
  if (sandbox) {
    console.debug("metrics/app > sandbox mode is specified, enabling advanced features")
    Object.assign(conf.settings, {sandbox: true, optimize: true, cached: 0, "plugins.default": true, extras: {default: true}})
  }
  const {token, maxusers = 0, restricted = [], debug = false, cached = 30 * 60 * 1000, port = 3000, ratelimiter = null, plugins = null} = conf.settings
  const mock = sandbox || conf.settings.mocked

  //Process mocking and default plugin state
  for (const plugin of Object.keys(Plugins).filter(x => !["base", "core"].includes(x))) {
    //Initialization
    const {settings} = conf
    if (!settings.plugins[plugin])
      settings.plugins[plugin] = {}
    //Auto-enable plugin if needed
    if (conf.settings["plugins.default"])
      settings.plugins[plugin].enabled = settings.plugins[plugin].enabled ?? (console.debug(`metrics/app > auto-enabling ${plugin}`), true)
    //Mock plugins tokens if they're undefined
    if (mock) {
      const tokens = Object.entries(conf.metadata.plugins[plugin].inputs).filter(([key, value]) => (!/^plugin_/.test(key)) && (value.type === "token")).map(([key]) => key)
      for (const token of tokens) {
        if ((!settings.plugins[plugin][token]) || (mock === "force")) {
          console.debug(`metrics/app > using mocked token for ${plugin}.${token}`)
          settings.plugins[plugin][token] = "MOCKED_TOKEN"
        }
      }
    }
  }
  if (((mock) && (!conf.settings.token)) || (mock === "force")) {
    console.debug("metrics/app > using mocked token")
    conf.settings.token = "MOCKED_TOKEN"
  }
  if (debug)
    console.debug(util.inspect(conf.settings, {depth: Infinity, maxStringLength: 256}))

  //Load octokits
  const api = {graphql: octokit.graphql.defaults({headers: {authorization: `token ${token}`}}), rest: new OctokitRest.Octokit({auth: token})}
  //Apply mocking if needed
  if (mock)
    Object.assign(api, await mocks(api))
  const {graphql, rest} = api

  //Setup server
  const app = express()
  app.use(compression())
  const middlewares = []
  //Rate limiter middleware
  if (ratelimiter) {
    app.set("trust proxy", 1)
    middlewares.push(ratelimit({
      skip(req, _res) {
        return !!cache.get(req.params.login)
      },
      message: "Too many requests: retry later",
      headers: true,
      ...ratelimiter,
    }))
  }
  //Cache headers middleware
  middlewares.push((req, res, next) => {
    const maxage = Math.round(Number(req.query.cache))
    if ((cached) || (maxage > 0))
      res.header("Cache-Control", `public, max-age=${Math.round((maxage > 0 ? maxage : cached) / 1000)}`)
    else
      res.header("Cache-Control", "no-store, no-cache")
    next()
  })

  //Base routes
  const limiter = ratelimit({max: debug ? Number.MAX_SAFE_INTEGER : 60, windowMs: 60 * 1000, headers: false})
  const metadata = Object.fromEntries(
    Object.entries(conf.metadata.plugins)
      .map(([key, value]) => [key, Object.fromEntries(Object.entries(value).filter(([key]) => ["name", "icon", "category", "web", "supports", "scopes"].includes(key)))])
      .map(([key, value]) => [key, key === "core" ? {...value, web: Object.fromEntries(Object.entries(value.web).filter(([key]) => /^config[.]/.test(key)).map(([key, value]) => [key.replace(/^config[.]/, ""), value]))} : value]),
  )
  const enabled = Object.entries(metadata).filter(([_name, {category}]) => category !== "core").map(([name]) => ({name, category: metadata[name]?.category ?? "community", enabled: plugins[name]?.enabled ?? false}))
  const templates = Object.entries(Templates).map(([name]) => ({name, enabled: (conf.settings.templates.enabled.length ? conf.settings.templates.enabled.includes(name) : true) ?? false}))
  const actions = {flush: new Map()}
  const requests = {rest: {limit: 0, used: 0, remaining: 0, reset: NaN}, graphql: {limit: 0, used: 0, remaining: 0, reset: NaN}}
  let _requests_refresh = false
  if (!conf.settings.notoken) {
    const refresh = async () => {
      try {
        const {limit} = await graphql("{ limit:rateLimit {limit remaining reset:resetAt used} }")
        Object.assign(requests, {
          rest: (await rest.rateLimit.get()).data.rate,
          graphql: {...limit, reset: new Date(limit.reset).getTime()},
        })
      }
      catch {
        console.debug("metrics/app > failed to update remaining requests")
      }
    }
    await refresh()
    setInterval(refresh, 15 * 60 * 1000)
    setInterval(() => {
      if (_requests_refresh)
        refresh()
      _requests_refresh = false
    }, 15 * 1000)
  }
  //Web
  app.get("/", limiter, (req, res) => res.sendFile(`${conf.paths.statics}/index.html`))
  app.get("/index.html", limiter, (req, res) => res.sendFile(`${conf.paths.statics}/index.html`))
  app.get("/favicon.ico", limiter, (req, res) => res.sendFile(`${conf.paths.statics}/favicon.png`))
  app.get("/.favicon.png", limiter, (req, res) => res.sendFile(`${conf.paths.statics}/favicon.png`))
  app.get("/.opengraph.png", limiter, (req, res) => conf.settings.web?.opengraph ? res.redirect(conf.settings.web?.opengraph) : res.sendFile(`${conf.paths.statics}/opengraph.png`))
  //Plugins and templates
  app.get("/.plugins", limiter, (req, res) => res.status(200).json(enabled))
  app.get("/.plugins.base", limiter, (req, res) => res.status(200).json(conf.settings.plugins.base.parts))
  app.get("/.plugins.metadata", limiter, (req, res) => res.status(200).json(metadata))
  app.get("/.templates", limiter, (req, res) => res.status(200).json(templates))
  app.get("/.templates/:template", limiter, (req, res) => req.params.template in conf.templates ? res.status(200).json(conf.templates[req.params.template]) : res.sendStatus(404))
  for (const template in conf.templates)
    app.use(`/.templates/${template}/partials`, express.static(`${conf.paths.templates}/${template}/partials`))
  //Placeholders
  app.use("/.placeholders", express.static(`${conf.paths.statics}/placeholders`))
  //Styles
  app.get("/.css/style.css", limiter, (req, res) => res.sendFile(`${conf.paths.statics}/style.css`))
  app.get("/.css/style.vars.css", limiter, (req, res) => res.sendFile(`${conf.paths.statics}/style.vars.css`))
  app.get("/.css/style.prism.css", limiter, (req, res) => res.sendFile(`${conf.paths.node_modules}/prismjs/themes/prism-tomorrow.css`))
  //Scripts
  app.get("/.js/app.js", limiter, (req, res) => res.sendFile(`${conf.paths.statics}/app.js`))
  app.get("/.js/app.placeholder.js", limiter, (req, res) => res.sendFile(`${conf.paths.statics}/app.placeholder.js`))
  app.get("/.js/ejs.min.js", limiter, (req, res) => res.sendFile(`${conf.paths.node_modules}/ejs/ejs.min.js`))
  app.get("/.js/faker.min.js", limiter, (req, res) => res.set({"Content-Type": "text/javascript"}).send("import {faker} from '/.js/faker/index.mjs';globalThis.faker=faker;globalThis.placeholder.init(globalThis)"))
  app.use("/.js/faker", express.static(`${conf.paths.node_modules}/@faker-js/faker/dist/esm`))
  app.get("/.js/axios.min.js", limiter, (req, res) => res.sendFile(`${conf.paths.node_modules}/axios/dist/axios.min.js`))
  app.get("/.js/axios.min.map", limiter, (req, res) => res.sendFile(`${conf.paths.node_modules}/axios/dist/axios.min.map`))
  app.get("/.js/vue.min.js", limiter, (req, res) => res.sendFile(`${conf.paths.node_modules}/vue/dist/vue.min.js`))
  app.get("/.js/vue.prism.min.js", limiter, (req, res) => res.sendFile(`${conf.paths.node_modules}/vue-prism-component/dist/vue-prism-component.min.js`))
  app.get("/.js/vue-prism-component.min.js.map", limiter, (req, res) => res.sendFile(`${conf.paths.node_modules}/vue-prism-component/dist/vue-prism-component.min.js.map`))
  app.get("/.js/prism.min.js", limiter, (req, res) => res.sendFile(`${conf.paths.node_modules}/prismjs/prism.js`))
  app.get("/.js/prism.yaml.min.js", limiter, (req, res) => res.sendFile(`${conf.paths.node_modules}/prismjs/components/prism-yaml.min.js`))
  app.get("/.js/prism.markdown.min.js", limiter, (req, res) => res.sendFile(`${conf.paths.node_modules}/prismjs/components/prism-markdown.min.js`))
  app.get("/.js/clipboard.min.js", limiter, (req, res) => res.sendFile(`${conf.paths.node_modules}/clipboard/dist/clipboard.min.js`))
  //Meta
  app.get("/.version", limiter, (req, res) => res.status(200).send(conf.package.version))
  app.get("/.requests", limiter, (req, res) => res.status(200).json(requests))
  app.get("/.hosted", limiter, (req, res) => res.status(200).json(conf.settings.hosted || null))
  //Cache
  app.get("/.uncache", limiter, (req, res) => {
    const {token, user} = req.query
    if (token) {
      if (actions.flush.has(token)) {
        console.debug(`metrics/app/${actions.flush.get(token)} > flushed cache`)
        cache.del(actions.flush.get(token))
        return res.sendStatus(200)
      }
      return res.sendStatus(400)
    }
    {
      const token = `${Math.random().toString(16).replace("0.", "")}${Math.random().toString(16).replace("0.", "")}`
      actions.flush.set(token, user)
      return res.json({token})
    }
  })

  //Pending requests
  const pending = new Map()

  //About routes
  app.use("/about/.statics/", express.static(`${conf.paths.statics}/about`))
  app.get("/about/", limiter, (req, res) => res.sendFile(`${conf.paths.statics}/about/index.html`))
  app.get("/about/index.html", limiter, (req, res) => res.sendFile(`${conf.paths.statics}/about/index.html`))
  app.get("/about/:login", limiter, (req, res) => res.sendFile(`${conf.paths.statics}/about/index.html`))
  app.get("/about/query/:login/:plugin/", async (req, res) => {
    //Check username
    const login = req.params.login?.replace(/[\n\r]/g, "")
    if (!/^[-\w]+$/i.test(login)) {
      console.debug(`metrics/app/${login}/insights > 400 (invalid username)`)
      return res.status(400).send("Bad request: username seems invalid")
    }
    //Check plugin
    const plugin = req.params.plugin?.replace(/[\n\r]/g, "")
    if (!/^\w+$/i.test(plugin)) {
      console.debug(`metrics/app/${login}/insights > 400 (invalid plugin name)`)
      return res.status(400).send("Bad request: plugin name seems invalid")
    }
    if (cache.get(`about.${login}.${plugin}`))
      return res.send(cache.get(`about.${login}.${plugin}`))
    return res.status(204).send("No content: no data fetched yet")
  })
  app.get("/about/query/:login/", ...middlewares, async (req, res) => {
    //Check username
    const login = req.params.login?.replace(/[\n\r]/g, "")
    if (!/^[-\w]+$/i.test(login)) {
      console.debug(`metrics/app/${login}/insights > 400 (invalid username)`)
      return res.status(400).send("Bad request: username seems invalid")
    }
    //Compute metrics
    let solve = null
    try {
      //Prevent multiples requests
      if ((!debug) && (!mock) && (pending.has(`about.${login}`))) {
        console.debug(`metrics/app/${login}/insights > awaiting pending request`)
        await pending.get(`about.${login}`)
      }
      else {
        pending.set(`about.${login}`, new Promise(_solve => solve = _solve))
      }
      //Read cached data if possible
      if ((!debug) && (cached) && (cache.get(`about.${login}`))) {
        console.debug(`metrics/app/${login}/insights > using cached results`)
        return res.send(cache.get(`about.${login}`))
      }
      //Compute metrics
      console.debug(`metrics/app/${login}/insights > compute insights`)
      const callbacks = {
        async plugin(login, plugin, success, result) {
          console.debug(`metrics/app/${login}/insights/plugins > ${plugin} > ${success ? "success" : "failure"}`)
          cache.put(`about.${login}.${plugin}`, result)
        },
      }
      ;(async () => {
        try {
          const json = await metrics.insights({login}, {graphql, rest, conf, callbacks}, {Plugins, Templates})
          //Cache
          cache.put(`about.${login}`, json)
          if ((!debug) && (cached)) {
            const maxage = Math.round(Number(req.query.cache))
            cache.put(`about.${login}`, json, maxage > 0 ? maxage : cached)
          }
        }
        catch (error) {
          console.error(`metrics/app/${login}/insights > error > ${error}`)
        }
      })()
      console.debug(`metrics/app/${login}/insights > accepted request`)
      return res.status(202).json({processing: true, plugins: Object.keys(metrics.insights.plugins)})
    }
    //Internal error
    catch (error) {
      //Not found user
      if ((error instanceof Error) && (/^user not found$/.test(error.message))) {
        console.debug(`metrics/app/${login} > 404 (user/organization not found)`)
        return res.status(404).send("Not found: unknown user or organization")
      }
      //GitHub failed request
      if ((error instanceof Error) && (/this may be the result of a timeout, or it could be a GitHub bug/i.test(error.errors?.[0]?.message))) {
        console.debug(`metrics/app/${login} > 502 (bad gateway from GitHub)`)
        const request = encodeURIComponent(error.errors[0].message.match(/`(?<request>[\w:]+)`/)?.groups?.request ?? "").replace(/%3A/g, ":")
        return res.status(500).send(`Internal Server Error: failed to execute request ${request} (this may be the result of a timeout, or it could be a GitHub bug)`)
      }
      //General error
      console.error(error)
      return res.status(500).send("Internal Server Error: failed to process metrics correctly")
    }
    finally {
      solve?.()
      _requests_refresh = true
    }
  })

  //Metrics
  app.get("/:login/:repository?", ...middlewares, async (req, res) => {
    //Request params
    const login = req.params.login?.replace(/[\n\r]/g, "")
    const repository = req.params.repository?.replace(/[\n\r]/g, "")
    let solve = null
    //Check username
    if (!/^[-\w]+$/i.test(login)) {
      console.debug(`metrics/app/${login} > 400 (invalid username)`)
      return res.status(400).send("Bad request: username seems invalid")
    }
    //Allowed list check
    if ((restricted.length) && (!restricted.includes(login))) {
      console.debug(`metrics/app/${login} > 403 (not in allowed users)`)
      return res.status(403).send("Forbidden: username not in allowed list")
    }
    //Prevent multiples requests
    if ((!debug) && (!mock) && (pending.has(login))) {
      console.debug(`metrics/app/${login} > awaiting pending request`)
      await pending.get(login)
    }
    else {
      pending.set(login, new Promise(_solve => solve = _solve))
    }

    //Read cached data if possible
    if ((!debug) && (cached) && (cache.get(login))) {
      console.debug(`metrics/app/${login} > using cached image`)
      const {rendered, mime} = cache.get(login)
      res.header("Content-Type", mime)
      return res.send(rendered)
    }
    //Maximum simultaneous users
    if ((maxusers) && (cache.size() + 1 > maxusers)) {
      console.debug(`metrics/app/${login} > 503 (maximum users reached)`)
      return res.status(503).send("Service Unavailable: maximum number of users reached, only cached metrics are available")
    }
    //Repository alias
    if (repository) {
      console.debug(`metrics/app/${login} > compute repository metrics`)
      if (!req.query.template)
        req.query.template = "repository"
      req.query.repo = repository
    }

    //Compute rendering
    try {
      //Render
      const q = req.query
      console.debug(`metrics/app/${login} > ${util.inspect(q, {depth: Infinity, maxStringLength: 256})}`)
      if ((q["config.presets"]) && (conf.settings.extras?.presets ?? conf.settings.extras?.default ?? false)) {
        console.debug(`metrics/app/${login} > presets have been specified, loading them`)
        Object.assign(q, await presets(q["config.presets"]))
      }
      const {rendered, mime} = await metrics({login, q}, {
        graphql,
        rest,
        plugins,
        conf,
        die: q["plugins.errors.fatal"] ?? false,
        verify: q.verify ?? false,
        convert: ["svg", "jpeg", "png", "json", "markdown", "markdown-pdf", "insights"].includes(q["config.output"]) ? q["config.output"] : null,
      }, {Plugins, Templates})
      //Cache
      if ((!debug) && (cached)) {
        const maxage = Math.round(Number(req.query.cache))
        cache.put(login, {rendered, mime}, maxage > 0 ? maxage : cached)
      }
      //Send response
      res.header("Content-Type", mime)
      return res.send(rendered)
    }
    //Internal error
    catch (error) {
      //Not found user
      if ((error instanceof Error) && (/^user not found$/.test(error.message))) {
        console.debug(`metrics/app/${login} > 404 (user/organization not found)`)
        return res.status(404).send("Not found: unknown user or organization")
      }
      //Invalid template
      if ((error instanceof Error) && (/^unsupported template$/.test(error.message))) {
        console.debug(`metrics/app/${login} > 400 (bad request)`)
        return res.status(400).send("Bad request: unsupported template")
      }
      //Unsupported output format or account type
      if ((error instanceof Error) && (/^not supported for: [\s\S]*$/.test(error.message))) {
        console.debug(`metrics/app/${login} > 406 (Not Acceptable)`)
        return res.status(406).send("Not Acceptable: unsupported output format or account type for specified parameters")
      }
      //GitHub failed request
      if ((error instanceof Error) && (/this may be the result of a timeout, or it could be a GitHub bug/i.test(error.errors?.[0]?.message))) {
        console.debug(`metrics/app/${login} > 502 (bad gateway from GitHub)`)
        const request = encodeURIComponent(error.errors[0].message.match(/`(?<request>[\w:]+)`/)?.groups?.request ?? "").replace(/%3A/g, ":")
        return res.status(500).send(`Internal Server Error: failed to execute request ${request} (this may be the result of a timeout, or it could be a GitHub bug)`)
      }
      //General error
      console.error(error)
      return res.status(500).send("Internal Server Error: failed to process metrics correctly")
    }
    finally {
      //After rendering
      solve?.()
      _requests_refresh = true
    }
  })

  //Listen
  app.listen(port, () =>
    console.log([
      `Listening on port      │ ${port}`,
      `Debug mode             │ ${debug}`,
      `Mocked data            │ ${conf.settings.mocked ?? false}`,
      `Restricted to users    │ ${restricted.size ? [...restricted].join(", ") : "(unrestricted)"}`,
      `Cached time            │ ${cached} seconds`,
      `Rate limiter           │ ${ratelimiter ? util.inspect(ratelimiter, {depth: Infinity, maxStringLength: 256}) : "(enabled)"}`,
      `Max simultaneous users │ ${maxusers ? `${maxusers} users` : "(unrestricted)"}`,
      `Plugins enabled        │ ${enabled.map(({name}) => name).join(", ")}`,
      `SVG optimization       │ ${conf.settings.optimize ?? false}`,
      "Server ready !",
    ].join("\n")))
}
