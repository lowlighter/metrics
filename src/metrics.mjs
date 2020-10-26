//Imports
  import ejs from "ejs"
  import SVGO from "svgo"
  import imgb64 from "image-to-base64"
  import axios from "axios"
  import Plugins from "./plugins/index.mjs"
  import Templates from "./templates/index.mjs"
  import puppeteer from "puppeteer"
  import url from "url"

//Setup
  export default async function metrics({login, q}, {graphql, rest, plugins, conf}) {
    //Compute rendering
      try {

        //Init
          console.debug(`metrics/compute/${login} > start`)
          console.debug(JSON.stringify(q))
          const template = q.template || conf.settings.templates.default
          const repositories = Math.max(0, Number(q.repositories)) || conf.settings.repositories || 100
          const pending = []
          const s = (value, end = "") => value > 1 ? {y:"ies", "":"s"}[end] : end
          if ((!(template in Templates))||(!(template in conf.templates))||((conf.settings.templates.enabled.length)&&(!conf.settings.templates.enabled.includes(template))))
            throw new Error("unsupported template")
          const {query, image, style, fonts} = conf.templates[template]

        //Query data from GitHub API
          console.debug(`metrics/compute/${login} > graphql query`)
          const data = await graphql(query
            .replace(/[$]login/, `"${login}"`)
            .replace(/[$]repositories/, `${repositories}`)
            .replace(/[$]calendar.to/, `"${(new Date()).toISOString()}"`)
            .replace(/[$]calendar.from/, `"${(new Date(Date.now()-14*24*60*60*1000)).toISOString()}"`)
          )

        //Base parts
          data.base = {}
          if (("base" in q)&&(!q.base))
            conf.settings.plugins.base.parts.map(part => q[`base.${part}`] = false)
          for (const part of conf.settings.plugins.base.parts)
            data.base[part] = (`base.${part}` in q) ? !!q[`base.${part}`] : true

        //Compute metrics
          console.debug(`metrics/compute/${login} > compute`)
          const computer = Templates[template].default || Templates[template]
          await computer({login, q}, {conf, data, rest, graphql, plugins}, {s, pending, imports:{plugins:Plugins, url, imgb64, axios, puppeteer, format, shuffle}})

        //Promised computed metrics
          const promised = await Promise.all(pending)
          if (conf.settings.debug)
            for (const {name, result = null} of promised)
              console.debug(`plugin ${name} ${result ? result.error ? "failed" : "success" : "ignored"} : ${JSON.stringify(result).replace(/^(.{888}).+/, "$1...")}`)

        //Template rendering
          console.debug(`metrics/compute/${login} > render`)
          let rendered = await ejs.render(image, {...data, s, style, fonts}, {async:true})

        //Optimize rendering
          if ((conf.optimize)&&(!q.raw)) {
            console.debug(`metrics/compute/${login} > optimize`)
            const svgo = new SVGO({full:true, plugins:[{cleanupAttrs:true}, {inlineStyles:false}]})
            const {data:optimized} = await svgo.optimize(rendered)
            rendered = optimized
          }

        //Result
          console.debug(`metrics/compute/${login} > success`)
          return rendered
      }
    //Internal error
      catch (error) {
        //User not found
          if (((Array.isArray(error.errors))&&(error.errors[0].type === "NOT_FOUND")))
            throw new Error("user not found")
        //Generic error
          throw error
      }
  }

/** Formatter */
  function format(n) {
    for (const {u, v} of [{u:"b", v:10**9}, {u:"m", v:10**6}, {u:"k", v:10**3}])
      if (n/v >= 1)
        return `${(n/v).toFixed(2).substr(0, 4).replace(/[.]0*$/, "")}${u}`
    return n
  }

/** Array shuffler */
  function shuffle(array) {
    for (let i = array.length-1; i > 0; i--) {
      const j = Math.floor(Math.random()*(i+1))
      ;[array[i], array[j]] = [array[j], array[i]]
    }
    return array
  }
