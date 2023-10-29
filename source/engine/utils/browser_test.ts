/// <reference lib="dom" />
import { Browser } from "@engine/utils/browser.ts"
import { dir, expect, MetricsError, t } from "@engine/utils/testing.ts"
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

for (const mode of ["local", "remote"]) {
  const setup = async () => {
    const remote = (mode === "remote") ? await new Browser({ log, bin }).ready : null
    const browser = await new Browser({ log, endpoint: remote?.endpoint, bin }).ready
    const teardown = async () => {
      await browser.close()
      await remote?.close()
    }
    return { browser, teardown }
  }

  Deno.test(t(import.meta, `\`${mode} .page()\` returns a new page`), { permissions }, async () => {
    const { browser, teardown } = await setup()
    for (let i = 0; i < 2; i++) {
      const page = await browser.page()
      await page.goto(`data:text/html,${Format.html("")}`)
      await expect(page.evaluate("document.title")).to.eventually.equal("Metrics")
      await page.close()
    }
    await teardown()
  })

  Deno.test(t(import.meta, `\`${mode} .page()\` throws when browser is already closed`), { permissions }, async () => {
    const { browser, teardown } = await setup()
    await browser.close()
    await expect(browser.page()).to.be.rejectedWith(MetricsError, /browser has no instance/i)
    await teardown()
  })
}

Deno.test(t(import.meta, "`shared .page()` returns a new page"), { permissions }, async () => {
  const { shareable } = Browser
  Browser.shareable = true
  for (let i = 0; i < 2; i++) {
    const page = await Browser.page({ log, bin })
    await page.goto(`data:text/html,${Format.html("")}`)
    await expect(page.evaluate("document.title")).to.eventually.equal("Metrics")
    await page.close()
  }
  await Browser.shared?.close()
  expect(Browser.shared).to.be.null
  Browser.shareable = shareable
})

Deno.test(t(import.meta, "`shared .page()` returns a new page even after browser was already closed"), { permissions }, async () => {
  const { shareable } = Browser
  Browser.shareable = true
  await Browser.shared?.close()
  expect(Browser.shared).to.be.null
  const page = await Browser.page({ log, bin })
  await page.close()
  await Browser.shared?.close()
  expect(Browser.shared).to.be.null
  Browser.shareable = shareable
})

Deno.test(t(import.meta, "`page.setTransparentBackground()` sets a transparent background"), { permissions }, async () => {
  const { shareable } = Browser
  Browser.shareable = true
  await Browser.shared?.close()
  expect(Browser.shared).to.be.null
  const page = await Browser.page({ log, bin })
  await page.setTransparentBackground()
  await page.close()
  await Browser.shared?.close()
  expect(Browser.shared).to.be.null
  Browser.shareable = shareable
})

Deno.test(t(import.meta, "`page.evaluate()` runs scripts"), { permissions }, async () => {
  const { shareable } = Browser
  Browser.shareable = true
  await Browser.shared?.close()
  expect(Browser.shared).to.be.null
  const page = await Browser.page({ log, bin, width: 800, height: 600 })
  await expect(page.evaluate(() => {
    throw new Error("Expected error")
  })).to.be.rejected
  await expect(page.evaluate(() => ({ width: window.innerWidth, height: window.innerHeight }))).to.eventually.deep.equal({ width: 800, height: 600 })
  await page.close()
  await Browser.shared?.close()
  expect(Browser.shared).to.be.null
  Browser.shareable = shareable
})
