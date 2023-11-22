import { dir, expect, MetricsError, t } from "@engine/utils/testing.ts"
import { list, read, write } from "@engine/utils/deno/io.ts"
import { fromFileUrl } from "std/path/from_file_url.ts"

const uuid = crypto.randomUUID().slice(-12).toUpperCase()
const test = {
  file: `${dir.test}/io_test.${uuid}.txt`,
  kv: `${dir.test}/io_test_kv.${uuid}.kv`,
  env: `UNIT_TEST_${uuid}`,
  port: 9000,
}

Deno.test(t(import.meta, "`write()` can write a text file"), { permissions: { read: [dir.test], write: [dir.test] } }, async () => {
  await expect(write(test.file, uuid)).to.be.a("promise").and.to.be.fulfilled
})

Deno.test(t(import.meta, "`write()` can write a raw file"), { permissions: { read: [dir.test], write: [dir.test] } }, async () => {
  await expect(write(test.file, new TextEncoder().encode(uuid))).to.be.a("promise").and.to.be.fulfilled
})

Deno.test(t(import.meta, "`write()` ignores writing to `/dev/null`"), { permissions: "none" }, async () => {
  await expect(write("/dev/null", new TextEncoder().encode(uuid))).to.be.a("promise").and.to.be.fulfilled
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

Deno.test(t(import.meta, "`read()` converts `metrics://` scheme to `/source`"), { permissions: { read: [dir.source] } }, async () => {
  const url = fromFileUrl(import.meta.url).replaceAll("\\", "/")
  const expected = await read(url)
  const test = url.replace(dir.source, "metrics:/")
  await expect(read(test)).to.eventually.equal(expected)
  await expect(read(new URL(test))).to.eventually.equal(expected)
})

Deno.test(t(import.meta, "`list()` can list files in a directory"), { permissions: { read: [dir.source] } }, async () => {
  expect(await list(`${dir.source}/engine/utils/deno/*.ts`)).to.include.members(["io.ts", "io_test.ts"])
  expect(await list(`${dir.source}/*.ts`)).to.not.include.members(["io.ts", "io_test.ts"])
})
