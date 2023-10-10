//Imports
import { Logger } from "@utils/log.ts"
import * as astral from "x/astral@0.2.6/mod.ts"
import { env } from "@utils/io.ts"

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
      const path = env.get("CHROME_BIN") || undefined
      instance = await astral.launch({ headless: true, args: this.flags(), path })
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

  /** Browser flags */
  private static flags() {
    const flags = [
      "--disable-audio-input",
      "--disable-audio-output",
      "--disable-auto-reload",
      "--disable-breakpad",
      "--disable-component-extensions-with-background-pages",
      "--disable-component-update",
      "--disable-default-apps",
      "--disable-dinosaur-easter-egg",
      "--disable-extensions",
      "--disable-file-system",
      "--disable-gpu",
      "--disable-input-event-activation-protection",
      "--disable-ios-password-suggestions",
      "--disable-lazy-loading",
      "--disable-local-storage",
      "--disable-notifications",
      "--disable-pdf-tagging",
      "--disable-permissions-api",
      "--disable-plugins",
      "--disable-plugins-discovery",
      "--disable-presentation-api",
      "--disable-prompt-on-repost",
      "--disable-shared-workers",
      "--disable-software-rasterizer",
      "--disable-speech-api",
      "--disable-speech-synthesis-api",
      "--disable-stack-profiler",
      "--disable-sync",
      "--disable-touch-drag-drop",
      "--disable-translate",
      "--hide-scrollbars",
      "--incognito",
      "--no-experiments",
      "--no-pings",
      "--no-referrers",
      "--window-size=1000,1000",
    ]
    if (env.get("IS_DOCKER")) {
      flags.push("--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage")
    }
    return flags
  }
}
