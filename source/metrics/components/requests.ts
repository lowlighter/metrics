// Imports
import { Octokit } from "y/@octokit/rest@20.0.1"
import { paginateGraphql } from "y/@octokit/plugin-paginate-graphql@4.0.0"
import { RequestInterface } from "y/@octokit/types@11.1.0"
import { Internal, is } from "@metrics/components/internal.ts"
import { read } from "@utils/io.ts"
import { requests as schema } from "@metrics/config.ts"
import { version } from "@metrics/version.ts"
import { throws } from "@utils/errors.ts"

/** Plugin */
export class Requests extends Internal {
  /** Import meta */
  protected static readonly meta = import.meta

  /** Context */
  declare protected readonly context: is.infer<typeof schema>

  /** Constructor */
  constructor(meta: typeof Requests["meta"], context: Requests["context"]) {
    super(context)
    Object.assign(this, { meta })
    this.octokit = new (Octokit.plugin(paginateGraphql))({
      userAgent: `metrics/${version}`,
      auth: this.context.token?.read(),
      timeZone: this.context.timezone,
      baseUrl: this.context.api,
    })
  }

  /** Octokit SDK */
  private readonly octokit

  /** REST api (Note: always use `this.rest()` to perform queries in order for queries to be properly traced and mocked) */
  get api() {
    return this.octokit.rest
  }

  /** Perform a REST query */
  async rest<T extends RequestInterface>(endpoint: T, vars = {} as Parameters<T>[0], { paginate = false } = {}) {
    const { endpoint: { DEFAULTS: { method, url } } } = endpoint
    this.log.io(`calling rest query: ${method} ${url}`)
    if (this.context.mock) {
      try {
        const { default: mock } = await import(new URL("tests/rest.ts", this.meta.url).href)
        if (url! in mock) {
          this.log.debug(`mocking rest query: ${method} ${url}}`)
          return mock[url!](vars)
        }
      } catch (error) {
        console.log(error)
        this.log.warn(`rest query ${method} ${url} could not be mocked: ${error}`)
      }
    }
    if (paginate) {
      return this.octokit.paginate(endpoint, vars)
    }
    console.log(await endpoint(vars))
    return endpoint(vars)
  }

  /** Perform a GraphQL query */
  async graphql(name: string, vars = {} as Record<PropertyKey, unknown>, { paginate = false } = {}) {
    const path = new URL(`queries/${name}.graphql`, this.meta.url)
    const query = await read(path)
    this.log.io(`calling graphql query: ${name}`)
    if (this.context.mock) {
      try {
        const { default: mock } = await import(new URL(`tests/${name}.graphql.ts`, this.meta.url).href)
        this.log.debug(`mocking graphql query: ${name}`)
        return mock(vars)
      } catch (error) {
        this.log.warn(`graphql query ${name} could not be mocked: ${error}`)
      }
    }
    if (paginate) {
      if (!query.includes("pageInfo")) {
        throws(`Query is missing "pageInfo { hasNextPage, endCursor }" but pagination is enabled`)
      }
      return this.octokit.graphql.paginate(query, vars)
    }
    return this.octokit.graphql(query, vars)
  }

  /** Perform an HTTP query */
  async fetch(url: string | URL, { type = "text" as string, options = {} as Parameters<typeof fetch>[1] } = {}) {
    this.log.io(`calling http query: ${url}`)
    if ((this.context.mock) && (new URL(url).host.endsWith(".test"))) {
      try {
        const name = new URL(url).pathname.slice(1)
        const { default: mock } = await import(new URL(`tests/${name}.http.ts`, this.meta.url).href)
        this.log.debug(`mocking http query: ${name}`)
        return mock(options)
      } catch (error) {
        this.log.warn(`http query ${url} could not be mocked: ${error}`)
      }
    }
    const response = await fetch(url, options)
    switch (type) {
      case "json":
        return response.json()
      case "text":
        return response.text()
      default:
        return response
    }
  }

  /** Ratelimit */
  async ratelimit() {
    const { data: { resources: { core, search, graphql = { remaining: 0, limit: 0 }, ...others } } } = await this.octokit.rest.rateLimit.get()
    const { code_search: code } = others as { code_search: { remaining: number; limit: number } }
    this.log.io({
      core: `${core.remaining}/${core.limit}`,
      graphql: `${graphql.remaining}/${graphql.limit}`,
      search: `${search.remaining}/${search.limit}`,
      code: `${code.remaining}/${code.limit}`,
    })
    return { core: core.remaining, graphql: graphql.remaining, search: search.remaining, code: code.remaining }
  }
}
