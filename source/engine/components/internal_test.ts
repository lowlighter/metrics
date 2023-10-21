import { Internal } from "@engine/components/internal.ts"
import { expect, t, test } from "@engine/utils/testing.ts"

class InternalTest extends Internal {
  protected static readonly meta = import.meta
  constructor() {
    super(null as test)
  }
}

Deno.test(t(import.meta, "is instantiable once extended"), { permissions: "none" }, () => {
  const internal = new InternalTest()
  expect(internal.id).to.equal("engine/components/internal")
})
