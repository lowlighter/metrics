import { expect, t } from "@engine/utils/testing.ts"
import { MetricsError, throws } from "@engine/utils/errors.ts"

Deno.test(t(import.meta, "`throws()` throws a `MetricsError`"), { permissions: "none" }, () => {
  expect(new MetricsError()).to.be.instanceOf(Error)
  expect(() => throws("Expected error")).to.throw(MetricsError, /expected error/i)
})
