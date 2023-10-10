//Imports
import { Logger } from "@utils/log.ts"
import * as astral from "x/astral@0.2.6/mod.ts"
import { env } from "@utils/io.ts"

const flags = [
  //"--no-sandbox",
  "--disable-dev-shm-usage",
  "--disable-software-rasterizer",
  "--disable-extensions",
  "--disable-gpu",
  "--disable-audio-input",
  "--disable-audio-output",
  "--disable-auto-reload",
  "--disable-file-system",
  "--disable-local-storage",
  "--disable-dinosaur-easter-egg",
  "--hide-scrollbars",
  "--incognito",
  "--window-size=1000,1000",
]

/** Browser */
export class Browser {
  /** Logger */
  static readonly log = new Logger(import.meta)

  /** Remote browser endpoint */
  static endpoint = null as string | null

  /** Browser instance */
  private static instance = null as null | Awaited<ReturnType<typeof astral.launch>>

  /** Is browser shared ? */
  static shared = false

  /** Close browser instance */
  static async close() {
    if (this.instance) {
      try {
        await this.instance.close()
      } catch (error) {
        this.log.warn(error)
      }
      this.instance = null
      this.log.io("closed browser")
    }
  }

  /** Connect to browser */
  private static async connect({ log = this.log } = {}) {
    if ((this.shared) && (this.instance)) {
      return this.instance
    }

    let instance
    if ((this.shared) && (this.endpoint)) {
      //TODO(@lowlighter): this.instance = await puppeteer.connect({ browserWSEndpoint: this.endpoint })
      log.io("connected to browser")
    } else {
      instance = await astral.launch({ headless: true, args: flags, path: env.get("CHROME_BIN") || undefined })
      log.io("started browser")
    }
    if ((this.shared) && (!this.instance)) {
      this.instance = instance!
    }
    if ((this.shared) && (!this.endpoint)) {
      this.endpoint = this.instance!.wsEndpoint()
    }
    return instance!
  }

  /** Spawn a new page */
  static async newPage({ width: _ = 1000, height: __ = 1000 } = {}) {
    const log = this.log.with({ uuid: crypto.randomUUID().slice(-12) })
    const instance = await this.connect({ log })
    const page = await instance.newPage()
    //TODO(@lowlighter): page.setViewport({ width, height })
    //page
    //  .on("console", (message: { text: () => string }) => log.debug(`puppeteer: ${message.text()}`))
    //  .on("pageerror", (error: { message: string }) => log.warn(`puppeteer: ${error.message}`))
    const close = page.close.bind(page)
    page.close = async () => {
      await close()
      log.io("closed browser page")
      if (!this.shared) {
        await instance.close()
      }
    }
    log.io("opened browser page")
    return page
  }
}
