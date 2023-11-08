import { dir, expect, MetricsError, t } from "@engine/utils/testing.ts"
import { KV, listen } from "@engine/utils/deno/server.ts"
import { delay } from "std/async/delay.ts"

const uuid = crypto.randomUUID().slice(-12).toUpperCase()
const test = {
  kv: `${dir.test}/io_test_kv.${uuid}.kv`,
  value: uuid,
  port: 9000,
}
const key = "kv.test"
const permissions = { read: [dir.test], write: [dir.test] }

Deno.test(t(import.meta, "`KV.has()` returns `true` if key exists"), { permissions }, async () => {
  const kv = await new KV(test.kv).ready
  await kv.set(`${key}.has`, test.value)
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
  await kv.set(`${key}.get`, test.value)
  await expect(kv.get(`${key}.get`)).to.be.fulfilled.and.to.eventually.equal(test.value)
  kv.close()
})

Deno.test(t(import.meta, "`KV.get()` returns `null` if key doesn't exists"), { permissions }, async () => {
  const kv = await new KV(test.kv).ready
  await expect(kv.get(`${key}.get.not`)).to.be.fulfilled.and.to.eventually.equal(null)
  kv.close()
})

Deno.test(t(import.meta, "`KV.set()` can register a key-value"), { permissions }, async () => {
  const kv = await new KV(test.kv).ready
  await kv.set(`${key}.set`, test.value)
  await expect(kv.has(`${key}.set`)).to.be.fulfilled.and.to.eventually.equal(true)
  kv.close()
})

Deno.test(t(import.meta, "`KV.set()` can register a key-value with expiration"), { permissions }, async () => {
  const kv = await new KV(test.kv).ready
  await kv.set(`${key}.set.ttl`, test.value, { ttl: 50 })
  await expect(kv.has(`${key}.set.ttl`)).to.be.fulfilled.and.to.eventually.equal(true)
  await delay(100)
  await expect(kv.has(`${key}.set.ttl`)).to.be.fulfilled.and.to.eventually.equal(false)
  kv.close()
})

Deno.test(t(import.meta, "`KV.delete()` deletes key-value"), { permissions }, async () => {
  const kv = await new KV(test.kv).ready
  await kv.set(`${key}.delete`, test.value)
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
  await expect(kv.set(key, test.value)).to.be.rejectedWith(MetricsError, /not ready/i)
  await expect(kv.delete(key)).to.be.rejectedWith(MetricsError, /not ready/i)
  await expect(() => kv.close()).to.throw(MetricsError, /not ready/i)
})

Deno.test(t(import.meta, "`listen()` returns a listener to a local address"), { permissions: { net: [`0.0.0.0:${test.port}`] } }, async () => {
  const server = listen({ port: test.port }, () => new Response(null))
  await expect(server.shutdown()).to.be.fulfilled
})
