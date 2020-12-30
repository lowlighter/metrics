//Imports
  import ejs from "ejs"
  import SVGO from "svgo"
  import imgb64 from "image-to-base64"
  import axios from "axios"
  import puppeteer from "puppeteer"
  import url from "url"
  import processes from "child_process"
  import fs from "fs/promises"
  import os from "os"
  import paths from "path"
  import util from "util"

//Setup
  export default async function metrics({login, q, dflags = []}, {graphql, rest, plugins, conf, die = false, verify = false}, {Plugins, Templates}) {
    //Compute rendering
      try {

        //Init
          console.debug(`metrics/compute/${login} > start`)
          console.debug(util.inspect(q, {depth:Infinity, maxStringLength:256}))
          const template = q.template || conf.settings.templates.default
          const repositories = Math.max(0, Number(q.repositories)) || conf.settings.repositories || 100
          const pending = []
          const s = (value, end = "") => value > 1 ? {y:"ies", "":"s"}[end] : end
          if ((!(template in Templates))||(!(template in conf.templates))||((conf.settings.templates.enabled.length)&&(!conf.settings.templates.enabled.includes(template))))
            throw new Error("unsupported template")
          const {image, style, fonts} = conf.templates[template]
          const queries = conf.queries
          const data = {base:{}, config:{}, errors:[], plugins:{}, computed:{}}

        //Base parts
          {
            const defaulted = ("base" in q) ? !!q.base : true
            for (const part of conf.settings.plugins.base.parts)
              data.base[part] = `base.${part}` in q ? !!q[ `base.${part}`] : defaulted
          }

        //Placeholder
          if (login === "placeholder")
            placeholder({data, conf, q})
        //Compute
          else {
            //Query data from GitHub API
              console.debug(`metrics/compute/${login} > graphql query`)
              Object.assign(data, await graphql(queries.common({login, "calendar.from":new Date(Date.now()-14*24*60*60*1000).toISOString(), "calendar.to":(new Date()).toISOString()})))
            //Query repositories from GitHub API
              {
                //Iterate through repositories
                  let cursor = null
                  let pushed = 0
                  do {
                    console.debug(`metrics/compute/${login} > retrieving repositories after ${cursor}`)
                    const {user:{repositories:{edges, nodes}}} = await graphql(queries.repositories({login, after:cursor ? `after: "${cursor}"` : "", repositories:Math.min(repositories, 100)}))
                    cursor = edges?.[edges?.length-1]?.cursor
                    data.user.repositories.nodes.push(...nodes)
                    pushed = nodes.length
                  } while ((pushed)&&(cursor)&&(data.user.repositories.nodes.length < repositories))
                //Limit repositories
                  console.debug(`metrics/compute/${login} > keeping only ${repositories} repositories`)
                  data.user.repositories.nodes.splice(repositories)
                  console.debug(`metrics/compute/${login} > loaded ${data.user.repositories.nodes.length} repositories`)
              }
            //Compute metrics
              console.debug(`metrics/compute/${login} > compute`)
              const computer = Templates[template].default || Templates[template]
              await computer({login, q, dflags}, {conf, data, rest, graphql, plugins, queries}, {s, pending, imports:{plugins:Plugins, url, imgb64, axios, puppeteer, run, fs, os, paths, util, format, bytes, shuffle, htmlescape, urlexpand}})
              const promised = await Promise.all(pending)

            //Check plugins errors
              {
                const errors = [...promised.filter(({result = null}) => result?.error), ...data.errors]
                if (errors.length) {
                  console.warn(`metrics/compute/${login} > ${errors.length} errors !`)
                  if (die)
                    throw new Error(`An error occured during rendering, dying`)
                  else
                    console.warn(util.inspect(errors, {depth:Infinity, maxStringLength:256}))
                }
              }
          }

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

        //Verify svg
          if (verify) {
            console.debug(`metrics/compute/${login} > verify SVG`)
            const libxmljs = (await import("libxmljs")).default
            const parsed = libxmljs.parseXml(rendered)
            if (parsed.errors.length)
              throw new Error(`Malformed SVG : \n${parsed.errors.join("\n")}`)
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

/** Bytes formatter */
  function bytes(n) {
    for (const {u, v} of [{u:"E", v:10**18}, {u:"P", v:10**15}, {u:"T", v:10**12}, {u:"G", v:10**9}, {u:"M", v:10**6}, {u:"k", v:10**3}])
      if (n/v >= 1)
        return `${(n/v).toFixed(2).substr(0, 4).replace(/[.]0*$/, "")} ${u}B`
    return `${n} byte${n > 1 ? "s" : ""}`
  }

/** Array shuffler */
  function shuffle(array) {
    for (let i = array.length-1; i > 0; i--) {
      const j = Math.floor(Math.random()*(i+1))
      ;[array[i], array[j]] = [array[j], array[i]]
    }
    return array
  }

/** Escape html */
  function htmlescape(string, u = {"&":true, "<":true, ">":true, '"':true, "'":true}) {
    return string
      .replace(/&(?!(?:amp|lt|gt|quot|apos);)/g, u["&"] ? "&amp;" : "&")
      .replace(/</g, u["<"] ? "&lt;" : "<")
      .replace(/>/g, u[">"] ? "&gt;" : ">")
      .replace(/"/g, u['"'] ? "&quot;" : '"')
      .replace(/'/g, u["'"] ? "&apos;" : "'")
  }

/** Expand url */
  async function urlexpand(url) {
    try {
      return (await axios.get(url)).request.res.responseUrl
    } catch {
      return url
    }
  }

/** Run command */
  async function run(command, options) {
    return await new Promise((solve, reject) => {
      console.debug(`metrics/command > ${command}`)
      const child = processes.exec(command, options)
      let [stdout, stderr] = ["", ""]
      child.stdout.on("data", data => stdout += data)
      child.stderr.on("data", data => stderr += data)
      child.on("close", code => {
        console.debug(`metrics/command > ${command} > exited with code ${code}`)
        return code === 0 ? solve(stdout) : reject(stderr)
      })
    })
  }

/** Placeholder generator */
  function placeholder({data, conf, q}) {
    //Proxifier
      const proxify = (target) => (typeof target === "object")&&(target) ? new Proxy(target, {
        get(target, property) {
          //Primitive conversion
            if (property === Symbol.toPrimitive)
              return () => "##"
          //Iterables
            if (property === Symbol.iterator)
              return Reflect.get(target, property)
          //Plugins should not be proxified by default as they can be toggled by user
            if (/^plugins$/.test(property))
              return Reflect.get(target, property)
          //Consider no errors on plugins
            if (/^error/.test(property))
              return undefined
          //Proxify recursively
          return proxify(property in target ? Reflect.get(target, property) : {})
        }
      }) : target
    //Enabled plugins
      const enabled = Object.entries(conf.settings.plugins).filter(([key, plugin]) => plugin.enabled).map(([key]) => key).filter(key => (key in q)&&(q[key]))
    //Placeholder data
      Object.assign(data, {
        s(_, letter) { return letter === "y" ? "ies" : "s" },
        meta:{version:conf.package.version, author:conf.package.author, placeholder:true},
        user:proxify({name:`############`, websiteUrl:`########################`, isHireable:false}),
        computed:proxify({
          avatar:"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mOcOnfpfwAGfgLYttYINwAAAABJRU5ErkJggg==",
          registration:"## years ago",
          cakeday:false,
          calendar:new Array(14).fill({color:"#ebedf0"}),
          licenses:{favorite:`########`},
          token:{scopes:[]},
        }),
        plugins:Object.fromEntries(enabled.map(key =>
          [key, proxify({
            posts:{source:"########", list:new Array("posts.limit" in q ? Math.max(Number(q["posts.limit"])||0, 0) : 2).fill({title:"###### ###### ####### ######", date:"####"})},
            music:{provider:"########", tracks:new Array("music.limit" in q ? Math.max(Number(q["music.limit"])||0, 0) : 4).fill({name:"##########", artist:"######", artwork:"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mOcOnfpfwAGfgLYttYINwAAAABJRU5ErkJggg=="})},
            pagespeed:{detailed:!!q["pagespeed.detailed"], screenshot:!!q["pagespeed.screenshot"] ? "data:image/jpg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mOcOnfpfwAGfgLYttYINwAAAABJRU5ErkJggg==" : null,  scores:["Performance", "Accessibility", "Best Practices", "SEO"].map(title => ({title, score:NaN}))},
            followup:{issues:{count:0}, pr:{count:0}},
            habits:{facts:!!(q["habits.facts"] ?? 1), charts:!!q["habits.charts"], indents:{style:`########`}, commits:{day:"####"}, linguist:{ordered:[]}},
            languages:{favorites:new Array(7).fill(null).map((_, x) => ({x, name:"######", color:"#ebedf0", value:1/(x+1)}))},
            topics:{mode:"topics.mode" in q ? q["topics.mode"] : "starred", list:[...new Array("topics.limit" in q ? Math.max(Number(q["topics.limit"])||0, 0) : 12).fill(null).map(() => ({name:"######", description:"", icon:null})), {name:`And ## more...`, description:"", icon:null}]},
            projects:{list:[...new Array("projects.limit" in q ? Math.max(Number(q["projects.limit"])||0, 0) : 4).fill(null).map(() => ({name:"########", updated:"########", progress:{enabled:true, todo:"##", doing:"##", done:"##", total:"##"}}))]},
            tweets:{profile:{username:"########", verified:false}, list:[...new Array("tweets.limit" in q ? Math.max(Number(q["tweets.limit"])||0, 0) : 2).fill(null).map(() => ({text:"###### ###### ####### ######".repeat(4), created_at:Date.now()}))]},
          }[key]??{})]
        )),
      })
  }