import { expect, MetricsError } from "@utils/testing.ts"
import { process } from "@engine/process.ts"
import * as dir from "@engine/paths.ts"

Deno.test("process()", { permissions: { read: [dir.source] } }, async (t) => {
  await t.step("returns processed config", async () => {
    await expect(process({})).to.eventually.be.null
    await expect(process({ plugins: [{ logs: "none" }] })).to.eventually.have.property("result")
    await expect(process({ plugins: [{ id: "introduction", handle: "octocat", logs: "none", mock: true }] })).to.eventually.have.property("result")
  })
  await t.step("throws on unknown component", async () => {
    await expect(process({ plugins: [{ id: "foo", logs: "none" }] })).to.rejectedWith(MetricsError, /could not be loaded/i)
  })
})
