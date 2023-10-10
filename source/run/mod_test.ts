//Imports
import { assert, describe, it } from "@testing"
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

//TODO(@lowlighter): test for engine

// Clean browser after each test
Browser.shared = false

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
  describe({ name }, () => {
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
  describe({ name }, () => {
    for (const test of tests) {
      it(test.name, async () => {
        assert(await process(deepMerge(config, test, { arrays: "replace" })))
      })
    }
  })
}
