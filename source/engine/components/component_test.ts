import { dir, expect, is, t } from "@engine/utils/testing.ts"
import { Component } from "@engine/components/component.ts"
import { Plugin } from "@engine/components/plugin.ts"

export default class TestComponent extends Component {
  static readonly meta = import.meta
  readonly name = "Test plugin"
  readonly category = "testing"
  readonly description = "Test plugin"
  readonly inputs = is.object({})
  readonly outputs = is.object({})
  protected async action() {}
  protected async supported() {}
  static get path() {
    return `${dir.source}/engine/components`
  }
}

Deno.test(t(import.meta, "`.icon` returns an emoji"), { permissions: "none" }, async () => {
  const plugin = await Plugin.load({ id: import.meta.url })
  expect(plugin.icon).to.equal("⏹️")
})

// TODO(@lowlighter): change to `[dir.source]` after https://github.com/denoland/deno_std/pull/3692
Deno.test(t(import.meta, "`.tests()` returns a list of tests"), { permissions: { read: true } }, async () => {
  const plugin = await Plugin.load({ id: import.meta.url })
  await expect(plugin.tests()).to.be.eventually.be.an("array")
})

Deno.test(t(import.meta, "`.tests()` returns an empty array if no tests are defined"), { permissions: { read: true } }, async () => {
  const plugin = await Plugin.load({ id: import.meta.url })
  Object.assign(plugin, { id: "__test__" })
  await expect(plugin.tests()).to.be.eventually.be.an("array")
})
