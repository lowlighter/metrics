// Imports
import { is, parse, Processor, state } from "@engine/components/processor.ts"
// <% if (use.webscraping) { %>
import { Browser } from "@engine/utils/browser.ts"
import { Format } from "@engine/utils/format.ts"
// <% } %>

/** Processor */
export default class extends Processor {
  /** Import meta */
  static readonly meta = import.meta

  /** Name */
  readonly name = "<%= icon %> <%= name %>"

  /** Category */
  readonly category = "<%= category %>"

  /** Description */
  readonly description = "<%= description %>"

  /** Supports */
  readonly supports = [/***<%- supports.map(format => `"${format}"`).join(", ") %>*/]

  // <% if ((use.webscraping)||(use.fetch)) { %>
  /** Permissions */
  readonly permissions = [/***<%- use.webscraping ? `"run:chrome", "write:tmp", "net:all"` : `"net:all"` %>*/]
  // <% } %>

  /** Inputs */
  readonly inputs = is.object({
    foo: is.string().default("bar").describe("Example input"),
  })

  /** Outputs */
  readonly outputs = is.object({
    foo: is.string().describe("Example output"),
    // <% if (use.graphql) { %>
    graphql: is.unknown().describe("Example graphql output"),
    // <% } if (use.rest) { %>
    rest: is.unknown().describe("Example rest output"),
    // <% } if (use.fetch) { %>
    fetch: is.unknown().describe("Example fetch output"),
    // <% } if (use.webscraping) { %>
    webscraping: is.unknown().describe("Example webscraping output"),
    // <% } %>
  })

  // <% if ((use.graphql)||(use.rest)||(use.fetch)) { %>
  /** Does this processor needs to perform requests ? */
  protected requesting = true
  // <% } %>

  /** Action */
  protected async action(state: state) {
    const result = await this.piped(state)
    const { handle, entity } = this.context.parent!
    const { foo } = await parse(this.inputs, this.context.args)

    // <% if (use.graphql) { %>
    // GraphQL API example
    const { entity: { name } } = await this.requests.graphql("example", { login: handle, entity })
    Object.assign(result, { graphql: { name } })
    // <% } %>

    // <% if (use.rest) { %>
    // REST API example
    const zen = await this.requests.rest(this.requests.api.meta.getZen)
    Object.assign(result, { rest: { zen } })
    // <% } %>

    // <% if (use.fetch) { %>
    // Fetch example
    const fetched = await this.requests.fetch("https://metrics.test/example", { type: "json", options: { method: "GET" } })
    Object.assign(result, { fetch: fetched })
    // <% } %>

    // <% if (use.webscraping) { %>
    // Web scraping example
    const page = await Browser.page({ log: this.log })
    try {
      await page.setContent(Format.html("<svg><text>Example</text></svg>"))
      const webscraping = await page.evaluate("dom://example.ts", { args: [foo] })
      Object.assign(result, { webscraping })
    } finally {
      await page.close()
    }
    // <% } %>

    return result
  }
}
