// Imports
import { DOMParser } from "x/deno_dom@v0.1.38/deno-dom-wasm.ts"
import { Format } from "@utils/format.ts"
import { is, Processor, state } from "@processor"
import { assert, assertMatch, assertNotMatch, assertStrictEquals, assertStringIncludes } from "@testing"

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
  readonly supports = ["application/xml", "image/svg+xml"]

  /** Inputs */
  readonly inputs = is.object({
    select: is.string().default("main").describe("Query selector"),
    match: is.coerce.string().optional().describe("Assert element content match pattern (will be treated as regex if matching `/pattern/flags`, prefix with `/!` to negate regex matching)"),
    html: is.boolean().default(false).describe("Use raw HTML instead of text content"),
    count: is.coerce.string().regex(regexs.count).optional().describe("Assert number of elements"),
    error: is.boolean().default(false).describe("Assert previous content returned an error"),
    mime: is.string().optional(),
  })

  /** Action */
  protected async action(state: state) {
    const result = await this.piped(state)
    const { count, select, match, error, html, mime } = await this.inputs.parseAsync(this.context.args)
    if (typeof result.content !== "string") {
      if (error) {
        return
      }
      assert(false, `expected previous content to be successful`)
    }
    if (mime && (!result.mime.includes(mime))) {
      assert(false, `expected previous content to be ${mime} (got ${result.mime})`)
    }
    const document = new DOMParser().parseFromString(Format.html(result.content), "text/html")
    const selected = [...document?.querySelectorAll(select) ?? []]
    if (typeof count === "string") {
      const captured = count.match(regexs.count)!.groups ?? {}
      const n = Number(captured.n)
      const m = Number(captured.m)
      const op = captured.op || "="
      switch (op) {
        case "<":
          assert(selected.length < n, `expected less than ${n} elements (got ${selected.length})`)
          break
        case "<=":
          assert(selected.length <= n, `expected less than ${n} elements (got ${selected.length})`)
          break
        case ">":
          assert(selected.length > n, `expected more than ${n} elements (got ${selected.length})`)
          break
        case ">=":
          assert(selected.length >= n, `expected more than ${n} elements (got ${selected.length})`)
          break
        case "=":
          assertStrictEquals(selected.length, n, `expected ${n} elements (got ${selected.length})`)
          break
        case "~":
          assert(Math.abs(selected.length - n) <= m, `expected ${n}±${m} elements (got ${selected.length})`)
          break
      }
      if ((op === "=") && (n === 0)) {
        return
      }
    }
    if (!selected.length) {
      assert(false, `expected at least one element to be present`)
    }

    for (const element of selected) {
      if (typeof match === "string") {
        const content = html ? ((element.parentElement ?? element) as unknown as { innerHTML?: string }).innerHTML ?? "" : element.textContent
        if (regexs.match.test(match)) {
          const { negate = "", pattern = "", flags = "" } = match.match(regexs.match)!.groups ?? {}
          const regex = new RegExp(pattern, flags)
          if (negate) {
            assertNotMatch(content, regex, `${content.trim()} match ${regex} but should not`)
          } else {
            assertMatch(content, regex, `${content.trim()} does not match ${regex}`)
          }
        } else {
          assertStringIncludes(content, match, `${content.trim()} does not include ${match}`)
        }
      }
    }
  }
}
