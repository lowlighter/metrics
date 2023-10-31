import { expect, is, MetricsValidationError, mock, t } from "@engine/utils/testing.ts"

Deno.test(t(import.meta, "`mock()` validates inputs and returns mocked data"), { permissions: "none" }, () => {
  const mocked = mock({ foo: is.string() }, ({ foo }) => foo)
  expect(mocked({ foo: "bar" })).to.equal("bar")
  expect(() => mocked({ foo: 1 })).to.throw(MetricsValidationError)
})
