//Imports
import { Logger } from "@engine/utils/log.ts"
import { getBinary, launch } from "x/astral@0.3.2/mod.ts"
import { env } from "@engine/utils/deno/env.ts"
import * as dir from "@engine/paths.ts"
import { throws } from "@engine/utils/errors.ts"
import { delay } from "std/async/delay.ts"

/** Browser */
export class Browser {
  /** Constructor */
  constructor({ log, endpoint = null, bin = env.get("CHROME_BIN") }: { log: Logger; endpoint?: null | string; bin?: string }) {
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
      this.log.io(`using local browser: ${this.endpoint} (from ${this.bin})`)
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
  async page({ width, height, url }: { width?: number; height?: number; url?: string } = {}) {
    await this.ready
    if (!this.#instance) {
      throws("Browser has no instance attached")
    }
    const page = await this.#instance.newPage(url)
    if ((typeof width === "number") && (typeof height === "number")) {
      page.setViewportSize({ width, height })
    }
    const close = page.close.bind(page)
    const evaluate = page.evaluate.bind(page)
    Object.assign(page, {
      // Close page (and possibly browser)
      close: async () => {
        await close()
        this.log.io("closed browser page")
        if (!Browser.shareable) {
          await this.close()
        }
      },
      // Evaluate function
      evaluate: (async (func: Parameters<typeof evaluate>[0], options?: Parameters<typeof evaluate>[1]) => {
        try {
          if ((typeof func === "string") && (func.startsWith("dom://"))) {
            let caller = ""
            const { prepareStackTrace } = Error
            try {
              const error = new Error()
              Error.prepareStackTrace = (_, stack) => stack
              const stack = (error.stack as unknown as Array<{ getFileName(): string }>)
                .map((callsite) => callsite.getFileName())
                .filter((file) => file)
                .filter((file) => file !== import.meta.url)
                .filter((file) => !file.startsWith("ext:"))
              caller = stack[0]
            } finally {
              Object.assign(Error, { prepareStackTrace })
            }
            this.log.trace(`${func} was invoked from ${caller}`)
            const url = new URL(`dom/${func.replace("dom://", "")}`, caller).href
            this.log.trace(`importing: ${url}`)
            const { default: script } = await import(url)
            func = script
          }
          return await evaluate(func, options)
        } catch (error) {
          throws(error.text)
        }
      }) as typeof evaluate,
      // Set transparent background
      setTransparentBackground: async () => {
        const celestial = page.unsafelyGetCelestialBindings()
        await celestial.Emulation.setDefaultBackgroundColorOverride({ color: { r: 0, b: 0, g: 0, a: 0 } })
        await delay(100)
      },
    })
    this.log.io("opened new browser page")
    return page as typeof page & { setTransparentBackground: () => Promise<void> }
  }

  /** Shared browser instance */
  static readonly shared = null as null | Browser

  /** Should reuse static browser instance when possible? */
  static shareable = true

  /** Instantiates or reuse  */
  static async page({ log, bin, width, height }: { log: Logger; bin?: string; width?: number; height?: number }) {
    if ((Browser.shareable) && (!Browser.shared)) {
      Object.assign(Browser, { shared: await new Browser({ log: new Logger(import.meta, { level: "none" }), bin, endpoint: env.get("BROWSER_ENDPOINT") }).ready })
      const close = Browser.shared!.close.bind(Browser.shared)
      Browser.shared!.close = async () => {
        await close()
        Object.assign(Browser, { shared: null })
        log.io("closed shared browser instance")
      }
      log.io("opened shared browser instance")
    }
    const browser = await new Browser({ log, bin, endpoint: Browser.shared?.endpoint }).ready
    return browser.page({ width, height })
  }

  /** Get binary path */
  static getBinary(product: Parameters<typeof getBinary>[0]) {
    return getBinary(product, { cache: dir.cache })
  }

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
