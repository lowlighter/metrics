import { dir, expect, MetricsError, t } from "@engine/utils/testing.ts"
import { env, inspect, KV, list, listen, read, testing, write } from "@engine/utils/io.ts"
import { delay } from "std/async/delay.ts"

const uuid = crypto.randomUUID().slice(-12).toUpperCase()
const test = {
  file: `${dir.test}/io_test.${uuid}.txt`,
  kv: `${dir.test}/io_test_kv.${uuid}.kv`,
  env: `UNIT_TEST_${uuid}`,
  port: 9000,
}

Deno.test(t(import.meta, "`inspect()` returns a representation of the value"), { permissions: "none" }, () => {
  const object = { foo: "bar" }
  expect(inspect(object)).to.be.a("string").and.not.equal(`${object}`)
})

Deno.test(t(import.meta, "`inspect()` is polyfilled in non-deno environments"), { permissions: "none" }, () => {
  testing.deno = false
  const object = { foo: "bar" }
  expect(inspect(object)).to.include("foo").and.to.include("bar")
  expect(inspect(object)).to.not.equal(`${object}`)
  expect(inspect(0n)).to.equal("0")
  testing.deno = true
})

Deno.test(t(import.meta, "`listen()` returns a listener to a local address"), { permissions: { net: [`0.0.0.0:${test.port}`] } }, () => {
  expect(() => listen({ port: test.port }).close()).not.to.throw()
})

Deno.test(t(import.meta, "`listen()` is unsupported in non-deno environments"), { permissions: "none" }, () => {
  testing.deno = false
  expect(() => listen({ port: test.port })).to.throw(MetricsError, /unsupported action/i)
  testing.deno = true
})

Deno.test(t(import.meta, "`writes()` can write a text file"), { permissions: { read: [dir.test], write: [dir.test] } }, async () => {
  await expect(write(test.file, uuid)).to.be.a("promise").and.to.be.fulfilled
})

Deno.test(t(import.meta, "`writes()` can write a raw file"), { permissions: { read: [dir.test], write: [dir.test] } }, async () => {
  await expect(write(test.file, new TextEncoder().encode(uuid))).to.be.a("promise").and.to.be.fulfilled
})

Deno.test(t(import.meta, "`write()` is a noop in non-deno environments"), { permissions: "none" }, async () => {
  testing.deno = false
  await expect(write(test.file, uuid)).to.be.fulfilled
  testing.deno = true
})

Deno.test(t(import.meta, "`read()` can read a raw file"), { permissions: { read: [dir.test] } }, async () => {
  await expect(read(test.file)).to.be.a("promise").and.to.be.fulfilled.and.to.eventually.be.a("string")
  expect(read(test.file, { sync: true })).to.be.a("string").and.to.equal(uuid)
})

Deno.test(t(import.meta, "`read()` can read a data url"), { permissions: "none" }, async () => {
  const data = `data:text/plain;base64,${btoa("hello")}`
  await expect(read(data)).to.be.a("promise").and.to.be.fulfilled.and.to.eventually.be.a("string")
  expect(() => read(data, { sync: true })).to.throw(MetricsError, /unsupported action/i)
})

Deno.test(t(import.meta, "`read()` is polyfilled for asynchronous read in non-deno environments"), { permissions: { read: [test.file] } }, async () => {
  testing.deno = false
  await expect(read(test.file)).to.be.a("promise").and.to.be.fulfilled.and.to.eventually.be.a("string")
  expect(() => read(test.file, { sync: true })).to.throw(MetricsError, /unsupported action/i)
  testing.deno = true
})

// TODO(@lowlighter): change to `[dir.source]` after https://github.com/denoland/deno_std/pull/3692
Deno.test(t(import.meta, "`list()` can list files in a directory"), { permissions: { read: true } }, async () => {
  expect(await list(`${dir.source}/engine/utils/*.ts`)).to.include.members(["io.ts", "io_test.ts"])
  expect(await list("*.ts")).to.not.include.members(["io.ts", "io_test.ts"])
})

Deno.test(t(import.meta, "`list()` is unsupported in non-deno environments"), { permissions: "none" }, async () => {
  testing.deno = false
  await expect(list(`${dir.source}/metrics/utils/*.ts`)).to.be.rejectedWith(MetricsError, /unsupported action/i)
  testing.deno = true
})

Deno.test(t(import.meta, "`env.get()` can read a env variable"), { permissions: { env: [test.env, `${test.env}_UNDEFINED`] } }, () => {
  env.set(test.env, uuid)
  expect(env.get(test.env)).to.equal(uuid)
  expect(env.get(`${test.env}_UNDEFINED`)).to.equal("")
})

