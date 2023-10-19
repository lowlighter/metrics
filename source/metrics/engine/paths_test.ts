import { expect } from "@utils/testing.ts"
import { root } from "@engine/paths.ts"

Deno.test("root", { permissions: { read: [root] } }, async (t) => {
  await t.step("is correct", async () => {
    const files = []
    for await (const { name } of Deno.readDir(root)) {
      files.push(name)
    }
    expect(files).to.include.members(["deno.jsonc"])
  })
})
