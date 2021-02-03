//Imports
  import octokit from "@octokit/graphql"
  import OctokitRest from "@octokit/rest"
  import express from "express"
  import ratelimit from "express-rate-limit"
  import compression from "compression"
  import cache from "memory-cache"
  import util from "util"
  import setup from "../metrics/setup.mjs"
  import mocks from "../mocks/index.mjs"
  import metrics from "../metrics/index.mjs"

/** App */
  export default async function ({mock, nosettings} = {}) {

    //Load configuration settings
      const {conf, Plugins, Templates} = await setup({nosettings})
      const {token, maxusers = 0, restricted = [], debug = false, cached = 30*60*1000, port = 3000, ratelimiter = null, plugins = null} = conf.settings
      mock = mock || conf.settings.mocked

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
            const tokens = Object.entries(conf.metadata.plugins[plugin].inputs).filter(([key, value]) => (!/^plugin_/.test(key))&&(value.type === "token")).map(([key]) => key)
            for (const token of tokens) {
              if ((!settings.plugins[plugin][token])||(mock === "force")) {
                console.debug(`metrics/app > using mocked token for ${plugin}.${token}`)
                settings.plugins[plugin][token] = "MOCKED_TOKEN"
              }
            }
          }
      }
      if (((mock)&&(!conf.settings.token))||(mock === "force")) {
        console.debug(`metrics/app > using mocked token`)
        conf.settings.token = "MOCKED_TOKEN"
      }
      if (debug)
        console.debug(util.inspect(conf.settings, {depth:Infinity, maxStringLength:256}))

    //Load octokits
      const api = {graphql:octokit.graphql.defaults({headers:{authorization: `token ${token}`}}), rest:new OctokitRest.Octokit({auth:token})}
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
          skip(req, res) { return !!cache.get(req.params.login) },
          message:"Too many requests",
          ...ratelimiter
        }))
      }
    //Cache headers middleware
      middlewares.push((req, res, next) => {
        res.header("Cache-Control", cached ? `public, max-age=${cached}` : "no-store, no-cache")
        next()
      })

    //Base routes
      const limiter = ratelimit({max:debug ? Number.MAX_SAFE_INTEGER : 60, windowMs:60*1000})
      const metadata = Object.fromEntries(Object.entries(conf.metadata.plugins)
        .filter(([key]) => !["base", "core"].includes(key))
        .map(([key, value]) => [key, Object.fromEntries(Object.entries(value).filter(([key]) => ["name", "icon", "web", "supports"].includes(key)))]))
      const enabled = Object.entries(metadata).map(([name]) => ({name, enabled:plugins[name]?.enabled ?? false}))
      const templates =  Object.entries(Templates).map(([name]) => ({name, enabled:(conf.settings.templates.enabled.length ? conf.settings.templates.enabled.includes(name) : true) ?? false}))
      const actions = {flush:new Map()}
      let requests = {limit:0, used:0, remaining:0, reset:NaN}
      if (!conf.settings.notoken) {
        requests = (await rest.rateLimit.get()).data.rate
        setInterval(async () => requests = (await rest.rateLimit.get()).data.rate, 30*1000)
      }
      //Web
        app.get("/", limiter, (req, res) => res.sendFile(`${conf.paths.statics}/index.html`))
        app.get("/index.html", limiter, (req, res) => res.sendFile(`${conf.paths.statics}/index.html`))
        app.get("/favicon.ico", limiter, (req, res) => res.sendFile(`${conf.paths.statics}/favicon.png`))
        app.get("/.favicon.png", limiter, (req, res) => res.sendFile(`${conf.paths.statics}/favicon.png`))
        app.get("/.opengraph.png", limiter, (req, res) => res.sendFile(`${conf.paths.statics}/opengraph.png`))
      //Plugins and templates
        app.get("/.plugins", limiter, (req, res) => res.status(200).json(enabled))
        app.get("/.plugins.base", limiter, (req, res) => res.status(200).json(conf.settings.plugins.base.parts))
        app.get("/.plugins.metadata", limiter, (req, res) => res.status(200).json(metadata))
        app.get("/.templates", limiter, (req, res) => res.status(200).json(templates))
        app.get("/.templates/:template", limiter, (req, res) => req.params.template in conf.templates ? res.status(200).json(conf.templates[req.params.template]) : res.sendStatus(404))
        for (const template in conf.templates)
          app.use(`/.templates/${template}/partials`, express.static(`${conf.paths.templates}/${template}/partials`))
      //Styles
        app.get("/.css/style.css", limiter, (req, res) => res.sendFile(`${conf.paths.statics}/style.css`))
        app.get("/.css/style.vars.css", limiter, (req, res) => res.sendFile(`${conf.paths.statics}/style.vars.css`))
        app.get("/.css/style.prism.css", limiter, (req, res) => res.sendFile(`${conf.paths.node_modules}/prismjs/themes/prism-tomorrow.css`))
      //Scripts
        app.get("/.js/app.js", limiter, (req, res) => res.sendFile(`${conf.paths.statics}/app.js`))
        app.get("/.js/app.placeholder.js", limiter, (req, res) => res.sendFile(`${conf.paths.statics}/app.placeholder.js`))
        app.get("/.js/ejs.min.js", limiter, (req, res) => res.sendFile(`${conf.paths.node_modules}/ejs/ejs.min.js`))
        app.get("/.js/faker.min.js", limiter, (req, res) => res.sendFile(`${conf.paths.node_modules}/faker/dist/faker.min.js`))
        app.get("/.js/axios.min.js", limiter, (req, res) => res.sendFile(`${conf.paths.node_modules}/axios/dist/axios.min.js`))
        app.get("/.js/axios.min.map", limiter, (req, res) => res.sendFile(`${conf.paths.node_modules}/axios/dist/axios.min.map`))
        app.get("/.js/vue.min.js", limiter, (req, res) => res.sendFile(`${conf.paths.node_modules}/vue/dist/vue.min.js`))
        app.get("/.js/vue.prism.min.js", limiter, (req, res) => res.sendFile(`${conf.paths.node_modules}/vue-prism-component/dist/vue-prism-component.min.js`))
        app.get("/.js/vue-prism-component.min.js.map", limiter, (req, res) => res.sendFile(`${conf.paths.node_modules}/vue-prism-component/dist/vue-prism-component.min.js.map`))
        app.get("/.js/prism.min.js", limiter, (req, res) => res.sendFile(`${conf.paths.node_modules}/prismjs/prism.js`))
        app.get("/.js/prism.yaml.min.js", limiter, (req, res) => res.sendFile(`${conf.paths.node_modules}/prismjs/components/prism-yaml.min.js`))
        app.get("/.js/prism.markdown.min.js", limiter, (req, res) => res.sendFile(`${conf.paths.node_modules}/prismjs/components/prism-markdown.min.js`))
      //Meta
        app.get("/.version", limiter, (req, res) => res.status(200).send(conf.package.version))
        app.get("/.requests", limiter, async (req, res) => res.status(200).json(requests))
      //Cache
        app.get("/.uncache", limiter, async (req, res) => {
          const {token, user} = req.query
          if (token) {
            if (actions.flush.has(token)) {
              console.debug(`metrics/app/${actions.flush.get(token)} > flushed cache`)
              cache.del(actions.flush.get(token))
              return res.sendStatus(200)
            }
            else
              return res.sendStatus(404)
          }
          else {
            const token = `${Math.random().toString(16).replace("0.", "")}${Math.random().toString(16).replace("0.", "")}`
            actions.flush.set(token, user)
            return res.json({token})
          }
        })

    //Metrics
      app.get("/:login", ...middlewares, async (req, res) => {
        //Request params
          const login = req.params.login?.replace(/[\n\r]/g, "")
          if ((restricted.length)&&(!restricted.includes(login))) {
            console.debug(`metrics/app/${login} > 403 (not in whitelisted users)`)
            return res.sendStatus(403)
          }
        //Read cached data if possible
          //User cached
            if ((!debug)&&(cached)&&(cache.get(login))) {
              const {rendered, mime} = cache.get(login)
              res.header("Content-Type", mime)
              res.send(rendered)
              return
            }
        //Maximum simultaneous users
          if ((maxusers)&&(cache.size()+1 > maxusers)) {
            console.debug(`metrics/app/${login} > 503 (maximum users reached)`)
            return res.sendStatus(503)
          }

        //Compute rendering
          try {
            //Render
              const q = req.query
              console.debug(`metrics/app/${login} > ${util.inspect(q, {depth:Infinity, maxStringLength:256})}`)
              const {rendered, mime} = await metrics({login, q}, {
                graphql, rest, plugins, conf,
                die:q["plugins.errors.fatal"] ?? false,
                verify:q["verify"] ?? false,
                convert:["jpeg", "png"].includes(q["config.output"]) ? q["config.output"] : null
              }, {Plugins, Templates})
            //Cache
              if ((!debug)&&(cached))
                cache.put(login, {rendered, mime}, cached)
            //Send response
              res.header("Content-Type", mime)
              res.send(rendered)
          }
        //Internal error
          catch (error) {
            //Not found user
              if ((error instanceof Error)&&(/^user not found$/.test(error.message))) {
                console.debug(`metrics/app/${login} > 404 (user/organization not found)`)
                return res.sendStatus(404)
              }
            //Invalid template
              if ((error instanceof Error)&&(/^unsupported template$/.test(error.message))) {
                console.debug(`metrics/app/${login} > 400 (bad request)`)
                return res.sendStatus(400)
              }
            //General error
              console.error(error)
              res.sendStatus(500)
          }
      })

    //Listen
      app.listen(port, () => console.log([
        `Listening on port      │ ${port}`,
        `Debug mode             │ ${debug}`,
        `Mocked data            │ ${conf.settings.mocked ?? false}`,
        `Restricted to users    │ ${restricted.size ? [...restricted].join(", ") : "(unrestricted)"}`,
        `Cached time            │ ${cached} seconds`,
        `Rate limiter           │ ${ratelimiter ? util.inspect(ratelimiter, {depth:Infinity, maxStringLength:256}) : "(enabled)"}`,
        `Max simultaneous users │ ${maxusers ? `${maxusers} users` : "(unrestricted)"}`,
        `Plugins enabled        │ ${enabled.map(({name}) => name).join(", ")}`,
        `SVG optimization       │ ${conf.settings.optimize ?? false}`,
        `Server ready !`
      ].join("\n")))
  }
