import { dir, expect, is, MetricsValidationError, mock, nodeno, t } from "@engine/utils/testing.ts"

Deno.test(t(import.meta, "`mock()` validates inputs and returns mocked data"), { permissions: "none" }, () => {
  const mocked = mock({ foo: is.string() }, ({ foo }) => foo)
  expect(mocked({ foo: "bar" })).to.equal("bar")
  expect(() => mocked({ foo: 1 })).to.throw(MetricsValidationError)
})

Deno.test(t(import.meta, "`nodeno()` executes code in an environment without deno"), { permissions: { read: [dir.source] } }, async () => {
  await expect(nodeno(() => expect(globalThis.Deno).to.be.undefined)()).to.be.fulfilled
  await expect(nodeno(() => expect(() => Deno).to.throw(ReferenceError, /deno is not defined/i))()).to.be.fulfilled
})

Deno.test(t(import.meta, "`nodeno()` handles permissions"), { permissions: { read: [dir.source], net: true } }, async () => {
  await expect(nodeno(() => fetch("https://example.com").then((response) => void response.body?.cancel()))()).to.be.fulfilled
  await expect(nodeno(() => fetch("https://example.com").then((response) => void response.body?.cancel()), { permissions: "none" })()).to.be.rejectedWith(Error, /requires net access/i)
})

Deno.test(t(import.meta, "`nodeno()` handles context"), { permissions: { read: [dir.source] } }, async () => {
  const test = "foo"
  await expect(nodeno(() => test, { return: true, with: { test } })()).to.be.eventually.equal("foo")
})

Deno.test(t(import.meta, "`nodeno()` is able to return clonable results"), { permissions: { read: [dir.source] } }, async () => {
  await expect(nodeno(() => ({ foo: true }), { return: true })()).to.be.eventually.deep.equal({ foo: true })
})
