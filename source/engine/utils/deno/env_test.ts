import { expect, t } from "@engine/utils/testing.ts"
import { env } from "@engine/utils/deno/env.ts"

const uuid = crypto.randomUUID().slice(-12).toUpperCase()
const test = {
  env: "METRIC_ENV_TEST",
  value: uuid,
}

Deno.test(t(import.meta, "`env.get()` can read a env variable"), { permissions: { env: [test.env, `${test.env}_UNDEFINED`] } }, () => {
  env.set(test.env, test.value)
  expect(env.get(test.env)).to.equal(test.value)
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

Deno.test(t(import.meta, "`env.set()` can registers a env variable"), { permissions: { env: [test.env] } }, () => {
  expect(env.set(test.env, test.value))
  expect(env.get(test.env)).to.equal(test.value)
  expect(env.set(`${test.env}_FORBIDDEN`, test.value))
  expect(env.get(`${test.env}_FORBIDDEN`)).to.equal("")
})

Deno.test(t(import.meta, "`env.deployment` is a boolean"), { permissions: { env: [test.env, `${test.env}_UNDEFINED`] } }, () => {
  expect(env.deployment).to.be.a("boolean")
})

Deno.test(t(import.meta, "`env.actions` is a boolean"), { permissions: { env: [test.env, `${test.env}_UNDEFINED`] } }, () => {
  expect(env.actions).to.be.a("boolean")
})
