//Imports
import { join } from "std/path/join.ts"
import { Logger } from "@utils/log.ts"
import { cwd, os, write } from "@utils/io.ts"
import puppeteer from "npm:puppeteer-core@21.3.6"
import { Browser as Browsers, computeExecutablePath, detectBrowserPlatform, install, resolveBuildId } from "npm:@puppeteer/browsers@1.7.1"
import { throws } from "@utils/errors.ts"
import { exists } from "std/fs/exists.ts"
import ProgressBar from "x/progress@v1.3.9/mod.ts"
import { delay } from "std/async/delay.ts"
//TODO(@lowlighter): connect to external web browser instead, only use puppeteer core

/** Browser */
export class Browser {
  /** Logger */
  static readonly log = new Logger(import.meta)

  /** Remote browser endpoint */
  static endpoint = null as string | null

  /** Browser instance */
  private static instance = null as null | Awaited<ReturnType<typeof puppeteer.launch>>

  /** Browser executable path */
  private static executable = ""

  /** Spawn browser instance */
  static async spawn() {
    if (!this.executable) {
      const browser = Browsers.CHROMIUM
      const platform = detectBrowserPlatform() ?? throws("unsupported platform for puppeteer")
      const version = await resolveBuildId(browser, platform, "latest")
      const cache = join(cwd(), "node_modules/.cache")
      this.executable = computeExecutablePath({ cacheDir: cache, browser, buildId: version })
      if (!await exists(this.executable)) {
        let progress: ProgressBar
        await install({
          cacheDir: cache,
          browser,
          buildId: version,
          downloadProgressCallback(bytes, total) {
            if (!progress) {
              progress = new ProgressBar({ total, complete: "=", incomplete: "-", clear: true })
            }
            progress.render(bytes)
          },
        })
      }
    }
    const args = {
      headless: "new" as unknown as boolean,
      args: ["--no-sandbox", "--disable-extensions", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
      handleSIGHUP: os !== "windows",
      executablePath: this.executable,
    }
    this.instance = await puppeteer.launch(args)
    this.log.io("started browser")
    if (!this.endpoint) {
      this.endpoint = this.instance.wsEndpoint()
    }
  }

  /** Close browser instance */
  static async close() {
    if (this.instance) {
      try {
        await Promise.allSettled([...await this.instance.pages()].map((page) => page.close()))
        await this.instance.close()
        await delay(1 * 1000)
        this.instance.process()?.kill("SIGINT")
      } catch (error) {
        this.log.warn(error)
      }
      this.instance = null
      this.log.io("closed browser")
    }
  }

  /** Connect to browser */
  private static async connect({ log = this.log } = {}) {
    if (this.instance) {
      return this.instance
    }
    if (this.endpoint) {
      this.instance = await puppeteer.connect({ browserWSEndpoint: this.endpoint })
      log.io("connected to browser")
    } else {
      await this.spawn()
    }
    Object.assign(this, { log: log.with({ browser: await this.instance!.version() }) })
  }

  /** Spawn a new page */
  static async newPage({ width = 1000, height = 1000 } = {}) {
    const log = this.log.with({ uuid: crypto.randomUUID().slice(-12) })
    await this.connect({ log })
    const page = await this.instance!.newPage()
    page.setViewport({ width, height })
    page
      .on("console", (message: { text: () => string }) => log.debug(`puppeteer: ${message.text()}`))
      .on("pageerror", (error: { message: string }) => log.warn(`puppeteer: ${error.message}`))
    const close = page.close.bind(page)
    page.close = async () => {
      await close()
      log.io("closed browser page")
    }
    log.io("opened browser page")
    return page
  }
}

// Entry point
if (import.meta.main) {
  await Browser.spawn()
  await write(".test/browser", Browser.endpoint!)
  for (const signal of ["SIGINT", "SIGBREAK"] as const) {
    globalThis?.Deno.addSignalListener(signal, async () => {
      await Browser.close()
      Deno.exit(0)
    })
  }
}
