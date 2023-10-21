import { expect, MetricsError } from "@engine/utils/testing.ts"
import { env, inspect, KV, list, listen, read, testing, write } from "@engine/utils/io.ts"
import * as dir from "@engine/paths.ts"
import { delay } from "std/async/delay.ts"

const uuid = crypto.randomUUID().slice(-12).toUpperCase()
const test = {
  file: `${dir.test}/io_test.${uuid}.txt`,
  kv: `${dir.test}/io_test_kv.${uuid}.kv`,
  env: `UNIT_TEST_${uuid}`,
  port: 9000,
}

Deno.test("inspect()", { permissions: "none" }, async (t) => {
  await t.step("returns a representation of the value", () => {
    const object = { foo: "bar" }
    expect(inspect(object)).to.be.a("string").and.not.equal(`${object}`)
  })
})

Deno.test("listen()", { permissions: { net: [`0.0.0.0:${test.port}`] } }, async (t) => {
  await t.step("returns a listener to a local address", () => {
    expect(() => listen({ port: test.port }).close()).not.to.throw()
  })
})

Deno.test("writes()", { permissions: { read: [dir.test], write: [dir.test] } }, async (t) => {
  await t.step("writes a text file", async () => {
    await expect(write(test.file, uuid)).to.be.a("promise").and.to.be.fulfilled
  })
  await t.step("writes a raw file", async () => {
    await expect(write(test.file, new TextEncoder().encode(uuid))).to.be.a("promise").and.to.be.fulfilled
  })
})

Deno.test("read()", { permissions: { read: [dir.test] } }, async (t) => {
  await t.step("reads a text file", async () => {
    await expect(read(test.file)).to.be.a("promise").and.to.be.fulfilled.and.to.eventually.be.a("string")
    expect(read(test.file, { sync: true })).to.be.a("string").and.to.equal(uuid)
  })
  await t.step("reads a data url", async () => {
    const data = `data:text/plain;base64,${btoa("hello")}`
    await expect(read(data)).to.be.a("promise").and.to.be.fulfilled.and.to.eventually.be.a("string")
    expect(() => read(data, { sync: true })).to.throw(MetricsError, /unsupported action/i)
  })
})

// TODO(@lowlighter): change to `[dir.source]` after https://github.com/denoland/deno_std/pull/3692
Deno.test("list()", { permissions: { read: true } }, async (t) => {
  await t.step("lists files in a directory", async () => {
    expect(await list(`${dir.source}/metrics/utils/*.ts`)).to.include.members(["io.ts", "io_test.ts"])
    expect(await list("*.ts")).to.not.include.members(["io.ts", "io_test.ts"])
  })
})

Deno.test("env", { permissions: { env: [test.env, `${test.env}_UNDEFINED`] } }, async (t) => {
  await t.step(".get()", async (t) => {
    await t.step("returns a env variable", () => {
      env.set(test.env, uuid)
      expect(env.get(test.env)).to.equal(uuid)
      expect(env.get(`${test.env}_UNDEFINED`)).to.equal("")
    })

    await t.step("returns a boolean if asked", () => {
      for (
        const { value, boolean } of [
          { value: "1", boolean: true },
          { value: "true", boolean: true },
          { value: "0", boolean: false },
          { value: "false", boolean: false },
        ]
      ) {
        env.set(test.env, value)
        expect(env.get(test.env, { boolean: true })).to.equal(boolean)
      }
    })
  })

  await t.step(".set()", async (t) => {
    await t.step("registers a env variable", () => {
      expect(env.set(`${test.env}_FORBIDDEN`, uuid))
      expect(env.get(`${test.env}_FORBIDDEN`)).to.equal("")
    })
  })

  await t.step(".deployment", () => {
    expect(env.deployment).to.be.a("boolean")
  })

  await t.step(".actions", () => {
    expect(env.actions).to.be.a("boolean")
  })
})

