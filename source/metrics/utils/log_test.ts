import { expect, test } from "@utils/testing.ts"
import { channel, Logger } from "@utils/log.ts"

class DevNull {
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
Deno.test("Logger()", { permissions: "none" }, async (t) => {
  const stdio = new DevNull()
  const log = new Logger(import.meta, { level: Logger.channels.none, tags: { foo: "bar" }, stdio })

  await t.step("is instantiated correctly", () => {
    expect(log.id).to.include("log_test")
    expect(log.level).to.equal(Logger.channels.none)
    expect(log.tags).to.deep.equal({ foo: "bar" })
  })

  await t.step("setLevel() changes log level", () => {
    for (const level of Object.entries(Logger.channels).flat() as Array<"none" | channel | number>) {
      log.setLevel(level)
      expect(log.level).to.equal((Logger.channels as test)[level] ?? level)
    }
  })

  for (const channel of Object.keys(Logger.channels).filter((channel) => channel !== "none") as channel[]) {
    Object.assign(log, { level: Math.max(...Object.values(Logger.channels)) })

    await t.step(`${channel}()`, async (t) => {
      await t.step("prints logs correctly", () => {
        stdio.flush()
        log[channel](channel)
        expect(stdio.messages).to.have.lengthOf(1)
        expect(stdio.messages[0]).to.include(channel)
      })

      log.setLevel(Logger.channels.none)

      await t.step("honors log level", () => {
        stdio.flush()
        log[channel](channel)
        if (channel === "probe") {
          expect(stdio.messages).to.have.lengthOf(1)
        } else {
          expect(stdio.messages).to.be.empty
        }
      })
    })
  }

  await t.step("raw() prints log directly", () => {
    stdio.flush()
    log.raw("foo")
    expect(stdio.messages).to.have.lengthOf(1)
    expect(stdio.messages[0]).and.to.include("foo")
  })

  await t.step("with() returns a new logger with inherited properties", () => {
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
})
