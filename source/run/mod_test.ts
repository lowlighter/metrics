//Imports
import { afterAll, assert, beforeAll, describe, it } from "@testing"
import { Plugin } from "@plugin"
import { Processor } from "@processor"
import { process } from "@metrics/process.ts"
import { deepMerge } from "std/collections/deep_merge.ts"
import { Browser } from "@utils/browser.ts"

/** Test preset */
const config = {
  presets: {
    default: {
      plugins: {
        logs: "none",
        mock: true,
        fatal: true,
        retries: { attempts: 1, delay: 0 },
      },
      get processors() {
        return this.plugins
      },
    },
  },
}

const shared = { process: null as null | Deno.ChildProcess, controller: new AbortController() }

beforeAll(async () => {
  const command = new Deno.Command("deno", { args: ["task", "browser", "--allow-write"], signal: shared.controller.signal })
  Object.assign(shared, { process: command.spawn() })
  Browser.endpoint = await read(".test/browser")
})

afterAll(async () => {
  await Browser.close()
  shared.controller.abort()
  await shared.process?.status
})

//TODO(@lowlighter): test for engine
//TODO(@lowlighter): check if puppeteer leaking test is fixable...
const options = { sanitizeResources: false, sanitizeOps: false }

// Plugins
for (const id of await Plugin.list()) {
  const plugin = await Plugin.load({ id })
  const tests = await plugin.tests()
  const templates = await plugin.templates()
  const name = `${plugin.icon} plugins/${plugin.id}`
  if (!tests.length) {
    it.skip(name, () => void null)
    continue
  }
  describe({ ...options, name }, () => {
    for (const test of tests) {
      describe(test.name, () => {
        for (const template of templates) {
          it(template, async () => {
            assert(await process(deepMerge({ presets: { default: { plugins: { template } } } }, deepMerge(config, test, { arrays: "replace" }))))
          })
        }
      })
    }
  })
}

// Processors
for (const id of await Processor.list()) {
  const processor = await Processor.load({ id })
  const tests = await processor.tests()
  const name = `${processor.icon} processors/${processor.id}`
  if (!tests.length) {
    it.skip(name, () => void null)
    continue
  }
  describe({ ...options, name }, () => {
    for (const test of tests) {
      it(test.name, async () => {
        assert(await process(deepMerge(config, test, { arrays: "replace" })))
      })
    }
  })
}
