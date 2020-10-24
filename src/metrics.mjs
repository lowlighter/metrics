//Imports
  import ejs from "ejs"
  import SVGO from "svgo"
  import imgb64 from "image-to-base64"
  import Plugins from "./plugins/index.mjs"
  import Templates from "./templates/index.mjs"

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
          const {query, image, style} = conf.templates[template]

        //Query data from GitHub API
          console.debug(`metrics/compute/${login} > query`)
          const data = await graphql(query
            .replace(/[$]login/, `"${login}"`)
            .replace(/[$]repositories/, `${repositories}`)
            .replace(/[$]calendar.to/, `"${(new Date()).toISOString()}"`)
            .replace(/[$]calendar.from/, `"${(new Date(Date.now()-14*24*60*60*1000)).toISOString()}"`)
          )
          console.debug(`metrics/compute/${login} > query > success`)

        //Base parts
          data.base = {}
          for (const part of conf.settings.plugins.base.parts)
            data.base[part] = (`base.${part}` in q) ? !!q[`base.${part}`] : true

        //Template
          console.debug(`metrics/compute/${login} > compute`)
          const computer = Templates[template].default || Templates[template]
          await computer({login, q}, {conf, data, rest, graphql, plugins}, {s, pending, imports:{plugins:Plugins, imgb64}})
          await Promise.all(pending)
          console.debug(`metrics/compute/${login} > compute > success`)

        //Eval rendering
          console.debug(`metrics/compute/${login} > render`)
          let rendered = await ejs.render(image, {...data, s, style}, {async:true})
          console.debug(`metrics/compute/${login} > render > success`)

        //Optimize rendering
          if ((conf.optimize)&&(!q.raw)) {
            console.debug(`metrics/compute/${login} > optimize`)
            const svgo = new SVGO({full:true, plugins:[{cleanupAttrs:true}, {inlineStyles:false}]})
            const {data:optimized} = await svgo.optimize(rendered)
            console.debug(`metrics/compute/${login} > optimize > success`)
            rendered = optimized
          }

        //Result
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