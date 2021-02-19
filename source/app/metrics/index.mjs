//Imports
  import * as utils from "./utils.mjs"
  import ejs from "ejs"
  import util from "util"
  import SVGO from "svgo"

//Setup
  export default async function metrics({login, q}, {graphql, rest, plugins, conf, die = false, verify = false, convert = null}, {Plugins, Templates}) {
    //Compute rendering
      try {

        //Debug
          login = login.replace(/[\n\r]/g, "")
          console.debug(`metrics/compute/${login} > start`)
          console.debug(util.inspect(q, {depth:Infinity, maxStringLength:256}))

        //Load template
          const template = q.template || conf.settings.templates.default
          if ((!(template in Templates))||(!(template in conf.templates))||((conf.settings.templates.enabled.length)&&(!conf.settings.templates.enabled.includes(template))))
            throw new Error("unsupported template")
          const {image, style, fonts, views, partials} = conf.templates[template]
          const computer = Templates[template].default || Templates[template]

        //Initialization
          const pending = []
          const {queries} = conf
          const data = {animated:true, base:{}, config:{}, errors:[], plugins:{}, computed:{}}
          const imports = {plugins:Plugins, templates:Templates, metadata:conf.metadata, ...utils}

        //Partial parts
          {
            data.partials = new Set([
              ...decodeURIComponent(q["config.order"] ?? "").split(",").map(x => x.trim().toLocaleLowerCase()).filter(partial => partials.includes(partial)),
              ...partials,
            ])
            console.debug(`metrics/compute/${login} > content order : ${[...data.partials]}`)
          }

        //Executing base plugin and compute metrics
          console.debug(`metrics/compute/${login} > compute`)
          await Plugins.base({login, q, data, rest, graphql, plugins, queries, pending, imports}, conf)
          await computer({login, q}, {conf, data, rest, graphql, plugins, queries, account:data.account}, {pending, imports})
          const promised = await Promise.all(pending)

        //Check plugins errors
          const errors = [...promised.filter(({result = null}) => result?.error), ...data.errors]
          if (errors.length) {
            console.warn(`metrics/compute/${login} > ${errors.length} errors !`)
            if (die)
              throw new Error("An error occured during rendering, dying")
            else
              console.warn(util.inspect(errors, {depth:Infinity, maxStringLength:256}))
          }

        //Rendering and resizing
          console.debug(`metrics/compute/${login} > render`)
          let rendered = await ejs.render(image, {...data, s:imports.s, f:imports.format, style, fonts}, {views, async:true})
          if (q["config.twemoji"])
            rendered = await imports.svgemojis(rendered)
          const {resized, mime} = await imports.svgresize(rendered, {paddings:q["config.padding"] || conf.settings.padding, convert})
          rendered = resized

        //Additional SVG transformations
          if (/svg/.test(mime)) {
            //Optimize rendering
              if ((conf.settings?.optimize)&&(!q.raw)) {
                console.debug(`metrics/compute/${login} > optimize`)
                const {data:optimized} = await SVGO.optimize(rendered, {multipass:true, plugins:SVGO.extendDefaultPlugins([
                  //Additional cleanup
                    {name:"cleanupListOfValues"},
                    {name:"removeRasterImages"},
                    {name:"removeScriptElement"},
                  //Force CSS style consistency
                    {name:"inlineStyles", active:false},
                    {name:"removeViewBox", active:false},
                ])})
                rendered = optimized
              }
            //Verify svg
              if (verify) {
                console.debug(`metrics/compute/${login} > verify SVG`)
                const libxmljs = (await import("libxmljs")).default
                const parsed = libxmljs.parseXml(rendered)
                if (parsed.errors.length)
                  throw new Error(`Malformed SVG : \n${parsed.errors.join("\n")}`)
              }
          }

        //Result
          console.debug(`metrics/compute/${login} > success`)
          return {rendered, mime}
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

