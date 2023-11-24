import { dir, expect, t } from "@engine/utils/testing.ts"
import { metadata } from "@engine/metadata.ts"

Deno.test(t(import.meta, "`metadata()` returns metadata"), { permissions: { read: [dir.source], net: "inherit" } }, async () => {
  await expect(metadata()).to.eventually.include.keys("version", "plugins", "processors", "modes")
})
