import { Browser } from "@engine/utils/browser.ts"
import { dir, expect, MetricsError } from "@engine/utils/testing.ts"
import { Logger } from "@engine/utils/log.ts"
import { Format } from "@engine/utils/format.ts"

const log = new Logger(import.meta)
const cache = `${dir.cache}/browser.test`
const bin = await Browser.getBinary("chrome", { cache })
const permissions = {
  read: [cache],
  net: ["127.0.0.1", "localhost"],
  env: ["CHROME_EXTRA_FLAGS"],
  run: [bin],
}

Deno.test("Browser()", { permissions }, async (t) => {
  for (const mode of ["local", "remote"]) {
    await t.step(`${mode} connection`, async (t) => {
      const setup = async () => {
        const remote = (mode === "remote") ? await new Browser({ log, bin }).ready : null
        const browser = await new Browser({ log, endpoint: remote?.endpoint, bin }).ready
        const teardown = async () => {
          await browser.close()
          await remote?.close()
        }
        return { browser, teardown }
      }
      await t.step(".page()", async (t) => {
        await t.step("returns a new page", async () => {
          const { browser, teardown } = await setup()
          for (let i = 0; i < 2; i++) {
            const page = await browser.page()
            await page.goto(`data:text/html,${Format.html("")}`)
            await expect(page.evaluate("document.title")).to.eventually.equal("Metrics")
            await page.close()
          }
          await teardown()
        })
        await t.step("throws when browser is already closed", async () => {
          const { browser, teardown } = await setup()
          await browser.close()
          await expect(browser.page()).to.be.rejectedWith(MetricsError, /browser has no instance/i)
          await teardown()
        })
      })
    })
  }

  await t.step("shared instance", async (t) => {
    const { shareable } = Browser
    Browser.shareable = true
    await t.step(".page()", async (t) => {
      await t.step("returns a new page", async () => {
        for (let i = 0; i < 2; i++) {
          const page = await Browser.page({ log, bin })
          await page.goto(`data:text/html,${Format.html("")}`)
          await expect(page.evaluate("document.title")).to.eventually.equal("Metrics")
          await page.close()
        }
        await Browser.shared?.close()
        expect(Browser.shared).to.be.null
      })
      await t.step("returns a new page even after browser was already closed", async () => {
        await Browser.shared?.close()
        expect(Browser.shared).to.be.null
        const page = await Browser.page({ log, bin })
        await page.close()
        await Browser.shared?.close()
        expect(Browser.shared).to.be.null
      })
    })
    Browser.shareable = shareable
  })
})
