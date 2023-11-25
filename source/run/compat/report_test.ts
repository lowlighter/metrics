import { expect, t } from "@engine/utils/testing.ts"
import { Report, yaml } from "@run/compat/report.ts"
import { Secret } from "@engine/utils/secret.ts"

for (const type of ["error", "warning", "info", "debug", "unimplemented"] as const) {
  Deno.test(t(import.meta, `\`.${type}()\` creates a new message in report`), { permissions: "none" }, () => {
    const report = new Report()
    expect(report.messages).to.be.empty
    report[type]("foo")
    expect(report.messages).to.have.lengthOf(1)
    expect(report.messages[0]).to.containSubset({ type, message: "foo" })
    expect(report.console()).to.include("foo")
  })
}

Deno.test(t(import.meta, `\`.flush()\` cleans all messages`), { permissions: "none" }, () => {
  const report = new Report()
  report.info("foo")
  expect(report.messages).to.have.lengthOf(1)
  report.flush()
  expect(report.messages).to.be.empty
})

Deno.test(t(import.meta, `\`.console()\` renders block and inline code`), { permissions: "none" }, () => {
  const report = new Report()
  report.info("`baz` and \n```yaml\nfoo: bar\n```")
  expect(report.console()).to.not.include("`")
})

Deno.test(t(import.meta, `\`.html()\` renders block and inline code`), { permissions: "none" }, async () => {
  const report = new Report()
  report.info("`baz` and \n```yaml\nfoo: bar\n```")
  const html = await report.html()
  expect(html).to.not.include("`")
  expect(html).to.include('<div class="info">')
})

Deno.test(t(import.meta, `\`yaml()\` format output`), { permissions: "none" }, () => {
  for (const inline of [false, true] as const) {
    expect(yaml({
      foo: "bar",
      bar: true,
      baz: new Secret(""),
      qux: null,
      quux: 42,
      quuz: [
        "foo",
        "bar",
      ],
      corge: "@",
    }, { inline })).to.not.be.empty
  }
})
