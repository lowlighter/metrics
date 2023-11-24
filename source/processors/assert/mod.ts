// Imports
import { DOMParser } from "x/deno_dom@v0.1.38/deno-dom-wasm.ts"
import { Format } from "@engine/utils/format.ts"
import { is, parse, Processor, state } from "@engine/components/processor.ts"
import { expect } from "@engine/utils/testing.ts"
import { throws } from "@engine/utils/errors.ts"

/** Regexs */
const regexs = {
  count: /^(?<n>\d+)(?<op><|<=|=?|>=|>|~)(?:(?<=~)(?<m>\d+))?$/,
  match: /^\/(?<negate>!\/)?(?<pattern>[\s\S]+)\/(?<flags>\w*)$/,
}

/** Processor */
export default class extends Processor {
  /** Import meta */
  static readonly meta = import.meta

  /** Name */
  readonly name = "🧪 Assertions"

  /** Category */
  readonly category = "testing"

  /** Description */
  readonly description = "Assert selection matches specified criteria"

  /** Inputs */
  readonly inputs = is.object({
    error: is.union([
      is.boolean(),
      is.string(),
    ]).default(false).describe(
      "Assert previous content returned an error. If formatted as `/pattern/flags`, will be treated as regex (prefix with `/!` to negate match instead) (placeholder: `/foobar/i`)",
    ),
    mime: is.string().optional().describe("Assert mime type (e.g. `application/xml`)"),
    html: is.object({
      select: is.string().default("main").describe("HTML query selector"),
      match: is.string().optional().describe(
        "Assert selected content match pattern. If formatted as `/pattern/flags`, will be treated as regex (prefix with `/!` to negate match instead) (placeholder: `/foobar/i`)",
      ),
      raw: is.boolean().default(false).describe("Use raw HTML instead of text content"),
      count: is.coerce.string().regex(regexs.count).optional().describe("Assert number of elements. Supported operations are `<`, `<=`, `>`, `>=`, `=` and `~` (placeholder: `1>=`)"),
    }).nullable().default(null).describe("HTML operations (only applicable when mime type is either `application/xml`, `image/svg+xml` or `text/html`)"),
  })

  /** Action */
  protected async action(state: state) {
    const result = await this.piped(state)
    const { error, html, mime } = await parse(this.inputs, this.context.args)

    // Error assertions
    if (error) {
      expect(result.result).to.be.instanceOf(Error)
      if (typeof error === "string") {
        const content = `${result.result}`
        if (regexs.match.test(error)) {
          const { negate, pattern, flags } = error.match(regexs.match)!.groups!
          const regex = new RegExp(pattern, flags)
          if (negate) {
            expect(content).to.not.match(regex)
          } else {
            expect(content).to.match(regex)
          }
        } else {
          expect(content).to.include(error)
        }
      }
      return
    }
    expect(result.result).to.not.be.instanceOf(Error)

    // Mime assertions
    if (mime) {
      expect(result.mime).to.include(mime)
    }

    // HTML assertions
    if ((!html) || (!/(application\/xml)|(image\/svg\+xml)|(text\/html)/.test(result.mime))) {
      if (html) {
        throws(`html selection is only supported for mime type "application/xml", "image/svg+xml" or "text/html" (got "${result.mime}")`)
      }
      return
    }
    const { select, match, raw, count } = html
    const document = new DOMParser().parseFromString(Format.html(result.content), "text/html")
    const selected = [...document?.querySelectorAll(select) ?? []]

    // HTML content count assertions
    if (typeof count === "string") {
      const captured = count.match(regexs.count)!.groups!
      const n = Number(captured.n)
      const m = Number(captured.m)
      const op = captured.op || "="
      switch (op) {
        case "<":
          expect(selected.length).to.be.below(n)
          break
        case "<=":
          expect(selected.length).to.be.at.most(n)
          break
        case ">":
          expect(selected.length).to.be.above(n)
          break
        case ">=":
          expect(selected.length).to.be.at.least(n)
          break
        case "=":
          expect(selected.length).to.be.equal(n)
          break
        case "~":
          expect(selected.length).to.be.within(n - m, n + m)
          break
      }
      if ((op === "=") && (n === 0)) {
        return
      }
    }
    expect(selected.length).to.be.at.least(1, "expected at least one element to be present")

    // HTML content matching assertions
    for (const element of selected) {
      if (typeof match === "string") {
        const content = raw ? ((element.parentElement ?? element) as unknown as { innerHTML: string }).innerHTML : element.textContent
        if (regexs.match.test(match)) {
          const { negate, pattern, flags } = match.match(regexs.match)!.groups!
          const regex = new RegExp(pattern, flags)
          if (negate) {
            expect(content).to.not.match(regex)
          } else {
            expect(content).to.match(regex)
          }
        } else {
          expect(content).to.include(match)
        }
      }
    }
  }
}
