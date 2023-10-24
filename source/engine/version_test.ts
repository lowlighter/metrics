import { expect, t } from "@engine/utils/testing.ts"
import { latest, testing, version } from "@engine/version.ts"

Deno.test(t(import.meta, "`version` is correctly parsed"), { permissions: { read: ["deno.jsonc"] } }, async () => {
  await expect(testing.parse("deno.jsonc")).to.eventually.equal(version.number)
  await expect(testing.parse("")).to.eventually.equal(version.number)
})

Deno.test(t(import.meta, "`latest()` returns latest release"), { permissions: { net: ["example.com/releases/"] } }, async () => {
  const version = testing.number
  testing.number = "4.0.0"
  await expect(latest("https://example.com/releases/5.0.0")).to.eventually.equal("5.0.0")
  await expect(latest("https://example.com/releases/3.0.0")).to.eventually.equal("4.0.0")
  await expect(latest("https://example.com/releases/3.0")).to.eventually.equal("4.0.0")
  testing.number = version
})

Deno.test(t(import.meta, "`latest()` fallbacks on current version on errors"), { permissions: "none" }, async () => {
  const version = testing.number
  testing.number = "4.0.0"
  await expect(latest("https://example.com/releases/6.6.6")).to.eventually.equal(testing.number)
  testing.number = version
})
