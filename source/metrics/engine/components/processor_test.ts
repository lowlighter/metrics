import { expect, MetricsError, test } from "@utils/testing.ts"
import { Processor } from "@engine/components/processor.ts"
import { config as schema } from "@engine/config.ts"
import { config, getPermissions, setup } from "@engine/components/component_test.ts"
import { deepMerge } from "std/collections/deep_merge.ts"
import { process } from "@engine/process.ts"
//import * as dir from "@engine/paths.ts"

// TODO(@lowlighter): change to `[dir.source]` after https://github.com/denoland/deno_std/pull/3692
Deno.test("Processor()", { permissions: { read: true } }, async (t) => {
  const { plugins: [{ processors: [context] }] } = schema.parse({ plugins: [{ processors: [{ id: "test", logs: "none", fatal: true, retries: { delay: 0 } }] }] }) as test
  class TestProcessor extends Processor {
    static readonly meta = { url: "test" } as test
    readonly name = "⚗️ Test processor"
    readonly category = "testing"
    readonly supports = ["image/svg+xml"]
    readonly description = "Test processor"
    protected async action() {}
    async run({ mime }: test) {
      const state = await Processor.state.parseAsync({ result: { content: "", mime, base64: false, result: {} }, results: [], errors: [] })
      return super.run(state)
    }
    constructor(context: Processor["context"]) {
      super(context)
    }
  }

  await t.step("tests() returns a list of tests", async () => {
    const plugin = new TestProcessor(context)
    await expect(plugin.tests()).to.eventually.be.an("array")
  })

  await t.step("supported()", async (t) => {
    await t.step("is a noop when entity is supported", async () => {
      const plugin = new TestProcessor(context)
      await expect(plugin.run({ mime: "image/svg+xml" })).to.be.eventually.be.ok
    })
    await t.step("throws if not supported", async () => {
      const plugin = new TestProcessor(context)
      await expect(plugin.run({ mime: "text/plain" })).to.be.rejectedWith(MetricsError, /not supported for text\/plain/i)
    })
  })
})

for (const id of await Processor.list()) {
  const processor = await Processor.load({ id })
  const tests = await processor.tests()
  const name = `${processor.icon} processors/${processor.id}`
  if (!tests.length) {
    Deno.test.ignore(name, () => void null)
    continue
  }
  for (const test of tests) {
    Deno.test(`${name} | ${test.name}`, await getPermissions(test), async () => {
      const { teardown } = setup()
      await expect(process(deepMerge(config, test, { arrays: "replace" }))).to.be.fulfilled.and.eventually.be.ok
      teardown()
    })
  }
}
