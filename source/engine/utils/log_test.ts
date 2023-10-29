import { expect, t, test } from "@engine/utils/testing.ts"
import { channel, Logger } from "@engine/utils/log.ts"

export class DevNull {
  readonly messages = [] as unknown[]
  flush() {
    this.messages.splice(0)
  }
  error(message: unknown, ..._: unknown[]) {
    this.messages.push(message)
  }
  warn(message: unknown, ..._: unknown[]) {
    this.messages.push(message)
  }
  info(message: unknown, ..._: unknown[]) {
    this.messages.push(message)
  }
  log(message: unknown, ..._: unknown[]) {
    this.messages.push(message)
  }
  debug(message: unknown, ..._: unknown[]) {
    this.messages.push(message)
  }
}

const stdio = new DevNull()
const log = new Logger(import.meta, { level: Logger.channels.none, tags: { foo: "bar" }, stdio })

Deno.test(t(import.meta, "is instantiable"), { permissions: "none" }, () => {
  expect(log.id).to.include("log_test")
  expect(log.level).to.equal(Logger.channels.none)
  expect(log.tags).to.deep.equal({ foo: "bar" })
})

Deno.test(t(import.meta, "`.setLevel()` changes log level"), { permissions: "none" }, () => {
  for (const level of Object.entries(Logger.channels).flat() as Array<"none" | channel | number>) {
    log.setLevel(level)
    expect(log.level).to.equal((Logger.channels as test)[level] ?? level)
  }
})

Deno.test(t(import.meta, "`.raw()` prints log directly"), { permissions: "none" }, () => {
  stdio.flush()
  log.raw("foo")
  expect(stdio.messages).to.have.lengthOf(1)
  expect(stdio.messages[0]).and.to.include("foo")
})

Deno.test(t(import.meta, "`.with()` returns a new logger with inherited properties"), { permissions: "none" }, () => {
  stdio.flush()
  log.probe(null)
  expect(stdio.messages).to.have.lengthOf(1)
  expect(stdio.messages[0]).and.to.include("foo").and.to.include("bar")

  const child = log.with({ baz: "qux" })
  expect(child.tags).to.deep.equal({ foo: "bar", baz: "qux" })
  stdio.flush()
  child.probe(null)
  expect(stdio.messages).to.have.lengthOf(1)
  expect(stdio.messages[0]).and.to.include("foo").and.to.include("bar").and.to.include("baz").and.to.include("qux")
})

for (const channel of Object.keys(Logger.channels).filter((channel) => channel !== "none") as channel[]) {
  Deno.test(t(import.meta, `\`.${channel}()\` prints logs correctly and honors log level`), { permissions: "none" }, () => {
    const stdio = new DevNull()
    const log = new Logger(import.meta, { level: Math.max(...Object.values(Logger.channels)), tags: { foo: "bar" }, stdio })

    stdio.flush()
    log[channel](channel)
    expect(stdio.messages).to.have.lengthOf(1)
    expect(stdio.messages[0]).to.include(channel)
    log.setLevel(Logger.channels.none)

    stdio.flush()
    log[channel](channel)
    if (channel === "probe") {
      expect(stdio.messages).to.have.lengthOf(1)
    } else {
      expect(stdio.messages).to.be.empty
    }
  })
}
