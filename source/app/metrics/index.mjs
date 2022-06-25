//Imports
import ejs from "ejs"
import util from "util"
import * as utils from "./utils.mjs"

//Setup
export default async function metrics({login, q}, {graphql, rest, plugins, conf, die = false, verify = false, convert = null, callbacks = null}, {Plugins, Templates}) {
  //Compute rendering
  try {
    //Debug
    login = login.replace(/[\n\r]/g, "")
    console.debug(`metrics/compute/${login} > start`)
    console.debug(util.inspect(q, {depth: Infinity, maxStringLength: 256}))

    //Load template
    const template = q.template || conf.settings.templates.default
    if ((!(template in Templates)) || (!(template in conf.templates)) || ((conf.settings.templates.enabled.length) && (!conf.settings.templates.enabled.includes(template))))
      throw new Error("unsupported template")
    const {image, style, fonts, views, partials} = conf.templates[template]
    const computer = Templates[template].default || Templates[template]
    convert = convert ?? conf.metadata.templates[template]?.formats?.[0] ?? null
    console.debug(`metrics/compute/${login} > output format set to ${convert}`)

    //Initialization
    const pending = []
    const {queries} = conf
    const extras = {css: (conf.settings.extras?.css ?? conf.settings.extras?.default) ? q["extras.css"] ?? "" : "", js: (conf.settings.extras?.js ?? conf.settings.extras?.default) ? q["extras.js"] ?? "" : ""}
    const data = {q, animated: true, large: false, base: {}, config: {}, errors: [], plugins: {}, computed: {}, extras, postscripts: []}
    const imports = {
      plugins: Plugins,
      templates: Templates,
      metadata: conf.metadata,
      ...utils,
      ...utils.formatters({timeZone: q["config.timezone"]}),
      ...(/markdown/.test(convert)
        ? {
          imgb64(url, options) {
            return options?.force ? utils.imgb64(...arguments) : url
          },
        }
        : null),
    }
    const experimental = new Set(decodeURIComponent(q["experimental.features"] ?? "").split(" ").map(x => x.trim().toLocaleLowerCase()).filter(x => x))
    if (conf.settings["debug.headless"])
      imports.puppeteer.headless = false

    //Metrics insights
    if (convert === "insights")
      return metrics.insights.output({login, imports, conf}, {graphql, rest, Plugins, Templates})

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
    await Plugins.base({login, q, data, rest, graphql, plugins, queries, pending, imports, callbacks}, conf)
    await computer({login, q}, {conf, data, rest, graphql, plugins, queries, account: data.account, convert, template, callbacks}, {pending, imports})
    const promised = await Promise.all(pending)

    //Check plugins errors
    const errors = [...promised.filter(({result = null}) => result?.error), ...data.errors]
    if (errors.length) {
      console.debug(`metrics/compute/${login} > ${errors.length} errors !`)
      if (die)
        throw new Error("An error occured during rendering, dying")
      else
        console.debug(util.inspect(errors, {depth: Infinity, maxStringLength: 256}))
    }

    //JSON output
    if (convert === "json") {
      console.debug(`metrics/compute/${login} > json output`)
      const cache = new WeakSet()
      const rendered = JSON.parse(JSON.stringify(data, (key, value) => {
        if ((value instanceof Set) || (Array.isArray(value)))
          return [...value]
        if (value instanceof Map)
          return Object.fromEntries(value)
        if ((typeof value === "object") && (value)) {
          if (cache.has(value))
            return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, cache.has(v) ? "[Circular]" : v]))
          cache.add(value)
        }
        return value
      }))
      return {rendered, mime: "application/json", errors}
    }

    //Markdown output
    if (/markdown/.test(convert)) {
      //Retrieving template source
      console.debug(`metrics/compute/${login} > markdown render`)
      let source = image
      try {
        let template = `${q.markdown}`.replace(/\n/g, "")
        if (!/^https:/.test(template)) {
          const {data: {default_branch: branch, full_name: repo}} = await rest.repos.get({owner: login, repo: q.repo || login})
          console.debug(`metrics/compute/${login} > on ${repo} with default branch ${branch}`)
          template = `https://raw.githubusercontent.com/${repo}/${branch}/${template}`
        }
        console.debug(`metrics/compute/${login} > fetching ${template}`)
        ;({data: source} = await imports.axios.get(template, {headers: {Accept: "text/plain"}}))
      }
      catch (error) {
        console.debug(error)
      }
      //Embed method
      const _q = q
      const embed = async (name, q = {}) => {
        //Check arguments
        console.debug(`metrics/compute/${login}/embed > ${name} >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>`)
        if ((!name) || (typeof q !== "object") || (q === null)) {
          if (die)
            throw new Error("An error occured during embed rendering, dying")
          return "<p>⚠️ Failed to execute embed function: invalid arguments</p>"
        }
        console.debug(`metrics/compute/${login} > embed called with`)
        console.debug(q)
        let {base} = q
        q = {..._q, ...Object.fromEntries(Object.keys(Plugins).map(key => [key, false])), ...Object.fromEntries(conf.settings.plugins.base.parts.map(part => [`base.${part}`, false])), template: q.repo ? "repository" : "classic", ...q}
        //Translate action syntax to web syntax
        let parts = []
        if (base === true)
          q = {...q, ...Object.fromEntries(Object.entries(_q).filter(([key]) => /^base[.]?/.test(key)))}
        if (typeof base === "string")
          parts = base.split(",").map(x => x.trim())
        if (Array.isArray(base))
          parts = base
        for (const part of parts)
          q[`base.${part}`] = true
        if (convert === "markdown-pdf") {
          q["config.animations"] = false
          q.config_animations = false
        }
        q = Object.fromEntries([...Object.entries(q).map(([key, value]) => [key.replace(/^plugin_/, "").replace(/_/g, "."), value]), ["base", false]])
        //Compute rendering
        const {rendered} = await metrics({login, q}, {...arguments[1], convert: ["svg", "png", "jpeg"].includes(q["config.output"]) ? q["config.output"] : null}, arguments[2])
        console.debug(`metrics/compute/${login}/embed > ${name} > success >>>>>>>>>>>>>>>>>>>>>>`)
        return `<img class="metrics-cachable" data-name="${name}" src="data:image/${{png: "png", jpeg: "jpeg"}[q["config.output"]] ?? "svg+xml"};base64,${Buffer.from(rendered).toString("base64")}">`
      }
      //Rendering template source
      let rendered = source.replace(/\{\{ (?<content>[\s\S]*?) \}\}/g, "{%= $<content> %}")
      console.debug(rendered)
      for (const delimiters of [{openDelimiter: "<", closeDelimiter: ">"}, {openDelimiter: "{", closeDelimiter: "}"}])
        rendered = await ejs.render(rendered, {...data, s: imports.s, f: imports.format, embed}, {views, async: true, ...delimiters})
      console.debug(`metrics/compute/${login} > success`)
      //Output
      if (convert === "markdown-pdf") {
        return imports.svg.pdf(rendered, {
          paddings: q["config.padding"] || conf.settings.padding,
          style: extras.css,
          twemojis: q["config.twemoji"],
          gemojis: q["config.gemoji"],
          octicons: q["config.octicon"],
          rest,
          errors,
        })
      }
      return {rendered, mime: "text/html", errors}
    }

    //Rendering
    console.debug(`metrics/compute/${login} > render`)
    let rendered = await ejs.render(image, {...data, s: imports.s, f: imports.format, style, fonts}, {views, async: true})

    //Additional transformations
    if (q["config.twemoji"])
      rendered = await imports.svg.twemojis(rendered)
    if (q["config.gemoji"])
      rendered = await imports.svg.gemojis(rendered, {rest})
    if (q["config.octicon"])
      rendered = await imports.svg.octicons(rendered)
    //Optimize rendering
    if ((conf.settings?.optimize === true) || (conf.settings?.optimize?.includes?.("css")))
      rendered = await imports.svg.optimize.css(rendered)
    if ((conf.settings?.optimize === true) || (conf.settings?.optimize?.includes?.("xml")))
      rendered = await imports.svg.optimize.xml(rendered, q)
    if ((conf.settings?.optimize === true) || (conf.settings?.optimize?.includes?.("svg")))
      rendered = await imports.svg.optimize.svg(rendered, q, experimental)
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
    const {resized, mime} = await imports.svg.resize(rendered, {paddings: q["config.padding"] || conf.settings.padding, convert: convert === "svg" ? null : convert, scripts: [...data.postscripts, extras.js || null].filter(x => x)})
    rendered = resized

    //Result
    console.debug(`metrics/compute/${login} > success`)
    return {rendered, mime, errors}
  }
  //Internal error
  catch (error) {
    //User not found
    if (((Array.isArray(error.errors)) && (error.errors[0].type === "NOT_FOUND")))
      throw new Error("user not found")
    //Generic error
    throw error
  }
}

