//Imports
import { join } from "std/path/join.ts"
import { Logger } from "@utils/log.ts"
import { cwd, env, os } from "@utils/io.ts"
import type puppeteer from "npm:puppeteer@21.2.1"

//TODO(@lowlighter): connect to external web browser instead, only use puppeteer core

/** Browser */
export class Browser {
  /** Logger */
  private static readonly log = new Logger(import.meta)

  /** Shared browser mode */
  static shared = true

  /** Browser instance */
  private static instance = null as null | Awaited<ReturnType<typeof puppeteer.launch>>

  /** Puppeteer library */
  private static puppeteer: typeof puppeteer

  /** Get browser */
  private static async get({ log = this.log } = {}) {
    if ((this.shared) && (this.instance)) {
      return this.instance
    }
    if (!this.puppeteer) {
      env.set("PUPPETEER_CACHE_DIR", join(cwd(), "node_modules/.cache"))
      await import("x/puppeteer_plus@0.18.0/src/patch.ts")
      await import("x/puppeteer_plus@0.18.0/src/install.ts")
      const { default: imported } = await import("npm:puppeteer@21.2.1")
      this.puppeteer = imported
    }
    const args = {
      headless: "new" as unknown as boolean,
      args: ["--no-sandbox", "--disable-extensions", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
      handleSIGHUP: os !== "windows",
    }
    const browser = await this.puppeteer.launch(args)
    log.io("browser started")
    if (this.shared) {
      this.instance = browser
      Object.assign(this, { log: log.with({ browser: await this.instance!.version() }) })
    }
    return browser
  }

  /** Spawn a new page */
  static async newPage({ width = 1000, height = 1000 } = {}) {
    const log = this.log.with({ uuid: crypto.randomUUID().slice(-12) })
    const browser = await this.get({ log })
    const page = await browser.newPage()
    page.setViewport({ width, height })
    page
      .on("console", (message: { text: () => string }) => log.debug(`puppeteer: ${message.text()}`))
      .on("pageerror", (error: { message: string }) => log.warn(`puppeteer: ${error.message}`))
    if (!this.shared) {
      page.close = async () => {
        await browser.close()
        log.io("browser closed")
      }
    }
    return page
  }
}
