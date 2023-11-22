import { dir, expect, is, MetricsError, t, test } from "@engine/utils/testing.ts"
import { config, getPermissions, Plugin, setup } from "@engine/components/tests/context.ts"
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

Deno.test(t(import.meta, "`.render()` renders template content"), { permissions: { read: [dir.source] } }, async () => {
  await expect(Plugin.run({ context: { id: import.meta.url, entity: "user", template: "../tests/template", fatal: true } })).to.be.eventually.containSubset({ result: { content: "foo" } })
  await expect(Plugin.run({ context: { id: import.meta.url, entity: "user", template: "metrics://engine/components/tests/template.ejs", fatal: true } })).to.be.eventually.containSubset({
    result: { content: "foo" },
  })
})

Deno.test(t(import.meta, "`.templates()` returns a list of available templates"), { permissions: { read: [dir.source] } }, async () => {
  const plugin = await Plugin.load({ id: import.meta.url })
  await expect(plugin.templates()).to.be.eventually.be.an("array")
})

Deno.test(t(import.meta, "`static .load()` can instantiate from string id"), { permissions: "none" }, async () => {
  await expect(TestPlugin.load({ id: "plugin_test.ts" })).to.eventually.be.instanceOf(TestPlugin)
})

Deno.test(t(import.meta, "`static .load()` can instantiate from url scheme"), { permissions: "none" }, async () => {
  await expect(Plugin.load({ id: import.meta.url })).to.eventually.be.instanceOf(TestPlugin)
})

Deno.test(t(import.meta, "`static .load()` can instantiate from `metrics://` scheme"), { permissions: "none" }, async () => {
  await expect(Plugin.load({ id: "metrics://engine/components/plugin_test.ts" })).to.eventually.be.instanceOf(TestPlugin)
})

Deno.test(t(import.meta, "`static .load()` without identifier returns the one defined by `Plugin.nameless`"), { permissions: "none" }, async () => {
  await expect(Plugin.load({ logs: "none" } as test)).to.eventually.be.instanceOf(Plugin).and.to.have.property("id", Plugin.nameless)
  await expect(Plugin.run({ context: { entity: "user" } })).to.be.fulfilled
})

Deno.test(t(import.meta, "`static .list()` returns a list of available plugins"), { permissions: { read: [dir.source] } }, async () => {
  await expect(Plugin.list()).to.be.eventually.be.an("array")
})

for (const id of await Plugin.list()) {
  const plugin = await Plugin.load({ id })
  const tests = await plugin.tests()
  const templates = await plugin.templates()
  const name = `${plugin.icon} plugins/${plugin.id}`
  if (!tests?.length) {
    Deno.test.ignore(t(name, null), () => void null)
    continue
  }
  for (const test of tests) {
    for (const template of templates) {
      Deno.test(t(name, `*${template}* ${test.name}`), await getPermissions(test), async () => {
        const { teardown } = setup(test)
        await expect(process(deepMerge({ presets: { default: { plugins: { template } } } }, deepMerge(config, test, { arrays: "replace" })))).to.be.fulfilled.and.eventually.be.ok
        teardown()
      })
    }
  }
}
