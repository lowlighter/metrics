//Imports
  import * as utils from "./utils.mjs"
  import ejs from "ejs"
  import util from "util"
  import SVGO from "svgo"
  import xmlformat from "xml-formatter"

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
          const imports = {plugins:Plugins, templates:Templates, metadata:conf.metadata, ...utils, ...(/markdown/.test(convert) ? {imgb64(url, options) {
            return options?.force ? utils.imgb64(...arguments) : url
          }} : null)}
          const experimental = new Set(decodeURIComponent(q["experimental.features"] ?? "").split(" ").map(x => x.trim().toLocaleLowerCase()).filter(x => x))
          if (conf.settings["debug.headless"])
            imports.puppeteer.headless = false

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

        //JSON output
          if (convert === "json") {
            console.debug(`metrics/compute/${login} > json output`)
            return {rendered:data, mime:"application/json"}
          }

        //Markdown output
          if (/markdown/.test(convert)) {
            //Retrieving template source
              console.debug(`metrics/compute/${login} > markdown render`)
              let source = image
              try {
                let template = `${q.markdown}`.replace(/\n/g, "")
                if (!/^https:/.test(template)) {
                  const {data:{default_branch:branch, full_name:repo}} = await rest.repos.get({owner:login, repo:q.repo||login})
                  console.debug(`metrics/compute/${login} > on ${repo} with default branch ${branch}`)
                  template = `https://raw.githubusercontent.com/${repo}/${branch}/${template}`
                }
                console.debug(`metrics/compute/${login} > fetching ${template}`)
                ;({data:source} = await imports.axios.get(template, {headers:{Accept:"text/plain"}}))
              }
              catch (error) {
                console.debug(error)
              }
            //Embed method
              const embed = async(name, q) => {
                q = Object.fromEntries([...Object.entries(q).map(([key, value]) => [key.replace(/^plugin_/, "").replace(/_/g, "."), value]), ["base", false], ["config.animations", false]])
                const plugins = Object.fromEntries(Object.entries(arguments[1].plugins).map(([key, value]) => [key, {...value, enabled:true}]))
                const {rendered} = await metrics({login, q}, {...arguments[1], plugins, convert:null}, arguments[2])
                return `<img class="metrics-cachable" data-name="${name}" src="data:image/svg+xml;base64,${Buffer.from(rendered).toString("base64")}">`
              }
            //Rendering template source
              let rendered = source.replace(/\{\{ (?<content>[\s\S]*?) \}\}/g, "{%= $<content> %}")
              console.debug(rendered)
              for (const delimiters of [{openDelimiter:"<", closeDelimiter:">"}, {openDelimiter:"{", closeDelimiter:"}"}])
                rendered = await ejs.render(rendered, {...data, s:imports.s, f:imports.format, embed}, {views, async:true, ...delimiters})
              console.debug(`metrics/compute/${login} > success`)
            //Output
              if (convert === "markdown-pdf")
                return imports.svg.pdf(await imports.marked(rendered), {paddings:q["config.padding"] || conf.settings.padding, style:(conf.settings.extras?.css ?? conf.settings.extras?.default ? q["extras.css"] ?? "" : "")})
              return {rendered, mime:"text/plain"}
          }

        //Rendering
          console.debug(`metrics/compute/${login} > render`)
          let rendered = await ejs.render(image, {...data, s:imports.s, f:imports.format, style:style+(conf.settings.extras?.css ?? conf.settings.extras?.default ? q["extras.css"] ?? "" : ""), fonts}, {views, async:true})

        //Additional transformations
          if (q["config.twemoji"])
            rendered = await imports.svg.twemojis(rendered)
          if (q["config.gemoji"])
            rendered = await imports.svg.gemojis(rendered, {rest})
        //Optimize rendering
          if (!q.raw)
            rendered = xmlformat(rendered, {lineSeparator:"\n", collapseContent:true})
          if ((conf.settings?.optimize)&&(!q.raw)) {
            console.debug(`metrics/compute/${login} > optimize`)
            if (experimental.has("--optimize")) {
              const {error, data:optimized} = await SVGO.optimize(rendered, {multipass:true, plugins:SVGO.extendDefaultPlugins([
                //Additional cleanup
                  {name:"cleanupListOfValues"},
                  {name:"removeRasterImages"},
                  {name:"removeScriptElement"},
                //Force CSS style consistency
                  {name:"inlineStyles", active:false},
                  {name:"removeViewBox", active:false},
              ])})
              if (error)
                throw new Error(`Could not optimize SVG: \n${error}`)
              rendered = optimized
              console.debug(`metrics/compute/${login} > optimize > success`)
            }
            else
              console.debug(`metrics/compute/${login} > optimize > this feature is currently disabled due to display issues (use --optimize flag in experimental features to force enable it)`)
          }
        //Verify svg
          if (verify) {
            console.debug(`metrics/compute/${login} > verify SVG`)
            const libxmljs = (await import("libxmljs2")).default
            const parsed = libxmljs.parseXml(rendered)
            if (parsed.errors.length)
              throw new Error(`Malformed SVG : \n${parsed.errors.join("\n")}`)
            console.debug(`metrics/compute/${login} > verified SVG, no parsing errors found`)
          }
        //Resizing
          const {resized, mime} = await imports.svg.resize(rendered, {paddings:q["config.padding"] || conf.settings.padding, convert})
          rendered = resized

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

