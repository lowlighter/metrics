import { expect, is, MetricsValidationError, mock } from "@engine/utils/testing.ts"

Deno.test("mock()", { permissions: "none" }, async (t) => {
  await t.step("validates inputs and returns mocked data", () => {
    const mocked = mock({ foo: is.string() }, ({ foo }) => foo)
    expect(mocked({ foo: "bar" })).to.equal("bar")
    expect(() => mocked({ foo: 1 })).to.throw(MetricsValidationError)
  })
})
