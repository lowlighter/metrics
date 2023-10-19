import { expect } from "@utils/testing.ts"
import { latest, testing, version } from "@engine/version.ts"

Deno.test("version", { permissions: { read: ["deno.jsonc"] } }, async (t) => {
  await t.step("is correctly parsed", async () => {
    await expect(testing.parse("deno.jsonc")).to.eventually.equal(version.number)
    await expect(testing.parse("")).to.eventually.equal(version.number)
  })
})

Deno.test("latest()", { permissions: { net: ["example.com/releases/"] } }, async (t) => {
  const version = testing.number
  await t.step("returns latest release", async () => {
    testing.number = "4.0.0"
    await expect(latest("https://example.com/releases/5.0.0")).to.eventually.equal("5.0.0")
    await expect(latest("https://example.com/releases/3.0.0")).to.eventually.equal("4.0.0")
    await expect(latest("https://example.com/releases/3.0")).to.eventually.equal("4.0.0")
  })
  await t.step("fallbacks on current version on errors", async () => {
    testing.number = "4.0.0"
    await expect(latest("https://example.test/releases/6.6.6")).to.eventually.equal("4.0.0")
  })
  testing.number = version
})
