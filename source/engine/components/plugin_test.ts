import { dir, expect, is, MetricsError, t, test } from "@engine/utils/testing.ts"
import { config, getPermissions, Plugin, setup } from "@engine/components/component_test.ts"
import { deepMerge } from "std/collections/deep_merge.ts"
import { process } from "@engine/process.ts"

export default class TestPlugin extends Plugin {
  static readonly meta = import.meta
  readonly name = "🧑🏻‍🔬 Test plugin"
  readonly category = "testing"
  readonly supports = ["user"]
  readonly description = "Test plugin"
  readonly inputs = is.object({})
  readonly outputs = is.object({})
  protected async action() {}
  static get path() {
    return `${dir.source}/engine/components`
  }
}

Deno.test(t(import.meta, "`.icon` returns an emoji"), { permissions: "none" }, async () => {
  const plugin = await Plugin.load({ id: import.meta.url })
  expect(plugin.icon).to.equal("🧑🏻‍🔬")
})

Deno.test(t(import.meta, "`.supported()` is a noop when supported"), { permissions: "none" }, async () => {
  await expect(Plugin.run({ context: { id: import.meta.url, entity: "user", fatal: true } })).to.be.eventually.be.ok
})

Deno.test(t(import.meta, "`.supported()` throws when unsupported"), { permissions: "none" }, async () => {
  await expect(Plugin.run({ context: { id: import.meta.url, entity: "organization", fatal: true } })).to.be.rejectedWith(MetricsError, /not supported for organization/i)
})

Deno.test(t(import.meta, "`.render()` returns a list of available plugins"), { permissions: { read: [dir.source] } }, async () => {
  await expect(Plugin.run({ context: { id: import.meta.url, entity: "user", template: "../tests/template", fatal: true } })).to.be.eventually.containSubset({ result: { content: "foo" } })
})

// TODO(@lowlighter): change to `[dir.source]` after https://github.com/denoland/deno_std/pull/3692
Deno.test(t(import.meta, "`.templates()` returns a list of available templates"), { permissions: { read: true } }, async () => {
  const plugin = await Plugin.load({ id: import.meta.url })
  await expect(plugin.templates()).to.be.eventually.be.an("array")
})

Deno.test(t(import.meta, "`static .load()` can instantiate from string id"), { permissions: "none" }, async () => {
  await expect(TestPlugin.load({ id: "plugin_test.ts" })).to.eventually.be.instanceOf(TestPlugin)
})

Deno.test(t(import.meta, "`static .load()` can instantiate from url scheme"), { permissions: "none" }, async () => {
  await expect(Plugin.load({ id: import.meta.url })).to.eventually.be.instanceOf(TestPlugin)
})

Deno.test(t(import.meta, "`static .load()` without identifier returns `Plugin.NOP`"), { permissions: "none" }, async () => {
  await expect(Plugin.load({ logs: "none" } as test)).to.eventually.be.instanceOf(Plugin.NOP)
})

// TODO(@lowlighter): change to `[dir.source]` after https://github.com/denoland/deno_std/pull/3692
Deno.test(t(import.meta, "`static .list()` returns a list of available plugins"), { permissions: { read: true } }, async () => {
  await expect(Plugin.list()).to.be.eventually.be.an("array")
})

for (const id of await Plugin.list()) {
  const plugin = await Plugin.load({ id })
  const tests = await plugin.tests()
  const templates = await plugin.templates()
  const name = `${plugin.icon} plugins/${plugin.id}`
  if (!tests.length) {
    Deno.test.ignore(t(name, null), () => void null)
    continue
  }
  for (const test of tests) {
    for (const template of templates) {
      Deno.test(t(name, `*${template}* ${test.name}`), await getPermissions(test), async () => {
        const { teardown } = setup()
        await expect(process(deepMerge({ presets: { default: { plugins: { template } } } }, deepMerge(config, test, { arrays: "replace" })))).to.be.fulfilled.and.eventually.be.ok
        teardown()
      })
    }
  }
}
