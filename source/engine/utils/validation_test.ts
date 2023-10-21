import { expect } from "@engine/utils/testing.ts"
import { is, MetricsValidationError, parse, toSchema } from "@engine/utils/validation.ts"

Deno.test("parse()", { permissions: "none" }, async (t) => {
  const validator = is.object({ foo: is.string() })
  await t.step("validates and returns data (sync)", () => {
    expect(parse(validator, { foo: "bar" }, { sync: true })).to.deep.equal({ foo: "bar" })
    expect(() => parse(validator, { foo: true }, { sync: true })).to.throw(MetricsValidationError)
  })
  await t.step("validates and returns data (async)", () => {
    expect(parse(validator, { foo: "bar" }, { sync: false })).to.be.a("promise").and.to.be.eventually.deep.equal({ foo: "bar" })
    expect(parse(validator, { foo: true }, { sync: false })).to.be.a("promise").and.to.be.rejectedWith(MetricsValidationError)
  })
})

Deno.test("toSchema()", { permissions: "none" }, async (t) => {
  await t.step("returns a JSON schema", () => {
    expect(toSchema(is.object({ foo: is.string() }))).to.have.property("$schema")
  })
})
