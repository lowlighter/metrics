import { Formatter } from "@utils/format.ts"
import { expect } from "@utils/testing.ts"
import { DOMParser } from "x/deno_dom@v0.1.38/deno-dom-wasm.ts"

const format = new Formatter({ timezone: "Europe/Paris" })

Deno.test("Format()", { permissions: "none" }, async (t) => {
  await t.step(".date() formats date correctly", () => {
    expect(format.date("2020-01-01T00:00:00Z")).to.equal("1 Jan 2020")
    expect(format.date("2020-01-01T00:00:00Z", { year: undefined })).to.equal("1 Jan")
    expect(format.date("2020-01-01T00:00:00Z", { day: undefined, month: undefined })).to.equal("2020")
  })

  await t.step(".time() formats time correctly", () => {
    expect(format.time("2020-01-01T00:00:00Z")).to.equal("01:00:00")
  })

  await t.step(".number()", async (t) => {
    await t.step("formats numbers correctly", () => {
      expect(format.number(1)).to.equal("1")
      expect(format.number(1000)).to.equal("1k")
      expect(format.number(1024 ** 3, { format: "bytes" })).to.equal("1GiB")
    })

    await t.step("pluralize text correctly", () => {
      expect(format.number("cat", 1)).to.equal("1 cat")
      expect(format.number("cat", 1000)).to.equal("1k cats")
      expect(format.number("canary", 1)).to.equal("1 canary")
      expect(format.number("canary", 1000)).to.equal("1k canaries")
    })
  })

  await t.step(".html() wraps content in a valid html document", () => {
    const content = "<h1>Hello world</h1>"
    const result = format.html(content)
    const document = () => new DOMParser().parseFromString(result, "text/html")!
    expect(document).to.not.throw()
    expect(document().querySelector("main")!.innerHTML).to.equal(content)
  })
})
