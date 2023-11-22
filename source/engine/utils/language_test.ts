import { expect, t } from "@engine/utils/testing.ts"
import { language, highlight } from "@engine/utils/language.ts"

const permissions = {net:["raw.githubusercontent.com/github-linguist/linguist/master/lib/linguist/languages.yml"]}

Deno.test.ignore(t(import.meta, "`language()` can resolve language name"), { permissions: "none" }, async () => {
  await expect(language("mod.ts", "const foo = 'bar'")).to.eventually.containSubset({ language: "TypeScript", type: "programming" })
})

Deno.test(t(import.meta, "`highlight()` can highlight code"), { permissions }, async () => {
  await expect(highlight("ts", "const foo = 'bar'")).to.eventually.containSubset({ language: "typescript" })
})

Deno.test(t(import.meta, "`highlight()` does not throw on unknown languages"), { permissions }, async () => {
  await expect(highlight("🦕", "code")).to.eventually.containSubset({ language: "🦕", code:"code" })
})
