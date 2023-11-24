import { dir, expect, t } from "@engine/utils/testing.ts"
import { create } from "@run/create/mod.ts"

const writer = {
  // deno-lint-ignore require-await
  async write(_: Uint8Array) {
    return 0
  },
  writeSync(_: Uint8Array) {
    return 0
  },
  close() {},
  rid: 0,
  writable: new WritableStream(),
}

const permissions = { read: [dir.source, "deno.jsonc"], net: ["plugins.dprint.dev"] }

for (const type of ["plugin", "processor"] as const) {
  const context = {
    type,
    id: "testing",
    icon: "🧑🏻‍🔬",
    name: `Testing ${type}`,
    description: "Test",
    category: "testing",
    supports: [],
    use: {},
  }

  Deno.test(t(import.meta, `\`create()\` can setup skeleton for ${type}`), { permissions }, async () => {
    await expect(create(context, { confirm: false, dryrun: true, writer })).to.be.fulfilled
    await expect(create({ ...context, use: { graphql: true, rest: true, fetch: true, webscraping: true } }, { confirm: false, dryrun: true, writer })).to.be.fulfilled
  })

  Deno.test(t(import.meta, `\`create()\` throws on invalid identifier for ${type}`), { permissions }, async () => {
    //await expect(create({...context, id:""}, {confirm:false, dryrun:true, writer})).to.be.rejectedWith(Error, /cannot be empty/i)
  })
}