//Metrics insights
metrics.insights = async function({login}, {graphql, rest, conf, callbacks}, {Plugins, Templates}) {
  return metrics({login, q: metrics.insights.q}, {graphql, rest, plugins: metrics.insights.plugins, conf, callbacks, convert: "json"}, {Plugins, Templates})
}
metrics.insights.q = {
  template: "classic",
  achievements: true,
  "achievements.threshold": "X",
  isocalendar: true,
  "isocalendar.duration": "full-year",
  languages: true,
  "languages.limit": 0,
  activity: true,
  "activity.limit": 100,
  "activity.days": 0,
  "activity.timestamps": true,
  notable: true,
  "notable.repositories": true,
  followup: true,
  "followup.sections": "repositories, user",
  introduction: true,
  topics: true,
  "topics.mode": "icons",
  "topics.limit": 0,
  stars: true,
  "stars.limit": 6,
  reactions: true,
  "reactions.details": "percentage",
  repositories: true,
  "repositories.pinned": 6,
  sponsors: true,
  calendar: true,
  "calendar.limit": 0,
}
metrics.insights.plugins = {
  achievements: {enabled: true},
  isocalendar: {enabled: true},
  languages: {enabled: true, extras: false},
  activity: {enabled: true, markdown: "extended"},
  notable: {enabled: true},
  followup: {enabled: true},
  introduction: {enabled: true},
  topics: {enabled: true},
  stars: {enabled: true},
  reactions: {enabled: true},
  repositories: {enabled: true},
  sponsors: {enabled: true},
  calendar: {enabled: true},
}

