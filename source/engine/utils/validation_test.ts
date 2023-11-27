import { expect, t } from "@engine/utils/testing.ts"
import { is, MetricsValidationError, parse, toSchema } from "@engine/utils/validation.ts"
import {secret} from "@engine/config.ts"

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

Deno.test(t(import.meta, "`.toSchema()` to transform `Secret` to `{type:'string', writeOnly:true}`"), { permissions: "none" }, () => {
  const schema = is.object({ secret, foo: is.string(), nested:is.object({bar:is.string(), secret}), nullable:secret.nullable() })
  const expected = {
    properties: {
      secret: { type: "string", writeOnly: true },
      foo: { type: "string" },
      nested: {
        properties: {
          bar: { type: "string" },
          secret: { type: "string", writeOnly: true }
        }
      },
      nullable: {
        anyOf: [ { type: "string", writeOnly: true }, { type: "null" } ]
      }
    }
  }
  expect(toSchema(schema)).to.containSubset(expected)
})
