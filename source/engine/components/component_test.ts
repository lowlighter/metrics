import { dir, expect, is, MetricsError, t, throws } from "@engine/utils/testing.ts"
import { Component } from "@engine/components/component.ts"
import { parse } from "@engine/utils/validation.ts"

export default class TestComponent extends Component {
  static readonly meta = import.meta
  readonly name = "Test plugin"
  readonly category = "testing"
  readonly description = "Test plugin"
  readonly inputs = is.object({ error: is.boolean().default(false) })
  readonly outputs = is.object({ ok: is.boolean() })
  attempts = 0
  // deno-lint-ignore require-await
  protected async action() {
    this.attempts++
    if ((this.context.args.error) && (this.attempts < 2)) {
      throws("Expected error", { unrecoverable: !!this.context.args.unrecoverable })
    }
    return { ok: true }
  }
  protected async supported() {}
  static get path() {
    return `${dir.source}/engine/components`
  }
  constructor(args: Record<PropertyKey, unknown> = {}) {
    super({ logs: "none" })
    this.context.args = args
    this.context.retries = { attempts: args.retry ? 3 : 1, delay: 1 }
    this.context.fatal = args.fatal as boolean ?? false
  }
  async run() {
    const state = await parse(Component.state, { results: [], errors: [] })
    return super.run(state)
  }
}

Deno.test(t(import.meta, "`.icon` returns an emoji"), { permissions: "none" }, async () => {
  const component = await Component.load({ id: import.meta.url })
  expect(component.icon).to.equal("⏹️")
})

Deno.test(t(import.meta, "`.tests()` returns a list of tests"), { permissions: { read: [dir.source] } }, async () => {
  const component = await Component.load({ id: import.meta.url })
  await expect(component.tests()).to.be.eventually.be.an("array")
})

Deno.test(t(import.meta, "`.tests()` returns an empty array if no tests are defined"), { permissions: { read: [dir.source] } }, async () => {
  const component = await Component.load({ id: import.meta.url })
  Object.assign(component, { id: "__test__" })
  await expect(component.tests()).to.be.eventually.be.an("array")
})

Deno.test(t(import.meta, "`.run()` is able to return results"), { permissions: "none" }, async () => {
  const component = new TestComponent()
  await expect(component.run()).to.eventually.deep.equal({ result: { ok: true }, error: null })
})

Deno.test(t(import.meta, "`.run()` is able to return errors "), { permissions: "none" }, async () => {
  const component = new TestComponent({ error: true })
  const status = await component.run()
  await expect(status.result).to.be.undefined
  await expect(status.error).to.be.instanceOf(MetricsError, /expected error/i)
})

Deno.test(t(import.meta, "`.run()` retries on errors"), { permissions: "none" }, async () => {
  const component = new TestComponent({ error: true, retry: true })
  await expect(component.run()).to.be.eventually.be.ok.and.to.containSubset({ result: { ok: true } })
  await expect(component.attempts).to.equal(3)
})

Deno.test(t(import.meta, "`.run()` does not retry on unrecoverable errors"), { permissions: "none" }, async () => {
  const component = new TestComponent({ error: true, retry: true, unrecoverable: true })
  await expect(component.run()).to.be.eventually.be.ok.and.to.containSubset({ result: undefined })
  await expect(component.attempts).to.equal(1)
})

Deno.test(t(import.meta, "`.run()` throws on errors with `fatal:true`"), { permissions: "none" }, async () => {
  const component = new TestComponent({ error: true, fatal: true })
  await expect(component.run()).to.be.rejectedWith(MetricsError, /expected error/i)
})