Deno.test(t(import.meta, "`env.get()` returns a env variable as a boolean if asked"), { permissions: { env: [test.env] } }, () => {
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

Deno.test(t(import.meta, "`env.get()` returns empty values in non-deno environments"), { permissions: "none" }, () => {
  testing.deno = false
  expect(env.get(test.env)).to.equal("")
  expect(env.get(test.env, { boolean: true })).to.equal(false)
  testing.deno = true
})

Deno.test(t(import.meta, "`env.set()` can registers a env variable"), { permissions: { env: [test.env] } }, () => {
  expect(env.set(test.env, uuid))
  expect(env.get(test.env)).to.equal(uuid)
  expect(env.set(`${test.env}_FORBIDDEN`, uuid))
  expect(env.get(`${test.env}_FORBIDDEN`)).to.equal("")
})

Deno.test(t(import.meta, "`env.set()` is a noop in non-deno environments"), { permissions: "none" }, () => {
  testing.deno = false
  expect(env.set(test.env, uuid))
  expect(env.get(test.env)).to.equal("")
  testing.deno = true
})

Deno.test(t(import.meta, "`env.deployment` is a boolean"), { permissions: { env: [test.env, `${test.env}_UNDEFINED`] } }, () => {
  expect(env.deployment).to.be.a("boolean")
})

Deno.test(t(import.meta, "`env.actions` is a boolean"), { permissions: { env: [test.env, `${test.env}_UNDEFINED`] } }, () => {
  expect(env.actions).to.be.a("boolean")
})

{
  const key = "kv.test"
  const permissions = { read: [dir.test], write: [dir.test] }

  Deno.test(t(import.meta, "`KV.has()` returns `true` if key exists"), { permissions }, async () => {
    const kv = await new KV(test.kv).ready
    await kv.set(`${key}.has`, uuid)
    await expect(kv.has(`${key}.has`)).to.be.fulfilled.and.to.eventually.equal(true)
    kv.close()
  })

  Deno.test(t(import.meta, "`KV.has()` returns `false` if key doesn't exists"), { permissions }, async () => {
    const kv = await new KV(test.kv).ready
    await expect(kv.has(`${key}.has.not`)).to.be.fulfilled.and.to.eventually.equal(false)
    kv.close()
  })

  Deno.test(t(import.meta, "`KV.get()` returns value if key exists"), { permissions }, async () => {
    const kv = await new KV(test.kv).ready
    await kv.set(`${key}.get`, uuid)
    await expect(kv.get(`${key}.get`)).to.be.fulfilled.and.to.eventually.equal(uuid)
    kv.close()
  })

  Deno.test(t(import.meta, "`KV.get()` returns `null` if key doesn't exists"), { permissions }, async () => {
    const kv = await new KV(test.kv).ready
    await expect(kv.get(`${key}.get.not`)).to.be.fulfilled.and.to.eventually.equal(null)
    kv.close()
  })

  Deno.test(t(import.meta, "`KV.set()` can register a key-value"), { permissions }, async () => {
    const kv = await new KV(test.kv).ready
    await kv.set(`${key}.set`, uuid)
    await expect(kv.has(`${key}.set`)).to.be.fulfilled.and.to.eventually.equal(true)
    kv.close()
  })

  Deno.test(t(import.meta, "`KV.set()` can register a key-value with expiration"), { permissions }, async () => {
    const kv = await new KV(test.kv).ready
    await kv.set(`${key}.set.ttl`, uuid, { ttl: 50 })
    await expect(kv.has(`${key}.set.ttl`)).to.be.fulfilled.and.to.eventually.equal(true)
    await delay(100)
    await expect(kv.has(`${key}.set.ttl`)).to.be.fulfilled.and.to.eventually.equal(false)
    kv.close()
  })

  Deno.test(t(import.meta, "`KV.delete()` deletes key-value"), { permissions }, async () => {
    const kv = await new KV(test.kv).ready
    await kv.set(`${key}.delete`, uuid)
    await expect(kv.has(`${key}.delete`)).to.be.fulfilled.and.to.eventually.equal(true)
    await kv.delete(`${key}.delete`)
    await expect(kv.has(`${key}.delete`)).to.be.fulfilled.and.to.eventually.equal(false)
    kv.close()
  })

  Deno.test(t(import.meta, "`KV.close()` closes the kvn"), { permissions }, async () => {
    const kv = await new KV(test.kv).ready
    expect(() => kv.close()).to.not.throw()
  })

  Deno.test(t(import.meta, "`KV.*()` throws if kv is not ready"), { permissions: "none" }, async () => {
    const kv = new KV(`${test.kv}.ready`)
    kv.ready.catch(() => null)
    await expect(kv.has(key)).to.be.rejectedWith(MetricsError, /not ready/i)
    await expect(kv.get(key)).to.be.rejectedWith(MetricsError, /not ready/i)
    await expect(kv.set(key, uuid)).to.be.rejectedWith(MetricsError, /not ready/i)
    await expect(kv.delete(key)).to.be.rejectedWith(MetricsError, /not ready/i)
    await expect(() => kv.close()).to.throw(MetricsError, /not ready/i)
  })
}

Deno.test(t(import.meta, "`KV()` is unsupported in non-deno environments"), { permissions: "none" }, () => {
  testing.deno = false
  expect(() => new KV(test.kv)).to.throw(MetricsError, /unsupported action/i)
  testing.deno = true
})