//Metrics insights static render
metrics.insights.output = async function({login, imports, conf}, {graphql, rest, Plugins, Templates}) {
  //Server
  console.debug(`metrics/compute/${login} > insights`)
  const server = `http://localhost:${conf.settings.port}`
  console.debug(`metrics/compute/${login} > insights > server on port ${conf.settings.port}`)

  //Data processing
  const browser = await imports.puppeteer.launch()
  const page = await browser.newPage()
  console.debug(`metrics/compute/${login} > insights > generating data`)
  const result = await metrics.insights({login}, {graphql, rest, conf}, {Plugins, Templates})
  const json = JSON.stringify(result)
  await page.goto(`${server}/about/${login}?embed=1&localstorage=1`)
  await page.evaluate(async json => localStorage.setItem("local.metrics", json), json) //eslint-disable-line no-undef
  await page.goto(`${server}/about/${login}?embed=1&localstorage=1`)
  await page.waitForSelector(".container .user", {timeout: 10 * 60 * 1000})

  //Rendering
  console.debug(`metrics/compute/${login} > insights > rendering data`)
  const rendered = `
    <html>
      <head>
        <meta charset="utf-8">
        <title>Metrics insights: ${login}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body>
        ${await page.evaluate(() => document.querySelector("main").outerHTML)}
        ${(await Promise.all([".css/style.vars.css", ".css/style.css", "about/.statics/style.css"].map(path => utils.axios.get(`${server}/${path}`)))).map(({data: style}) => `<style>${style}</style>`).join("\n")}
      </body>
    </html>`
  await browser.close()
  return {mime: "text/html", rendered, errors: result.errors}
}