Deno.test("KV()", { permissions: { read: [dir.test], write: [dir.test] } }, async (t) => {
  const kv = await new KV(test.kv).ready
  const key = "kv.test"

  await t.step(".has()", async (t) => {
    await t.step("returns true if key exists", async () => {
      await kv.set(`${key}.has`, uuid)
      await expect(kv.has(`${key}.has`)).to.be.fulfilled.and.to.eventually.equal(true)
    })
    await t.step("returns false if key doesn't exists", async () => {
      await expect(kv.has(`${key}.has.not`)).to.be.fulfilled.and.to.eventually.equal(false)
    })
  })

  await t.step(".get()", async (t) => {
    await t.step("returns value if key exists", async () => {
      await kv.set(`${key}.get`, uuid)
      await expect(kv.get(`${key}.get`)).to.be.fulfilled.and.to.eventually.equal(uuid)
    })
    await t.step("returns null if key doesn't exists", async () => {
      await expect(kv.get(`${key}.get.not`)).to.be.fulfilled.and.to.eventually.equal(null)
    })
  })

  await t.step(".set()", async (t) => {
    await t.step("registers key-value", async () => {
      await kv.set(`${key}.set`, uuid)
      await expect(kv.has(`${key}.set`)).to.be.fulfilled.and.to.eventually.equal(true)
    })
    await t.step("registers key-value with expiration", async () => {
      await kv.set(`${key}.set.ttl`, uuid, { ttl: 50 })
      await expect(kv.has(`${key}.set.ttl`)).to.be.fulfilled.and.to.eventually.equal(true)
      await delay(100)
      await expect(kv.has(`${key}.set.ttl`)).to.be.fulfilled.and.to.eventually.equal(false)
    })
  })

  await t.step(".delete()", async (t) => {
    await t.step("deletes key-value", async () => {
      await kv.set(`${key}.delete`, uuid)
      await expect(kv.has(`${key}.delete`)).to.be.fulfilled.and.to.eventually.equal(true)
      await kv.delete(`${key}.delete`)
      await expect(kv.has(`${key}.delete`)).to.be.fulfilled.and.to.eventually.equal(false)
    })
  })

  await t.step(".close()", async (t) => {
    await t.step("closes the kv", async () => {
      const kv = await new KV(test.kv).ready
      expect(() => kv.close()).to.not.throw()
    })
  })

  kv.close()
})

Deno.test("KV() @ additional tests", { permissions: "none" }, async (t) => {
  const kv = new KV(`${test.kv}.ready`)
  kv.ready.catch(() => null)
  const key = "kv.test"

  await t.step("throws if kv is not ready", async () => {
    await expect(kv.has(key)).to.be.rejectedWith(MetricsError, /not ready/i)
    await expect(kv.get(key)).to.be.rejectedWith(MetricsError, /not ready/i)
    await expect(kv.set(key, uuid)).to.be.rejectedWith(MetricsError, /not ready/i)
    await expect(kv.delete(key)).to.be.rejectedWith(MetricsError, /not ready/i)
    await expect(() => kv.close()).to.throw(MetricsError, /not ready/i)
  })
})

// TODO(@lowlighter): change to `[dir.source]` after https://github.com/denoland/deno_std/pull/3692
Deno.test("Simulate non-deno environment", { permissions: { read: [test.file], env: [test.env] } }, async (t) => {
  testing.deno = false

  await t.step("inspect() is polyfilled", () => {
    const object = { foo: "bar" }
    expect(inspect(object)).to.include("foo").and.to.include("bar")
    expect(inspect(object)).to.not.equal(`${object}`)
    expect(inspect(0n)).to.equal("0")
  })
  await t.step("listen() is unsupported", () => {
    expect(() => listen({ port: test.port })).to.throw(MetricsError, /unsupported action/i)
  })

  await t.step("write() is a noop", async () => {
    await expect(write(test.file, uuid)).to.be.fulfilled
  })

  await t.step("read() is polyfilled for async", async () => {
    await expect(read(test.file)).to.be.a("promise").and.to.be.fulfilled.and.to.eventually.be.a("string")
    expect(() => read(test.file, { sync: true })).to.throw(MetricsError, /unsupported action/i)
  })

  await t.step("list() is unsupported", () => {
    expect(list(`${dir.source}/metrics/utils/*.ts`)).to.be.rejectedWith(MetricsError, /unsupported action/i)
  })

  await t.step("env.get() returns empty values", () => {
    expect(env.get(test.env)).to.equal("")
    expect(env.get(test.env, { boolean: true })).to.equal(false)
  })

  await t.step("env.set() is a noop", () => {
    expect(env.set(test.env, uuid))
    expect(env.get(test.env)).to.equal("")
  })

  await t.step("KV() is a unsupported", () => {
    expect(() => new KV(test.kv)).to.throw(MetricsError, /unsupported action/i)
  })

  testing.deno = true
})
