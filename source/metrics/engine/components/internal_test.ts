import { Internal } from "@engine/components/internal.ts"
import { expect, test } from "@utils/testing.ts"

class InternalTest extends Internal {
  protected static readonly meta = import.meta
  constructor() {
    super(null as test)
  }
}

Deno.test("Internal()", { permissions: "none" }, () => {
  const internal = new InternalTest()
  expect(internal.id).to.equal("metrics/engine/components/internal_test.ts")
})
