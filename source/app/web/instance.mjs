//Imports
  import octokit from "@octokit/graphql"
  import OctokitRest from "@octokit/rest"
  import express from "express"
  import ratelimit from "express-rate-limit"
  import compression from "compression"
  import cache from "memory-cache"
  import util from "util"
  import setup from "../setup.mjs"
  import mocks from "../mocks.mjs"
  import metrics from "../metrics.mjs"

/** App */
  export default async function ({mock = false, nosettings = false} = {}) {

    //Load configuration settings
      const {conf, Plugins, Templates} = await setup({nosettings})
      const {token, maxusers = 0, restricted = [], debug = false, cached = 30*60*1000, port = 3000, ratelimiter = null, plugins = null} = conf.settings
      cache.placeholder = new cache.Cache()

    //Apply configuration mocking if needed
      if (mock) {
        console.debug(`metrics/app > using mocked settings`)
        const {settings} = conf
        //Mock token if it's undefined
          if (!settings.token)
            settings.token = (console.debug(`metrics/app > using mocked token`), "MOCKED_TOKEN")
        //Mock plugins state and tokens if they're undefined
          for (const plugin of Object.keys(Plugins)) {
            if (!settings.plugins[plugin])
              settings.plugins[plugin] = {}
            settings.plugins[plugin].enabled = settings.plugins[plugin].enabled ?? (console.debug(`metrics/app > using mocked token enable state for ${plugin}`), true)
            if (["tweets", "pagespeed"].includes(plugin))
              settings.plugins[plugin].token = settings.plugins[plugin].token ?? (console.debug(`metrics/app > using mocked token for ${plugin}`), "MOCKED_TOKEN")
            if (["music"].includes(plugin))
              settings.plugins[plugin].token = settings.plugins[plugin].token ?? (console.debug(`metrics/app > using mocked token for ${plugin}`), "MOCKED_CLIENT_ID, MOCKED_CLIENT_SECRET, MOCKED_REFRESH_TOKEN")
          }
        console.debug(util.inspect(settings, {depth:Infinity, maxStringLength:256}))
      }

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
        if (!["/placeholder"].includes(req.path))
          res.header("Cache-Control", cached ? `public, max-age=${cached}` : "no-store, no-cache")
        next()
      })

    //Base routes
      const limiter = ratelimit({max:debug ? Number.MAX_SAFE_INTEGER : 60, windowMs:60*1000})
      const templates =  Object.entries(Templates).map(([name]) => ({name, enabled:(conf.settings.templates.enabled.length ? conf.settings.templates.enabled.includes(name) : true) ?? false}))
      const enabled = Object.entries(Plugins).map(([name]) => ({name, enabled:plugins[name]?.enabled ?? false}))
      const actions = {flush:new Map()}
      app.get("/", limiter, (req, res) => res.sendFile(`${conf.statics}/index.html`))
      app.get("/index.html", limiter, (req, res) => res.sendFile(`${conf.statics}/index.html`))
      app.get("/favicon.ico", limiter, (req, res) => res.sendStatus(204))
      app.get("/.version", limiter, (req, res) => res.status(200).send(conf.package.version))
      app.get("/.requests", limiter, async (req, res) => res.status(200).json((await rest.rateLimit.get()).data.rate))
      app.get("/.templates", limiter, (req, res) => res.status(200).json(templates))
      app.get("/.plugins", limiter, (req, res) => res.status(200).json(enabled))
      app.get("/.plugins.base", limiter, (req, res) => res.status(200).json(conf.settings.plugins.base.parts))
      app.get("/.css/style.css", limiter, (req, res) => res.sendFile(`${conf.statics}/style.css`))
      app.get("/.css/style.vars.css", limiter, (req, res) => res.sendFile(`${conf.statics}/style.vars.css`))
      app.get("/.css/style.prism.css", limiter, (req, res) => res.sendFile(`${conf.node_modules}/prismjs/themes/prism-tomorrow.css`))
      app.get("/.js/app.js", limiter, (req, res) => res.sendFile(`${conf.statics}/app.js`))
      app.get("/.js/ejs.min.js", limiter, (req, res) => res.sendFile(`${conf.node_modules}/ejs/ejs.min.js`))
      app.get("/.js/axios.min.js", limiter, (req, res) => res.sendFile(`${conf.node_modules}/axios/dist/axios.min.js`))
      app.get("/.js/axios.min.map", limiter, (req, res) => res.sendFile(`${conf.node_modules}/axios/dist/axios.min.map`))
      app.get("/.js/vue.min.js", limiter, (req, res) => res.sendFile(`${conf.node_modules}/vue/dist/vue.min.js`))
      app.get("/.js/vue.prism.min.js", limiter, (req, res) => res.sendFile(`${conf.node_modules}/vue-prism-component/dist/vue-prism-component.min.js`))
      app.get("/.js/vue-prism-component.min.js.map", limiter, (req, res) => res.sendFile(`${conf.node_modules}/vue-prism-component/dist/vue-prism-component.min.js.map`))
      app.get("/.js/prism.min.js", limiter, (req, res) => res.sendFile(`${conf.node_modules}/prismjs/prism.js`))
      app.get("/.js/prism.yaml.min.js", limiter, (req, res) => res.sendFile(`${conf.node_modules}/prismjs/components/prism-yaml.min.js`))
      app.get("/.js/prism.markdown.min.js", limiter, (req, res) => res.sendFile(`${conf.node_modules}/prismjs/components/prism-markdown.min.js`))
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
        //Placeholder hash
          const placeholder = Object.entries(parse(req.query)).filter(([key, value]) =>
            ((key in Plugins)&&(!!value))||
            ((key === "template")&&(value in Templates))||
            (/base[.](header|activity|community|repositories|metadata)/.test(key))||
            (["pagespeed.detailed", "pagespeed.screenshot", "habits.charts", "habits.facts", "topics.mode"].includes(key))
          ).map(([key, value]) => `${key}${
            key === "template" ? `#${value}` :
            key === "topics.mode" ? `#${value === "mastered" ? value : "starred"}` :
            !!value
          }`).sort().join("+")

        //Request params
          const {login} = req.params
          if ((restricted.length)&&(!restricted.includes(login))) {
            console.debug(`metrics/app/${login} > 403 (not in whitelisted users)`)
            return res.sendStatus(403)
          }
        //Read cached data if possible
          //Placeholder
            if ((login === "placeholder")&&(cache.placeholder.get(placeholder))) {
              const {rendered, mime} = cache.placeholder.get(placeholder)
              res.header("Content-Type", mime)
              res.send(rendered)
              return
            }
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
              const q = parse(req.query)
              console.debug(`metrics/app/${login} > ${util.inspect(q, {depth:Infinity, maxStringLength:256})}`)
              const {rendered, mime} = await metrics({login, q}, {
                graphql, rest, plugins, conf,
                die:q["plugins.errors.fatal"] ?? false,
                verify:q["verify"] ?? false,
                convert:["jpeg", "png"].includes(q["config.output"]) ? q["config.output"] : null
              }, {Plugins, Templates})
            //Cache
              if (login === "placeholder")
                cache.placeholder.put(placeholder, {rendered, mime})
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
                console.debug(`metrics/app/${login} > 404 (user not found)`)
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
        `Restricted to users    │ ${restricted.size ? [...restricted].join(", ") : "(unrestricted)"}`,
        `Cached time            │ ${cached} seconds`,
        `Rate limiter           │ ${ratelimiter ? util.inspect(ratelimiter, {depth:Infinity, maxStringLength:256}) : "(enabled)"}`,
        `Max simultaneous users │ ${maxusers ? `${maxusers} users` : "(unrestricted)"}`,
        `Plugins enabled        │ ${enabled.map(({name}) => name).join(", ")}`,
        `Server ready !`
      ].join("\n")))
  }

/** Query parser */
  function parse(query) {
    for (const [key, value] of Object.entries(query)) {
      //Parse number
        if (/^\d+$/.test(value))
          query[key] = Number(value)
      //Parse boolean
        if (/^(?:true|false)$/.test(value))
          query[key] = (value === "true")||(value === true)
      //Parse null
        if (/^null$/.test(value))
          query[key] = null
    }
    return query
  }
