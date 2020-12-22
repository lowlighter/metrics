//Imports
  import ejs from "ejs"
  import SVGO from "svgo"
  import imgb64 from "image-to-base64"
  import axios from "axios"
  import Plugins from "./plugins/index.mjs"
  import Templates from "./templates/index.mjs"
  import puppeteer from "puppeteer"
  import url from "url"
  import processes from "child_process"
  import fs from "fs/promises"
  import os from "os"
  import paths from "path"

//Setup
  export default async function metrics({login, q, dflags = []}, {graphql, rest, plugins, conf, die = false}) {
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
          const data = {base:{}}

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
              Object.assign(data, await graphql(query
                .replace(/[$]login/, `"${login}"`)
                .replace(/[$]repositories/, `${repositories}`)
                .replace(/[$]calendar.to/, `"${(new Date()).toISOString()}"`)
                .replace(/[$]calendar.from/, `"${(new Date(Date.now()-14*24*60*60*1000)).toISOString()}"`)
              ))

            //Compute metrics
              console.debug(`metrics/compute/${login} > compute`)
              const computer = Templates[template].default || Templates[template]
              await computer({login, q, dflags}, {conf, data, rest, graphql, plugins}, {s, pending, imports:{plugins:Plugins, url, imgb64, axios, puppeteer, run, fs, os, paths, format, bytes, shuffle, htmlescape, urlexpand}})
              const promised = await Promise.all(pending)

            //Check plugins errors
              if (conf.settings.debug)
                for (const {name, result = null} of promised)
                  console.debug(`plugin ${name} ${result ? result.error ? "failed" : "success" : "ignored"} : ${JSON.stringify(result).replace(/^(.{888}).+/, "$1...")}`)
              if (die) {
                const errors = promised.filter(({result = null}) => !!result?.error).length
                if (errors)
                  throw new Error(`${errors} error${s(errors)} found...`)
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
      const proxify = (target) => typeof target === "object" ? new Proxy(target, {
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
            pagespeed:{detailed:!!q["pagespeed.detailed"], scores:["Performance", "Accessibility", "Best Practices", "SEO"].map(title => ({title, score:NaN}))},
            followup:{issues:{count:0}, pr:{count:0}},
            habits:{facts:!!(q["habits.facts"] ?? 1), charts:!!q["habits.charts"], indents:{style:`########`}, commits:{day:"####"}, linguist:{ordered:[]}},
            languages:{favorites:new Array(7).fill(null).map((_, x) => ({x, name:"######", color:"#ebedf0", value:1/(x+1)}))},
            topics:{list:[...new Array("topics.limit" in q ? Math.max(Number(q["topics.limit"])||0, 0) : 12).fill(null).map(() => ({name:"######", description:"", icon:null})), {name:`And ## more...`, description:"", icon:null}]},
            projects:{list:[...new Array("projects.limit" in q ? Math.max(Number(q["projects.limit"])||0, 0) : 4).fill(null).map(() => ({name:"########", updated:"########", progress:{enabled:true, todo:"##", doing:"##", done:"##", total:"##"}}))]},
            tweets:{profile:{username:"########", verified:false}, list:[...new Array("tweets.limit" in q ? Math.max(Number(q["tweets.limit"])||0, 0) : 2).fill(null).map(() => ({text:"###### ###### ####### ######".repeat(4), created_at:Date.now()}))]},
          }[key]??{})]
        )),
      })
  }