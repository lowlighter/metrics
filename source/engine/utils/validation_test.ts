import { expect, t } from "@engine/utils/testing.ts"
import { is, MetricsValidationError, parse, toSchema } from "@engine/utils/validation.ts"

const validator = is.object({ foo: is.string() })

Deno.test(t(import.meta, "`.parse()` validates and returns data synchronously"), { permissions: "none" }, () => {
  expect(parse(validator, { foo: "bar" }, { sync: true })).to.deep.equal({ foo: "bar" })
  expect(() => parse(validator, { foo: true }, { sync: true })).to.throw(MetricsValidationError)
})

Deno.test(t(import.meta, "`.parse()` can validate and returns data asynchronously"), { permissions: "none" }, async () => {
  await expect(parse(validator, { foo: "bar" }, { sync: false })).to.be.a("promise").and.to.be.eventually.deep.equal({ foo: "bar" })
  await expect(parse(validator, { foo: true }, { sync: false })).to.be.a("promise").and.to.be.rejectedWith(MetricsValidationError)
})

Deno.test(t(import.meta, "`.toSchema()` returns a JSON schema"), { permissions: "none" }, () => {
  expect(toSchema(is.object({ foo: is.string() }))).to.have.property("$schema")
})
