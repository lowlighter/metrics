import { expect, MetricsError, t } from "@engine/utils/testing.ts"
import { process } from "@engine/process.ts"
import * as dir from "@engine/paths.ts"

Deno.test(t(import.meta, "`process()` returns processed config"), { permissions: { read: [dir.source] } }, async () => {
  await expect(process({})).to.eventually.be.null
  await expect(process({ plugins: [{ logs: "none" }] })).to.eventually.have.property("result")
  await expect(process({ plugins: [{ id: "introduction", handle: "octocat", logs: "none", mock: true }] })).to.eventually.have.property("result")
})

Deno.test(t(import.meta, "`process()` throws on unknown component"), { permissions: { read: [dir.source] } }, async () => {
  await expect(process({ plugins: [{ id: "foo", logs: "none" }] })).to.rejectedWith(MetricsError, /could not be loaded/i)
})
