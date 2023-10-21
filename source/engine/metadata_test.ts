import { expect } from "@engine/utils/testing.ts"
import { metadata } from "@engine/metadata.ts"
import { version } from "@engine/version.ts"

// TODO(@lowlighter): change to `[dir.source]` after https://github.com/denoland/deno_std/pull/3692
Deno.test("metadata()", { permissions: { read: true } }, async (t) => {
  await t.step("returns metadata", async () => {
    await expect(metadata()).to.eventually.containSubset({ version }).and.include.keys("plugins", "processors", "cli", "server", "webrequest")
  })
})
