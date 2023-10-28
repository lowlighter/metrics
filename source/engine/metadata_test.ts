import { expect, t } from "@engine/utils/testing.ts"
import { metadata } from "@engine/metadata.ts"

// TODO(@lowlighter): change to `[dir.source]` after https://github.com/denoland/deno_std/pull/3692
Deno.test(t(import.meta, "`metadata()` returns metadata"), { permissions: { read: true } }, async () => {
  await expect(metadata()).to.eventually.include.keys("version", "plugins", "processors", "modes")
})
