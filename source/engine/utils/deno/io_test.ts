import { dir, expect, MetricsError, nodeno, t } from "@engine/utils/testing.ts"
import { list, read, write } from "@engine/utils/deno/io.ts"
import { fromFileUrl } from "std/path/from_file_url.ts"

const uuid = crypto.randomUUID().slice(-12).toUpperCase()
const test = {
  file: `${dir.test}/io_test.${uuid}.txt`,
  kv: `${dir.test}/io_test_kv.${uuid}.kv`,
  env: `UNIT_TEST_${uuid}`,
  port: 9000,
}

Deno.test(t(import.meta, "`writes()` can write a text file"), { permissions: { read: [dir.test], write: [dir.test] } }, async () => {
  await expect(write(test.file, uuid)).to.be.a("promise").and.to.be.fulfilled
})

Deno.test(t(import.meta, "`writes()` can write a raw file"), { permissions: { read: [dir.test], write: [dir.test] } }, async () => {
  await expect(write(test.file, new TextEncoder().encode(uuid))).to.be.a("promise").and.to.be.fulfilled
})

Deno.test(
  t(import.meta, "`write()` is a noop in non-deno environments"),
  { permissions: "none" },
  nodeno(async () => {
    await expect(write(test.file, uuid)).to.be.fulfilled
  }, { with: { test, uuid } }),
)

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

Deno.test(
  t(import.meta, "`read()` is polyfilled for asynchronous read in non-deno environments"),
  { permissions: { read: [test.file] } },
  nodeno(async () => {
    await expect(read(test.file)).to.be.a("promise").and.to.be.fulfilled.and.to.eventually.be.a("string")
    expect(() => read(test.file, { sync: true })).to.throw(MetricsError, /unsupported action/i)
  }, { with: { test } }),
)

// TODO(@lowlighter): change to `[dir.source]` after https://github.com/denoland/deno_std/pull/3692
Deno.test(t(import.meta, "`list()` can list files in a directory"), { permissions: { read: true } }, async () => {
  expect(await list(`${dir.source}/engine/utils/deno/*.ts`)).to.include.members(["io.ts", "io_test.ts"])
  expect(await list("*.ts")).to.not.include.members(["io.ts", "io_test.ts"])
})

Deno.test(
  t(import.meta, "`list()` is unsupported in non-deno environments"),
  { permissions: "none" },
  nodeno(async () => {
    await expect(list(`${dir.source}/metrics/utils/*.ts`)).to.be.rejectedWith(MetricsError, /unsupported action/i)
  }),
)
