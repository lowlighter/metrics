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
  import twemojis from "twemoji-parser"
  import jimp from "jimp"

//Exports
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
        console.debug(stdout)
        console.debug(stderr)
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

/**SVG utils */
  export const svg = {
    /**Render and resize svg */
      async resize(rendered, {paddings, convert}) {
        //Instantiate browser if needed
          if (!svg.resize.browser) {
            svg.resize.browser = await puppeteer.launch({headless:true, executablePath:process.env.PUPPETEER_BROWSER_PATH, args:["--no-sandbox", "--disable-extensions", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]})
            console.debug(`metrics/svg/resize > started ${await svg.resize.browser.version()}`)
          }
        //Format padding
          const [pw = 1, ph] = (Array.isArray(paddings) ? paddings : `${paddings}`.split(",").map(x => x.trim())).map(padding => `${padding}`.substring(0, padding.length-1)).map(value => 1+Number(value)/100)
          const padding = {width:pw, height:ph ?? pw}
          console.debug(`metrics/svg/resize > padding width*${padding.width}, height*${padding.height}`)
        //Render through browser and resize height
          const page = await svg.resize.browser.newPage()
          await page.setContent(rendered, {waitUntil:["load", "domcontentloaded", "networkidle2"]})
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
            console.debug(`metrics/svg/resize > convert to ${convert}`)
            resized = await page.screenshot({type:convert, clip:{x:0, y:0, width, height}, omitBackground:true})
            mime = `image/${convert}`
          }
        //Result
          await page.close()
          return {resized, mime}
      },
    /**Render twemojis */
      async twemojis(rendered) {
        //Load emojis
          const emojis = new Map()
          for (const {text:emoji, url} of twemojis.parse(rendered)) {
            if (!emojis.has(emoji))
              emojis.set(emoji, (await axios.get(url)).data.replace(/^<svg /, '<svg class="twemoji" '))
          }
        //Apply replacements
          for (const [emoji, twemoji] of emojis)
            rendered = rendered.replace(new RegExp(emoji, "g"), twemoji)
        return rendered
      },
  }

/**Wait */
  export async function wait(seconds) {
    await new Promise(solve => setTimeout(solve, seconds*1000)) //eslint-disable-line no-promise-executor-return
  }

/**Create gif from puppeteer browser */
  export async function record({page, width, height, frames, scale = 1, quality = 80, x = 0, y = 0, delay = 150}) {
    //Register images frames
      const images = []
      for (let i = 0; i < frames; i++) {
        images.push(await page.screenshot({type:"png", clip:{width, height, x, y}}))
        await wait(delay/1000)
        if (i%10 === 0)
          console.debug(`metrics/record > processed ${i}/${frames} frames`)
      }
      console.debug(`metrics/record > processed ${frames}/${frames} frames`)
    //Post-processing
      console.debug("metrics/record > applying post-processing")
      return Promise.all(images.map(async buffer => (await jimp.read(buffer)).scale(scale).quality(quality).getBase64Async("image/png")))
  }