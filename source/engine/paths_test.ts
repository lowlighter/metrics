import { expect, t } from "@engine/utils/testing.ts"
import { root } from "@engine/paths.ts"

Deno.test(t(import.meta, "`root` is correct"), { permissions: { read: [root] } }, async () => {
  const files = []
  for await (const { name } of Deno.readDir(root)) {
    files.push(name)
  }
  expect(files).to.include.members(["deno.jsonc"])
})
