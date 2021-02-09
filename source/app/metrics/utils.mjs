//Imports
  import fs from "fs/promises"
  import os from "os"
  import paths from "path"
  import url from "url"
  import util from "util"
  import processes from "child_process"
  import axios from "axios"
  import puppeteer from "puppeteer"
  import imgb64 from "image-to-base64"
  import git from "simple-git"

  export {fs, os, paths, url, util, processes, axios, puppeteer, imgb64, git}

/**Returns module __dirname */
  export function __module(module) {
    return paths.join(paths.dirname(url.fileURLToPath(module)))
  }

/**Plural formatter */
  export function s(value, end = "") {
    return value !== 1 ? {y:"ies", "":"s"}[end] : end
  }

/**Formatter */
  export function format(n, {sign = false} = {}) {
    for (const {u, v} of [{u:"b", v:10**9}, {u:"m", v:10**6}, {u:"k", v:10**3}]) {
      if (n/v >= 1)
        return `${(sign)&&(n > 0) ? "+" : ""}${(n/v).toFixed(2).substr(0, 4).replace(/[.]0*$/, "")}${u}`
    }
    return `${(sign)&&(n > 0) ? "+" : ""}${n}`
  }

/**Bytes formatter */
  export function bytes(n) {
    for (const {u, v} of [{u:"E", v:10**18}, {u:"P", v:10**15}, {u:"T", v:10**12}, {u:"G", v:10**9}, {u:"M", v:10**6}, {u:"k", v:10**3}]) {
      if (n/v >= 1)
        return `${(n/v).toFixed(2).substr(0, 4).replace(/[.]0*$/, "")} ${u}B`
    }
    return `${n} byte${n > 1 ? "s" : ""}`
  }
  format.bytes = bytes

/**Percentage formatter */
  export function percentage(n, {rescale = true} = {}) {
    return `${(n*(rescale ? 100 : 1)).toFixed(2)
      .replace(/(?<=[.])(?<decimal>[1-9]*)0+$/, "$<decimal>")
      .replace(/[.]$/, "")}%`
  }
  format.percentage = percentage

/**Text ellipsis formatter */
  export function ellipsis(text, {length = 20} = {}) {
    text = `${text}`
    if (text.length < length)
      return text
    return `${text.substring(0, length)}…`
  }
  format.ellipsis = ellipsis

/**Date formatter */
  export function date(string, options) {
    return new Intl.DateTimeFormat("en-GB", options).format(new Date(string))
  }
  format.date = date

/**Array shuffler */
  export function shuffle(array) {
    for (let i = array.length-1; i > 0; i--) {
      const j = Math.floor(Math.random()*(i+1))
      ;[array[i], array[j]] = [array[j], array[i]]
    }
    return array
  }

/**Escape html */
  export function htmlescape(string, u = {"&":true, "<":true, ">":true, '"':true, "'":true}) {
    return string
      .replace(/&(?!(?:amp|lt|gt|quot|apos);)/g, u["&"] ? "&amp;" : "&")
      .replace(/</g, u["<"] ? "&lt;" : "<")
      .replace(/>/g, u[">"] ? "&gt;" : ">")
      .replace(/"/g, u['"'] ? "&quot;" : '"')
      .replace(/'/g, u["'"] ? "&apos;" : "'")
  }

/**Expand url */
  export async function urlexpand(url) {
    try {
      return (await axios.get(url)).request.res.responseUrl
    }
    catch {
      return url
    }
  }

/**Run command */
  export async function run(command, options, {prefixed = true} = {}) {
    const prefix = {win32:"wsl"}[process.platform] ?? ""
    command = `${prefixed ? prefix : ""} ${command}`.trim()
    return new Promise((solve, reject) => {
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

/**Check command existance */
  export async function which(command) {
    try {
      console.debug(`metrics/command > checking existence of ${command}`)
      await run(`which ${command}`)
      return true
    }
    catch {
      console.debug(`metrics/command > checking existence of ${command} > failed`)
    }
    return false
  }

/**Render svg */
  export async function svgresize(svg, {paddings, convert}) {
    //Instantiate browser if needed
      if (!svgresize.browser) {
        svgresize.browser = await puppeteer.launch({headless:true, executablePath:process.env.PUPPETEER_BROWSER_PATH, args:["--no-sandbox", "--disable-extensions", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]})
        console.debug(`metrics/svgresize > started ${await svgresize.browser.version()}`)
      }
    //Format padding
      const [pw = 1, ph] = (Array.isArray(paddings) ? paddings : `${paddings}`.split(",").map(x => x.trim())).map(padding => `${padding}`.substring(0, padding.length-1)).map(value => 1+Number(value)/100)
      const padding = {width:pw, height:ph ?? pw}
      console.debug(`metrics/svgresize > padding width*${padding.width}, height*${padding.height}`)
    //Render through browser and resize height
      const page = await svgresize.browser.newPage()
      await page.setContent(svg, {waitUntil:["load", "domcontentloaded", "networkidle2"]})
      await page.addStyleTag({content:"body { margin: 0; padding: 0; }"})
      await wait(1)
      let mime = "image/svg+xml"
      let {resized, width, height} = await page.evaluate(async padding => {
        //Disable animations
          const animated = !document.querySelector("svg").classList.contains("no-animations")
          if (animated)
            document.querySelector("svg").classList.add("no-animations")
        //Get bounds and resize
          let {y:height, width} = document.querySelector("svg #metrics-end").getBoundingClientRect()
          height = Math.ceil(height*padding.height)
          width = Math.ceil(width*padding.width)
        //Resize svg
          document.querySelector("svg").setAttribute("height", height)
        //Enable animations
          if (animated)
            document.querySelector("svg").classList.remove("no-animations")
        //Result
          return {resized:new XMLSerializer().serializeToString(document.querySelector("svg")), height, width}
      }, padding)
    //Convert if required
      if (convert) {
        console.debug(`metrics/svgresize > convert to ${convert}`)
        resized = await page.screenshot({type:convert, clip:{x:0, y:0, width, height}, omitBackground:true})
        mime = `image/${convert}`
      }
    //Result
      await page.close()
      return {resized, mime}
  }

/**Wait */
  export async function wait(seconds) {
    await new Promise(solve => setTimeout(solve, seconds*1000)) //eslint-disable-line no-promise-executor-return
  }
