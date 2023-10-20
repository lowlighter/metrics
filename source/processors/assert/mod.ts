// Imports
import { DOMParser } from "x/deno_dom@v0.1.38/deno-dom-wasm.ts"
import { Format } from "@utils/format.ts"
import { is, Processor, state } from "@engine/components/processor.ts"
import { expect } from "@utils/testing.ts"
import { throws } from "@utils/errors.ts"

/** Regexs */
const regexs = {
  count: /^(?<n>\d+)(?<op><|<=|=|>=|>|~)(?:(?<=~)(?<m>\d+))?$/,
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

  /** Supports */
  readonly supports = []

  /** Inputs */
  readonly inputs = is.object({
    error: is.boolean().default(false).describe("Assert previous content returned an error"),
    mime: is.string().optional(),
    html: is.object({
      select: is.string().default("main").describe("Query selector"),
      match: is.coerce.string().optional().describe("Assert element content match pattern (will be treated as regex if matching `/pattern/flags`, prefix with `/!` to negate regex matching)"),
      raw: is.boolean().default(false).describe("Use raw HTML instead of text content"),
      count: is.coerce.string().regex(regexs.count).optional().describe("Assert number of elements"),
    }).nullable().default(null).describe("HTML selection (mime must be either `application/xml`, `image/svg+xml` or `text/html`)"),
  })

  /** Action */
  protected async action(state: state) {
    const result = await this.piped(state)
    const { error, html, mime } = await this.inputs.parseAsync(this.context.args)
    if (typeof result.content !== "string") {
      if (error) {
        return
      }
      expect(result.content).to.be.a("string", "expected previous content to be successful")
    }
    if (mime) {
      expect(result.mime).to.include(mime)
    }
    if (!/(application\/xml)|(image\/svg\+xml)|(text\/html)/.test(result.mime)) {
      if (html) {
        throws(`html selection is only supported for mime type "application/xml", "image/svg+xml" or "text/html" (got "${result.mime}")`)
      }
      return
    }
    if (!html) {
      return
    }
    const { select, match, raw, count } = html
    const document = new DOMParser().parseFromString(Format.html(result.content), "text/html")
    const selected = [...document?.querySelectorAll(select) ?? []]
    if (typeof count === "string") {
      const captured = count.match(regexs.count)!.groups ?? {}
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

    for (const element of selected) {
      if (typeof match === "string") {
        const content = raw ? ((element.parentElement ?? element) as unknown as { innerHTML?: string }).innerHTML ?? "" : element.textContent
        if (regexs.match.test(match)) {
          const { negate = "", pattern = "", flags = "" } = match.match(regexs.match)!.groups ?? {}
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
