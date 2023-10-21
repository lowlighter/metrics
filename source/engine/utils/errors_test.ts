import { expect } from "@engine/utils/testing.ts"
import { MetricsError, throws } from "@engine/utils/errors.ts"

Deno.test("throws()", { permissions: "none" }, async (t) => {
  await t.step("throws a MetricsError", () => {
    expect(new MetricsError()).to.be.instanceOf(Error)
    expect(() => throws("Expected error")).to.throw(MetricsError, /expected error/i)
  })
})
