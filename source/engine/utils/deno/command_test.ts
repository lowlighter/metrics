import { expect, t } from "@engine/utils/testing.ts"
import { command } from "@engine/utils/deno/command.ts"
import { Logger } from "@engine/utils/log.ts"
import { DevNull } from "@engine/utils/log_test.ts"

const stdio = new DevNull()
const log = new Logger(import.meta, { level: Logger.channels.trace, tags: { foo: "bar" }, stdio })

Deno.test.ignore(t(import.meta, "`command()` can execute commands"), { permissions: { run: ["deno"] } }, async () => {
  await expect(command("deno --version")).to.be.eventually.containSubset({ success: true, code: 0 })
})

Deno.test.ignore(t(import.meta, "`command()` returns stdio content instead if asked"), { permissions: { run: ["deno"] } }, async () => {
  await expect(command("deno --version", { return: "stdout" })).to.eventually.include("deno")
})

Deno.test.ignore(t(import.meta, "`command()` returns stdio content instead if asked"), { permissions: { run: ["deno"] } }, async () => {
  stdio.flush()
  await expect(command("deno --version", { log })).to.be.fulfilled
  expect(stdio.messages).to.not.be.empty
})
