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
          const template = q.template || conf.settings.templates.default
          const pending = []
          const s = (value, end = "") => value > 1 ? {y:"ies", "":"s"}[end] : end
          if ((!(template in Templates))||(!(template in conf.templates))||((conf.settings.templates.enabled.length)&&(!conf.settings.templates.enabled.includes(template))))
            throw new Error("unsupported template")
          const {query, image, style} = conf.templates[template]

        //Query data from GitHub API
          console.debug(`metrics/compute/${login} > query`)
          const data = await graphql(query
            .replace(/[$]login/, `"${login}"`)
            .replace(/[$]calendar.to/, `"${(new Date()).toISOString()}"`)
            .replace(/[$]calendar.from/, `"${(new Date(Date.now()-14*24*60*60*1000)).toISOString()}"`)
          )
          console.debug(`metrics/compute/${login} > query > success`)

        //Template
          console.debug(`metrics/compute/${login} > compute`)
          const computer = Templates[template].default || Templates[template]
          await computer({login, q}, {data, rest, graphql, plugins}, {s, pending, imports:{plugins:Plugins, imgb64}})
          await Promise.all(pending)
          console.debug(`metrics/compute/${login} > compute > success`)

        //Eval rendering
          console.debug(`metrics/compute/${login} > render`)
          let rendered = await ejs.render(image, {...data, s, style}, {async:true})
          console.debug(`metrics/compute/${login} > render > success`)

        //Optimize rendering
          if (conf.optimize) {
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