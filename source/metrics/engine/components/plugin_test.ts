import { expect, MetricsError, test } from "@utils/testing.ts"
import { is, Plugin } from "@engine/components/plugin.ts"
import { config as schema } from "@engine/config.ts"
import { config, getPermissions, setup } from "@engine/components/component_test.ts"
import { deepMerge } from "std/collections/deep_merge.ts"
import { process } from "@engine/process.ts"
//import * as dir from "@engine/paths.ts"

// TODO(@lowlighter): change to `[dir.source]` after https://github.com/denoland/deno_std/pull/3692
Deno.test("Plugin()", { permissions: { read: true } }, async (t) => {
  const { plugins: [context] } = schema.parse({ plugins: [{ id: "test", logs: "none", fatal: true, template: null, retries: { delay: 0 } }] }) as test
  class TestPlugin extends Plugin {
    static readonly meta = { url: "test" } as test
    readonly name = "⚗️ Test plugin"
    readonly category = "testing"
    readonly supports = ["user"]
    readonly description = "Test plugin"
    readonly inputs = is.object({})
    readonly outputs = is.object({})
    protected async action() {}
    async run() {
      const state = await Plugin.state.parseAsync({ results: [], errors: [] })
      return super.run(state)
    }
    constructor(context: Plugin["context"]) {
      super(context)
    }
  }

  await t.step("tests() returns a list of tests", async () => {
    const plugin = new TestPlugin(context)
    await expect(plugin.tests()).to.eventually.be.an("array")
  })

  await t.step("templates() returns a list of templates", async () => {
    const plugin = new TestPlugin(context)
    await expect(plugin.templates()).to.eventually.be.an("array")
  })

  await t.step("supported()", async (t) => {
    await t.step("is a noop when entity is supported", async () => {
      const plugin = new TestPlugin({ ...context, entity: "user" })
      await expect(plugin.run()).to.be.eventually.be.ok
    })
    await t.step("throws if not supported", async () => {
      const plugin = new TestPlugin({ ...context, entity: "organization" })
      await expect(plugin.run()).to.be.rejectedWith(MetricsError, /not supported for organization/i)
    })
  })
})

for (const id of await Plugin.list()) {
  const plugin = await Plugin.load({ id })
  const tests = await plugin.tests()
  const templates = await plugin.templates()
  const name = `${plugin.icon} plugins/${plugin.id}`
  if (!tests.length) {
    Deno.test.ignore(name, () => void null)
    continue
  }
  for (const test of tests) {
    Deno.test(`${name} | ${test.name}`, await getPermissions(test), async (t) => {
      const { teardown } = setup()
      for (const template of templates) {
        await t.step(template, async () => {
          await expect(process(deepMerge({ presets: { default: { plugins: { template } } } }, deepMerge(config, test, { arrays: "replace" })))).to.be.fulfilled.and.eventually.be.ok
        })
      }
      teardown()
    })
  }
}
