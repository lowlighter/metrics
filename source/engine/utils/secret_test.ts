import { expect, t } from "@engine/utils/testing.ts"
import { inspect } from "@engine/utils/io.ts"
import { Secret } from "@engine/utils/secret.ts"

const value = "SECRET_VALUE"
const secret = new Secret(value)

Deno.test(t(import.meta, "`.read()` returns secret value"), { permissions: "none" }, () => {
  expect(secret.read()).to.equal(value)
})

Deno.test(t(import.meta, "`.#value` is not leaked"), { permissions: "none" }, () => {
  expect(inspect(secret)).to.not.include(value)
})

Deno.test(t(import.meta, "`.empty` is correct"), { permissions: "none" }, () => {
  expect(secret.empty).to.equal(false)
  {
    const secret = new Secret(null)
    expect(secret.empty).to.equal(true)
    expect(secret.read()).to.equal("")
  }
})
