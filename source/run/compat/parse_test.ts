import { expect, t } from "@engine/utils/testing.ts"
import { parse } from "@run/compat/parse.ts"
import { Secret } from "@engine/utils/secret.ts"

Deno.test(t(import.meta, "`.boolean()` can parse booleans"), { permissions: "none" }, () => {
  expect(parse.boolean("true", {})).to.equal(true)
  expect(parse.boolean("yes", {})).to.equal(true)
  expect(parse.boolean("on", {})).to.equal(true)
  expect(parse.boolean("1", {})).to.equal(true)
  expect(parse.boolean("false", {})).to.equal(false)
  expect(parse.boolean("no", {})).to.equal(false)
  expect(parse.boolean("off", {})).to.equal(false)
  expect(parse.boolean("0", {})).to.equal(false)
  expect(parse.boolean("invalid", {})).to.equal(false)
  expect(parse.boolean("invalid", { default: "yes" })).to.equal(true)
})

Deno.test(t(import.meta, "`.number()` can parse numbers"), { permissions: "none" }, () => {
  expect(parse.number("1", {})).to.equal(1)
  expect(parse.number("1", { min: 2 })).to.equal(2)
  expect(parse.number("1", { max: 0 })).to.equal(0)
  expect(parse.number("invalid", { default: 0 })).to.equal(0)
})

Deno.test(t(import.meta, "`.string()` can parse strings"), { permissions: "none" }, () => {
  expect(parse.string("foo", { default: "" })).to.equal("foo")
})

Deno.test(t(import.meta, "`.string()` can parse strings restrained to a set of values"), { permissions: "none" }, () => {
  expect(parse.string("foo", { values: ["foo", "bar"], default: "" })).to.equal("foo")
  expect(parse.string("invalid", { values: ["foo", "bar"], default: "foo" })).to.equal("foo")
})

Deno.test(t(import.meta, "`.json()` can parse JSON"), { permissions: "none" }, () => {
  expect(parse.json('{"foo":true}', { default: "null" })).to.deep.equal({ foo: true })
  expect(parse.json("invalid", { default: "null" })).to.equal(null)
})

Deno.test(t(import.meta, "`.token()` returns a `Secret`"), { permissions: "none" }, () => {
  expect(parse.token("token")).to.be.instanceOf(Secret).and.to.have.property("empty", false)
  expect(parse.token("")).to.be.instanceOf(Secret).and.to.have.property("empty", true)
})

const separators = { "comma-separated": ",", "space-separated": " ", "newline-separated": "\n" }
for (const format of ["comma-separated", "space-separated", "newline-separated"] as const) {
  Deno.test(t(import.meta, `\`.array()\` can parse ${format} values`), { permissions: "none" }, () => {
    expect(parse.array(["foo", "bar"].join(separators[format]), { default: "", format })).to.deep.equal(["foo", "bar"])
  })
}

Deno.test(t(import.meta, `\`.array()\` removes invalid values`), { permissions: "none" }, () => {
  expect(parse.array("foo, bar, baz", { default: "", values: ["foo", "bar"], format: [] })).to.deep.equal(["foo", "bar"])
})

Deno.test(t(import.meta, `\`.array()\` can use default value`), { permissions: "none" }, () => {
  expect(parse.array(undefined, { default: "foo, bar", format: [] })).to.deep.equal(["foo", "bar"])
})

Deno.test(t(import.meta, "`parse()` can parse metrics v3.x syntax"), { permissions: { net: ["raw.githubusercontent.com"] } }, async () => {
  await expect(parse({
    base: "header, repositories",
    plugin_introduction: "yes",
    plugin_fortune: "yes",
  })).to.eventually.containSubset({
    base: ["header", "repositories"],
    plugin_introduction: true,
    plugin_fortune: true,
  })
})
