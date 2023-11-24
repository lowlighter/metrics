import { expect, t } from "@engine/utils/testing.ts"
import { markdown } from "@engine/utils/markdown.ts"

Deno.test(t(import.meta, "`markdown()` returns processed html content"), { permissions: "none" }, async () => {
  await expect(markdown("**Hello**", { sanitize: "svg" })).to.eventually.equal("<p><strong>Hello</strong></p>")
})

Deno.test(t(import.meta, "`markdown()` can highlight code blocks"), { permissions: "none" }, async () => {
  await expect(markdown("```ts\nconst foo = true\n```", { sanitize: "svg" })).to.eventually.match(/class="language-ts"/).and.to.match(/class="hljs-.*?"/)
})

Deno.test(t(import.meta, "`markdown()` can handle task lists"), { permissions: "none" }, async () => {
  await expect(markdown("- [ ] A\n- [x] B", { sanitize: "svg" })).to.eventually.match(/class="input checkbox"/).and.to.match(/class="input checkbox checked"/)
})
