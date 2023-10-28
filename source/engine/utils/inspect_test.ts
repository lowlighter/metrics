import { expect, t } from "@engine/utils/testing.ts"
import { inspect, testing } from "@engine/utils/inspect.ts"

Deno.test(t(import.meta, "`inspect()` returns a representation of the value"), { permissions: "none" }, () => {
  const object = { foo: "bar" }
  expect(inspect(object)).to.be.a("string").and.not.equal(`${object}`)
})

Deno.test(t(import.meta, "`inspect()` is polyfilled in non-deno environments"), { permissions: "none" }, () => {
  testing.deno = false
  const object = { foo: "bar" }
  expect(inspect(object)).to.include("foo").and.to.include("bar")
  expect(inspect(object)).to.not.equal(`${object}`)
  expect(inspect(0n)).to.equal("0")
  testing.deno = true
})
