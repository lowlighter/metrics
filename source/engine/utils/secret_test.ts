import { expect } from "@engine/utils/testing.ts"
import { inspect } from "@engine/utils/io.ts"
import { Secret } from "@engine/utils/secret.ts"

Deno.test("Secret()", { permissions: "none" }, async (t) => {
  const value = "SECRET_VALUE"
  const secret = new Secret(value)

  await t.step("read() returns secret value", () => {
    expect(secret.read()).to.equal(value)
  })

  await t.step("value is not leaked", () => {
    expect(inspect(secret)).to.not.include(value)
  })

  await t.step("empty is correctly guessed", () => {
    expect(secret.empty).to.equal(false)
    {
      const secret = new Secret(null)
      expect(secret.empty).to.equal(true)
      expect(secret.read()).to.equal("")
    }
  })
})
