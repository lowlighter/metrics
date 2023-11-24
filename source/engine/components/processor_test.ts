import { dir, expect, MetricsError, t } from "@engine/utils/testing.ts"
import { config, getPermissions, Processor, setup } from "@engine/components/tests/context.ts"
import { deepMerge } from "std/collections/deep_merge.ts"
import { process } from "@engine/process.ts"

export default class TestProcessor extends Processor {
  static readonly meta = import.meta
  readonly name = "🧑🏻‍🔬 Test processor"
  readonly category = "testing"
  readonly supports = ["image/svg+xml"]
  readonly description = "Test processor"
  protected async action() {}
  static get path() {
    return `${dir.source}/engine/components`
  }
}

Deno.test(t(import.meta, "`.icon` returns an emoji"), { permissions: "none" }, async () => {
  const plugin = await Processor.load({ id: import.meta.url })
  expect(plugin.icon).to.equal("🧑🏻‍🔬")
})

Deno.test(t(import.meta, "`.supported()` is a noop when supported"), { permissions: "none" }, async () => {
  const state = { result: { source: { id: null, index: 0 }, content: "", mime: "image/svg+xml", base64: false, result: {} }, results: [], errors: [] }
  await expect(Processor.run({ state, context: { id: import.meta.url, fatal: true } })).to.be.eventually.be.ok
})

Deno.test(t(import.meta, "`.supported()` throws when unsupported"), { permissions: "none" }, async () => {
  await expect(Processor.run({ context: { id: import.meta.url, fatal: true } })).to.be.rejectedWith(MetricsError, /not supported for application\/octet-stream/i)
})

Deno.test(t(import.meta, "`static .load()` can instantiate from string id"), { permissions: "none" }, async () => {
  await expect(TestProcessor.load({ id: "processor_test.ts" })).to.eventually.be.instanceOf(TestProcessor)
})

Deno.test(t(import.meta, "`static .load()` can instantiate from url scheme"), { permissions: "none" }, async () => {
  await expect(Processor.load({ id: import.meta.url })).to.eventually.be.instanceOf(TestProcessor)
})

Deno.test(t(import.meta, "`static .load()` can instantiate from `metrics://` scheme"), { permissions: "none" }, async () => {
  await expect(Processor.load({ id: "metrics://engine/components/processor_test.ts" })).to.eventually.be.instanceOf(TestProcessor)
})

Deno.test(t(import.meta, "`static .list()` returns a list of available plugins"), { permissions: { read: [dir.source] } }, async () => {
  await expect(Processor.list()).to.be.eventually.be.an("array")
})

for (const id of await Processor.list()) {
  const processor = await Processor.load({ id })
  const tests = await processor.tests()
  const name = `${processor.icon} processors/${processor.id}`
  if (!tests?.length) {
    Deno.test.ignore(t(name, null), () => void null)
    continue
  }
  for (const test of tests) {
    Deno.test(t(name, test.name), await getPermissions(test), async () => {
      const { teardown } = setup(test)
      await expect(process(deepMerge(config, test, { arrays: "replace" }))).to.be.fulfilled.and.eventually.be.ok
      teardown()
    })
  }
}
