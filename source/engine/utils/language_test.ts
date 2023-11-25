import { expect, t } from "@engine/utils/testing.ts"
import { highlight, language } from "@engine/utils/language.ts"

const permissions = { net: ["raw.githubusercontent.com/github-linguist/linguist/master/lib/linguist/languages.yml"] }

Deno.test.ignore(t(import.meta, "`language()` can resolve language name"), { permissions: "none" }, async () => {
  await expect(language("mod.ts", "const foo = 'bar'")).to.eventually.containSubset({ language: "TypeScript", type: "programming" })
})

Deno.test(t(import.meta, "`highlight.resolve()` can resolve language name and autoload syntax highlighting"), { permissions }, async () => {
  await expect(highlight.languages()).to.not.include("javascript")
  await expect(highlight.resolve("js")).to.eventually.equal("javascript")
  await expect(highlight.languages()).to.include("javascript")
})

Deno.test(t(import.meta, "`highlight()` can highlight code"), { permissions }, async () => {
  const { code } = highlight("ts", "const foo = 'bar'")
  await expect(code).to.include("hljs-string")
})

Deno.test(t(import.meta, "`highlight()` does not throw on unknown languages"), { permissions }, async () => {
  await expect(highlight("🦕", "code")).to.containSubset({ language: "🦕", code: "code" })
})
