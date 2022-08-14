//Imports
import octokit from "@octokit/graphql"
import OctokitRest from "@octokit/rest"
import axios from "axios"
import compression from "compression"
import crypto from "crypto"
import express from "express"
import ratelimit from "express-rate-limit"
import cache from "memory-cache"
import url from "url"
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
  const api = {graphql: octokit.graphql.defaults({headers: {authorization: `token ${token}`}, baseUrl: conf.settings.api?.graphql ?? undefined}), rest: new OctokitRest.Octokit({auth: token, baseUrl: conf.settings.api?.rest ?? undefined})}
  //Apply mocking if needed
  if (mock)
    Object.assign(api, await mocks(api))
  //Custom user octokits sessions
  const authenticated = new Map()
  const uapi = session => {
    if (!/^[a-f0-9]+$/i.test(`${session}`))
      return null
    if (authenticated.has(session)) {
      const {login, token} = authenticated.get(session)
      console.debug(`metrics/app/session/${login} > authenticated with session ${session.substring(0, 6)}, using custom octokit`)
      return {login, graphql: octokit.graphql.defaults({headers: {authorization: `token ${token}`}}), rest: new OctokitRest.Octokit({auth: token})}
    }
    else if (session) {
      console.debug(`metrics/app/session > unknown session ${session.substring(0, 6)}, using default octokit`)
    }
    return null
  }

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
      .map(([key, value]) => [key, Object.fromEntries(Object.entries(value).filter(([key]) => ["name", "icon", "category", "web", "supports", "scopes", "deprecated"].includes(key)))])
      .map(([key, value]) => [key, key === "core" ? {...value, web: Object.fromEntries(Object.entries(value.web).filter(([key]) => /^config[.]/.test(key)).map(([key, value]) => [key.replace(/^config[.]/, ""), value]))} : value]),
  )
  const enabled = Object.entries(metadata).filter(([_name, {category}]) => category !== "core").map(([name]) => ({name, category: metadata[name]?.category ?? "community", deprecated: metadata[name]?.deprecated ?? false, enabled: plugins[name]?.enabled ?? false}))
  const templates = Object.entries(Templates).map(([name]) => ({name, enabled: (conf.settings.templates.enabled.length ? conf.settings.templates.enabled.includes(name) : true) ?? false}))
  const actions = {flush: new Map()}
  const requests = {rest: {limit: 0, used: 0, remaining: 0, reset: NaN}, graphql: {limit: 0, used: 0, remaining: 0, reset: NaN}, search: {limit: 0, used: 0, remaining: 0, reset: NaN}}
  let _requests_refresh = false
  if (!conf.settings.notoken) {
    const refresh = async () => {
      try {
        const {resources} = (await api.rest.rateLimit.get()).data
        Object.assign(requests, {rest: resources.core, graphql: resources.graphql, search: resources.search})
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
  //Modes and extras
  app.get("/.modes", limiter, (req, res) => res.status(200).json(conf.settings.modes))
  app.get("/.extras", limiter, async (req, res) => {
    if ((authenticated.has(req.headers["x-metrics-session"])) && (conf.settings.extras?.logged)) {
      if (conf.settings.extras?.features !== true)
        return res.status(200).json([...conf.settings.extras.features, ...conf.settings.extras.logged])
    }
    res.status(200).json(conf.settings.extras?.features ?? conf.settings?.extras?.default ?? false)
  })
  app.get("/.extras.logged", limiter, async (req, res) => res.status(200).json(conf.settings.extras?.logged ?? []))
  //Styles
  app.get("/.css/style.css", limiter, (req, res) => res.sendFile(`${conf.paths.statics}/style.css`))
  app.get("/.css/style.vars.css", limiter, (req, res) => res.sendFile(`${conf.paths.statics}/style.vars.css`))
  app.get("/.css/style.prism.css", limiter, (req, res) => res.sendFile(`${conf.paths.node_modules}/prismjs/themes/prism-tomorrow.css`))
  //Scripts
  app.get("/.js/app.js", limiter, (req, res) => res.sendFile(`${conf.paths.statics}/app.js`))
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
  app.get("/.requests", limiter, async (req, res) => {
    try {
      const custom = uapi(req.headers["x-metrics-session"])
      if (custom) {
        const {data: {resources}} = await custom.rest.rateLimit.get()
        if (resources)
          return res.status(200).json({rest: resources.core, graphql: resources.graphql, search: resources.search, login: custom.login})
      }
    }
    catch {} //eslint-disable-line no-empty
    return res.status(200).json(requests)
  })
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

  //OAuth
  if (conf.settings.oauth) {
    console.debug("metrics/app/oauth > enabled")
    const states = new Map()
    app.get("/.oauth/", limiter, (req, res) => res.sendFile(`${conf.paths.statics}/oauth/index.html`))
    app.get("/.oauth/index.html", limiter, (req, res) => res.sendFile(`${conf.paths.statics}/oauth/index.html`))
    app.get("/.oauth/script.js", limiter, (req, res) => res.sendFile(`${conf.paths.statics}/oauth/script.js`))
    app.get("/.oauth/authenticate", (req, res) => {
      //Create a state to protect against cross-site request forgery attacks
      const state = crypto.randomBytes(64).toString("hex")
      const scopes = new url.URLSearchParams(req.query).get("scopes")
      const from = new url.URLSearchParams(req.query).get("scopes")
      states.set(state, {from, scopes})
      console.debug(`metrics/app/oauth > request ${state}`)
      //OAuth through GitHub
      return res.redirect(`https://github.com/login/oauth/authorize?${new url.URLSearchParams({
        client_id: conf.settings.oauth.id,
        state,
        redirect_uri: `${conf.settings.oauth.url}/.oauth/authorize`,
        allow_signup: false,
        scope: scopes,
      })}`)
    })
    app.get("/.oauth/authorize", async (req, res) => {
      //Check state
      const {code, state} = req.query
      if ((!state) || (!states.has(state))) {
        console.debug("metrics/app/oauth > 400 (invalid state)")
        return res.status(400).send("Bad request: invalid state")
      }
      //OAuth
      try {
        //Authorize user
        console.debug("metrics/app/oauth > authorization")
        const {data} = await axios.post(
          "https://github.com/login/oauth/access_token",
          `${new url.URLSearchParams({
            client_id: conf.settings.oauth.id,
            client_secret: conf.settings.oauth.secret,
            code,
          })}`,
        )
        const token = new url.URLSearchParams(data).get("access_token")
        //Validate user
        const {data: {login}} = await axios.get("https://api.github.com/user", {headers: {Authorization: `token ${token}`}})
        console.debug(`metrics/app/oauth > authorization success for ${login}`)
        const session = crypto.randomBytes(128).toString("hex")
        authenticated.set(session, {login, token})
        console.debug(`metrics/app/oauth > created session ${session.substring(0, 6)}`)
        //Redirect user back
        const {from} = states.get(state)
        return res.redirect(`/.oauth/redirect?${new url.URLSearchParams({to: from, session})}`)
      }
      catch {
        console.debug("metrics/app/oauth > authorization failed")
        return res.status(401).send("Unauthorized: oauth failed")
      }
      finally {
        states.delete(state)
      }
    })
    app.get("/.oauth/revoke/:session", limiter, async (req, res) => {
      const session = req.params.session?.replace(/[\n\r]/g, "")
      if (authenticated.has(session)) {
        const {token} = authenticated.get(session)
        try {
          console.log(await axios.delete(`https://api.github.com/applications/${conf.settings.oauth.id}/grant`, {auth: {username: conf.settings.oauth.id, password: conf.settings.oauth.secret}, headers: {Accept: "application/vnd.github+json"}, data: {access_token: token}}))
          authenticated.delete(session)
          console.debug(`metrics/app/oauth > deleted session ${session.substring(0, 6)}`)
          return res.redirect("/.oauth")
        }
        catch {} //eslint-disable-line no-empty
      }
      return res.status(400).send("Bad request: invalid session")
    })
    app.get("/.oauth/redirect", limiter, (req, res) => res.sendFile(`${conf.paths.statics}/oauth/redirect.html`))
    app.get("/.oauth/enabled", limiter, (req, res) => res.json(true))
  }
  else {
    app.get("/.oauth/enabled", limiter, (req, res) => res.json(false))
  }

  //Pending requests
  const pending = new Map()

  //Metrics insights
  if (conf.settings.modes.includes("insights")) {
    console.debug("metrics/app > setup insights mode")
    //Legacy routes
    app.get("/about/*", (req, res) => res.redirect(req.path.replace("/about/", "/insights/")))
    //Static routes
    app.get("/insights/", limiter, (req, res) => res.sendFile(`${conf.paths.statics}/insights/index.html`))
    app.get("/insights/index.html", limiter, (req, res) => res.sendFile(`${conf.paths.statics}/insights/index.html`))
    app.use("/insights/.statics/", express.static(`${conf.paths.statics}/insights`))
    //App routes
    app.get("/insights/:login", limiter, (req, res) => res.sendFile(`${conf.paths.statics}/insights/index.html`))
    app.get("/insights/query/:login/:plugin/", async (req, res) => {
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
      if (cache.get(`insights.${login}.${plugin}`))
        return res.send(cache.get(`insights.${login}.${plugin}`))
      return res.status(204).send("No content: no data fetched yet")
    })
    app.get("/insights/query/:login/", ...middlewares, async (req, res) => {
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
        if ((!debug) && (!mock) && (pending.has(`insights.${login}`))) {
          console.debug(`metrics/app/${login}/insights > awaiting pending request`)
          await pending.get(`insights.${login}`)
        }
        else {
          pending.set(`insights.${login}`, new Promise(_solve => solve = _solve))
        }
        //Read cached data if possible
        if ((!debug) && (cached) && (cache.get(`insights.${login}`))) {
          console.debug(`metrics/app/${login}/insights > using cached results`)
          return res.send(cache.get(`insights.${login}`))
        }
        //Compute metrics
        console.debug(`metrics/app/${login}/insights > compute insights`)
        const callbacks = {
          async plugin(login, plugin, success, result) {
            console.debug(`metrics/app/${login}/insights/plugins > ${plugin} > ${success ? "success" : "failure"}`)
            cache.put(`insights.${login}.${plugin}`, result)
          },
        }
        ;(async () => {
          try {
            const json = await metrics.insights({login}, {...api, ...uapi(req.headers["x-metrics-session"]), conf, callbacks}, {Plugins, Templates})
            //Cache
            cache.put(`insights.${login}`, json)
            if ((!debug) && (cached)) {
              const maxage = Math.round(Number(req.query.cache))
              cache.put(`insights.${login}`, json, maxage > 0 ? maxage : cached)
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
  }
  else {
    app.get("/about/*", (req, res) => res.redirect(req.path.replace("/about/", "/insights/")))
    app.get("/insights/*", (req, res) => res.status(405).send("Method not allowed: this endpoint is not available"))
  }

  //Metrics embed
  if (conf.settings.modes.includes("embed")) {
    console.debug("metrics/app > setup embed mode")
    //Static routes
    app.get("/embed/", limiter, (req, res) => res.sendFile(`${conf.paths.statics}/embed/index.html`))
    app.get("/embed/index.html", limiter, (req, res) => res.sendFile(`${conf.paths.statics}/embed/index.html`))
    app.use("/.placeholders", express.static(`${conf.paths.statics}/embed/placeholders`))
    app.get("/.js/embed/app.js", limiter, (req, res) => res.sendFile(`${conf.paths.statics}/embed/app.js`))
    app.get("/.js/embed/app.placeholder.js", limiter, (req, res) => res.sendFile(`${conf.paths.statics}/embed/app.placeholder.js`))
    //App routes
    app.get("/:login/:repository?", ...middlewares, async (req, res, next) => {
      //Request params
      const login = req.params.login?.replace(/[\n\r]/g, "")
      const repository = req.params.repository?.replace(/[\n\r]/g, "")
      let solve = null
      //Check username
      if ((login.startsWith(".")) || (login.includes("/")))
        return next()
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
        //Prepare settings
        const q = req.query
        console.debug(`metrics/app/${login} > ${util.inspect(q, {depth: Infinity, maxStringLength: 256})}`)
        const octokit = {...api, ...uapi(req.headers["x-metrics-session"])}
        let uconf = conf
        if ((octokit.login) && (conf.settings.extras?.logged) && (uconf.settings.extras?.features !== true)) {
          console.debug(`metrics/app/${login} > session is authenticated, adding additional permissions ${conf.settings.extras.logged}`)
          uconf = {...conf, settings: {...conf.settings, extras: {...conf.settings.extras}}}
          uconf.settings.extras.features = uconf.settings.extras.features ?? []
          uconf.settings.extras.features.push(...conf.settings.extras.logged)
        }
        //Preset
        if ((q["config.presets"]) && ((uconf.settings.extras?.features?.includes("metrics.setup.community.presets")) || (uconf.settings.extras?.features === true) || (uconf.settings.extras?.default))) {
          console.debug(`metrics/app/${login} > presets have been specified, loading them`)
          Object.assign(q, await presets(q["config.presets"]))
        }
        //Render
        const convert = uconf.settings.outputs.includes(q["config.output"]) ? q["config.output"] : uconf.settings.outputs[0]
        const {rendered, mime} = await metrics({login, q}, {
          ...octokit,
          plugins,
          conf: uconf,
          die: q["plugins.errors.fatal"] ?? false,
          verify: q.verify ?? false,
          convert: convert !== "auto" ? convert : null,
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
  }
  else {
    app.get("/embed/*", (req, res) => res.status(405).send("Method not allowed: this endpoint is not available"))
  }

  //Control endpoints
  if (conf.settings.control?.token) {
    const middleware = (req, res, next) => {
      console.log(`metrics/app/control > ${req.url.replace(/[\n\r]/g, "")}`)
      if (req.headers.authorization === conf.settings.control.token) {
        next()
        return
      }
      return res.status(401).send("Unauthorized: invalid token")
    }
    app.post("/.control/stop", limiter, middleware, async (req, res) => {
      console.debug("metrics/app/control > instance will be stopped in a few seconds")
      res.status(202).send("Accepted: instance will be stopped in a few seconds")
      await new Promise(resolve => setTimeout(resolve, 5000))
      process.exit(1)
    })
  }

  //Listen
  app.listen(port, () =>
    console.log([
      "───────────────────────────────────────────────────────────────────",
      "── Server configuration ───────────────────────────────────────────",
      `Listening on port         │ ${port}`,
      `Modes                     │ ${conf.settings.modes}`,
      "── Server capacity ───────────────────────────────────────────────",
      `Restricted to users       │ ${restricted.size ? [...restricted].join(", ") : "(unrestricted)"}`,
      `Max simultaneous users    │ ${maxusers ? `${maxusers} users` : "(unrestricted)"}`,
      `Rate limiter              │ ${ratelimiter ? util.inspect(ratelimiter, {depth: Infinity, maxStringLength: 256}) : "(enabled)"}`,
      `Max repositories per user │ ${conf.settings.repositories}`,
      "── Render settings ────────────────────────────────────────────────",
      `Cached time               │ ${cached} seconds`,
      `SVG optimization          │ ${conf.settings.optimize ?? false}`,
      `Allowed outputs           │ ${conf.settings.outputs.join(", ")}`,
      `Padding                   │ ${conf.settings.padding}`,
      "── Sandbox ────────────────────────────────────────────────────────",
      `Debug                     │ ${debug}`,
      `Debug (puppeteer)         │ ${conf.settings["debug.headless"] ?? false}`,
      `Mocked data               │ ${conf.settings.mocked ?? false}`,
      "── Content ────────────────────────────────────────────────────────",
      `Plugins enabled           │ ${enabled.map(({name}) => name).join(", ")}`,
      `Templates enabled         │ ${templates.filter(({enabled}) => enabled).map(({name}) => name).join(", ")}`,
      "── OAuth ──────────────────────────────────────────────────────────",
      `Client id                 │ ${conf.settings.oauth?.id ?? "(none)"}`,
      "── Extras ─────────────────────────────────────────────────────────",
      `Default                   │ ${conf.settings.extras?.default ?? false}`,
      `Features                  │ ${Array.isArray(conf.settings.extras?.features) ? conf.settings.extras.features?.length ? conf.settings.extras?.features : "(none)" : "(default)"}`,
      "───────────────────────────────────────────────────────────────────",
      "Server ready !",
    ].join("\n")))
}
