import { expect, t } from "@engine/utils/testing.ts"
import { Config } from "@run/compat/config.ts"

Deno.test(t(import.meta, "`.patch()` creates a deprecation warning and update content"), { permissions: "none" }, () => {
  const config = new Config()
  expect(config.patched).to.equal(false)
  config.patch("foo", { foo: true })
  expect(config.patched).to.equal(true)
  expect(config.content).to.deep.equal({ foo: true })
  config.patch(["bar"], { bar: true })
  expect(config.content).to.deep.equal({ foo: true, bar: true })
})

Deno.test(t(import.meta, "`.compat()` creates a warning and update content with legacy plugin"), { permissions: "none" }, () => {
  const config = new Config()
  expect(config.patched).to.equal(false)
  config.compat({ repositories: 50, plugin_foo: true, plugin_foo_x: true, plugin_bar: true }, ["plugin_foo", "plugin_foo_x"])
  expect(config.patched).to.equal(true)
  expect(config.content).to.deep.equal({ config: { plugins: [{ ".legacy": { inputs: { repositories: 50, plugin_foo: true, plugin_foo_x: true } } }] } })
  expect(config.report.messages[0].type).to.equal("unimplemented")
  expect(config.report.messages[0].message).to.include("`foo` plugin has not been migrated to v4 yet")
})
