//Imports
import { Logger } from "@engine/utils/log.ts"
import { getBinary, launch } from "gh/lino-levan/astral@main/mod.ts" // TODO(@lowlighter): use x/astral when available
import { env } from "@engine/utils/io.ts"
import * as dir from "@engine/paths.ts"
import { throws } from "@engine/utils/errors.ts"

/** Browser */
export class Browser {
  /** Constructor */
  constructor({ log, endpoint = null, bin = env.get("CHROME_BIN") || undefined }: { log: Logger; endpoint?: null | string; bin?: string }) {
    this.endpoint = endpoint
    this.log = log
    this.bin = bin
    this.ready = this.open()
  }

  /** Is ready ? */
  readonly ready

  /** Logger */
  private readonly log

  /** Browser binary path */
  private readonly bin

  /** Remote browser endpoint */
  readonly endpoint

  /** Browser instance */
  #instance = null as null | Awaited<ReturnType<typeof launch>>

  /** Open browser instance */
  private async open() {
    if (this.endpoint) {
      this.#instance = await launch({ wsEndpoint: this.endpoint })
      this.log.io(`using remote browser: ${this.endpoint}`)
    } else {
      this.#instance = await launch({ args: Browser.flags, path: this.bin, cache: dir.cache })
      Object.assign(this, { endpoint: this.#instance.wsEndpoint() })
      this.log.io(`using local browser: ${this.endpoint}${this.bin ? ` (from ${this.bin})` : ""}}`)
    }
    return this
  }

  /** Close browser instance */
  async close() {
    if (this.#instance) {
      await this.#instance.close()
      this.#instance = null
      this.log.io("closed browser")
    }
  }

  /** Spawn a new page */
  async page({ url }: { width?: number; height?: number; url?: string } = {}) {
    await this.ready
    if (!this.#instance) {
      throws("Browser has no instance attached")
    }
    const page = await this.#instance.newPage(url)
    //TODO(@lowlighter): page.setViewport({ width, height })
    //page
    //  .on("console", (message: { text: () => string }) => log.debug(`puppeteer: ${message.text()}`))
    //  .on("pageerror", (error: { message: string }) => log.warn(`puppeteer: ${error.message}`))
    const close = page.close.bind(page)
    page.close = async () => {
      await close()
      this.log.io("closed browser page")
      if (!Browser.shareable) {
        await this.close()
      }
    }
    this.log.io("opened new browser page")
    return page
  }

  /** Shared browser instance */
  static readonly shared = null as null | Browser

  /** Should reuse static browser instance when possible? */
  static shareable = true

  /** Instantiates or reuse  */
  static async page({ log, bin }: { log: Logger; bin?: string }) {
    if ((Browser.shareable) && (!Browser.shared)) {
      Object.assign(Browser, { shared: await new Browser({ log: new Logger(import.meta, { level: "none" }), bin }).ready })
      const close = Browser.shared!.close.bind(Browser.shared)
      Browser.shared!.close = async () => {
        await close()
        Object.assign(Browser, { shared: null })
        log.io("closed shared browser instance")
      }
      log.io("opened shared browser instance")
    }
    const browser = await new Browser({ log, bin, endpoint: Browser.shared?.endpoint }).ready
    return browser.page()
  }

  /** Get binary path */
  static readonly getBinary = getBinary

  /** Browser flags */
  private static get flags() {
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
      ...env.get("CHROME_EXTRA_FLAGS").split(" "),
    ]
    return flags
  }
}
