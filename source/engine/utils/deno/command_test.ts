import { expect, t } from "@engine/utils/testing.ts"
import { command } from "@engine/utils/deno/command.ts"
import { Logger } from "@engine/utils/log.ts"
import { DevNull } from "@engine/utils/log_test.ts"

const stdio = new DevNull()
const log = new Logger(import.meta, { level: Logger.channels.trace, tags: { foo: "bar" }, stdio })

// TODO(#1571)
const permissions = { run: "inherit" } as const

Deno.test(t(import.meta, "`command()` can execute commands"), { permissions }, async () => {
  await expect(command("deno --version")).to.be.eventually.containSubset({ success: true, code: 0 })
})

Deno.test(t(import.meta, "`command()` returns stdio content instead if asked"), { permissions }, async () => {
  await expect(command("deno --version", { return: "stdout" })).to.eventually.include("deno")
})

Deno.test(t(import.meta, "`command()` returns stdio content instead if asked"), { permissions }, async () => {
  stdio.flush()
  await expect(command("deno --version", { log })).to.be.fulfilled
  expect(stdio.messages).to.not.be.empty
})
