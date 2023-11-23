// Imports
import { is, parse, Plugin } from "@engine/components/plugin.ts"
// <% if (use.webscraping) { %>
import { Browser } from "@engine/utils/browser.ts"
import { Format } from "@engine/utils/format.ts"
// <% } %>

/** Plugin */
export default class extends Plugin {
  /** Import meta */
  static readonly meta = import.meta

  /** Name */
  readonly name = "<%= icon %> <%= name %>"

  /** Category */
  readonly category = "<%= category %>"

  /** Description */
  readonly description = "<%= description %>"

  /** Supports */
  readonly supports = [/***<%- supports.map(entity => `"${entity}"`).join(", ") %>*/]

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

  /** Action */
  protected async action() {
    const { handle, entity } = this.context
    const { foo } = await parse(this.inputs, this.context.args)
    const result = { foo }

    // <% if (use.graphql) { %>
    // GraphQL API example
    const { entity: { name } } = await this.graphql("example", { login: handle, entity })
    Object.assign(result, { graphql: { name } })
    // <% } %>

    // <% if (use.rest) { %>
    // REST API example
    const zen = await this.rest(this.api.meta.getZen)
    Object.assign(result, { rest: { zen } })
    // <% } %>

    // <% if (use.fetch) { %>
    // Fetch example
    const fetched = await this.fetch("https://metrics.test/example", { type: "json", options: { method: "GET" } })
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
