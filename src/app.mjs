//Imports
  import express from "express"
  import octokit from "@octokit/graphql"
  import OctokitRest from "@octokit/rest"
  import cache from "memory-cache"
  import ratelimit from "express-rate-limit"
  import compression from "compression"
  import setup from "./setup.mjs"
  import metrics from "./metrics.mjs"
  import Templates from "./templates/index.mjs"

/** App */
  export default async function () {

    //Load configuration settings
      const conf = await setup()
      const {token, maxusers = 0, restricted = [], debug = false, cached = 30*60*1000, port = 3000, ratelimiter = null, plugins = null} = conf.settings

    //Load octokits
      const graphql = octokit.graphql.defaults({headers:{authorization: `token ${token}`}})
      const rest = new OctokitRest.Octokit({auth:token})

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
      const limiter = ratelimit({max:60, windowMs:60*1000})
      const templates = [...new Set([conf.settings.templates.default, ...(conf.settings.templates.enabled.length ? Object.keys(Templates).filter(key => conf.settings.templates.enabled.includes(key)) : Object.keys(Templates))])]
      const enabled = Object.entries(plugins).filter(([key, plugin]) => plugin.enabled).map(([key]) => key)
      const actions = {flush:new Map()}
      app.get("/", limiter, (req, res) => res.sendFile(`${conf.statics}/index.html`))
      app.get("/index.html", limiter, (req, res) => res.sendFile(`${conf.statics}/index.html`))
      app.get("/favicon.ico", limiter, (req, res) => res.sendStatus(204))
      app.get("/plugins.list", limiter, (req, res) => res.status(200).json(enabled))
      app.get("/templates.list", limiter, (req, res) => res.status(200).json(templates))
      app.get("/ejs.min.js", limiter, (req, res) => res.sendFile(`${conf.node_modules}/ejs/ejs.min.js`))
      app.get("/axios.min.js", limiter, (req, res) => res.sendFile(`${conf.node_modules}/axios/dist/axios.min.js`))
      app.get("/axios.min.map", limiter, (req, res) => res.sendFile(`${conf.node_modules}/axios/dist/axios.min.map`))
      app.get("/vue.min.js", limiter, (req, res) => res.sendFile(`${conf.node_modules}/vue/dist/vue.min.js`))
      app.get("/placeholder.svg", limiter, async (req, res) => {
        const template = req.query.template || conf.settings.templates.default
        if (!(template in Templates))
          return res.sendStatus(404)
        const {style, placeholder} = conf.templates[template]
        res.status(200).json({style, placeholder})
      })
      app.get("/action.flush", limiter, async (req, res) => {
        const {token, user} = req.query
        if (token) {
          if (actions.flush.has(token)) {
            console.debug(`metrics/app/${login} > flushed cache`)
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
          const {login} = req.params
          if ((restricted.length)&&(!restricted.includes(login))) {
            console.debug(`metrics/app/${login} > 403 (not in whitelisted users)`)
            return res.sendStatus(403)
          }
        //Read cached data if possible
          if ((!debug)&&(cached)&&(cache.get(login))) {
            res.header("Content-Type", "image/svg+xml")
            res.send(cache.get(login))
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
            console.log(req.query)
              const rendered = await metrics({login, q:parse(req.query)}, {graphql, rest, plugins, conf})
            //Cache
              if ((!debug)&&(cached))
                cache.put(login, rendered, cached)
            //Send response
              res.header("Content-Type", "image/svg+xml")
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
        `Listening on port      | ${port}`,
        `Debug mode             | ${debug}`,
        `Restricted to users    | ${restricted.size ? [...restricted].join(", ") : "(unrestricted)"}`,
        `Cached time            | ${cached} seconds`,
        `Rate limiter           | ${ratelimiter ? JSON.stringify(ratelimiter) : "(enabled)"}`,
        `Max simultaneous users | ${maxusers ? `${maxusers} users` : "(unrestricted)"}`,
        `Plugins enabled        | ${enabled.join(", ")}`
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
          query[key] = !!value
      //Parse null
        if (/^null$/.test(value))
          query[key] = null
    }
    return query
  }
