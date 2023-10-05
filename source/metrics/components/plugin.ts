// Imports
import { Component, is, state } from "@metrics/components/component.ts"
import { list, read } from "@utils/io.ts"
import { plugin as schema, plugin_nop as schema_nop } from "@metrics/config.ts"
import * as ejs from "y/ejs@3.1.9"
import { Requests } from "@metrics/components/requests.ts"
import { Formatter } from "@utils/format.ts"
import { basename } from "std/path/basename.ts"
import { Processor } from "@processor"
import { throws } from "@utils/errors.ts"

/** Plugin */
export abstract class Plugin extends Component {
  /** Import meta */
  protected static readonly meta = import.meta

  /** Context */
  declare protected readonly context: is.infer<typeof schema>

  /** Constructor */
  protected constructor(context: Plugin["context"]) {
    super(context)
    this.requests = new Requests(this.meta, this.context)
    for (const log of [this, this.requests] as unknown as Array<{ log: Component["log"] }>) {
      Object.assign(log, { log: this.log.with({ handle: this.context.handle, entity: this.context.entity }) })
    }
    this.log.trace("instantiated")
  }

  /** Requests */
  protected readonly requests

  /** REST api (Note: always use `this.rest()` to perform queries in order for queries to be properly traced and mocked) */
  protected get api() {
    return this.requests.api
  }

  /** Perform a REST query */
  protected rest(...args: Parameters<Requests["rest"]>) {
    return this.requests.rest(...args)
  }

  /** Perform a GraphQL query */
  protected graphql(...args: Parameters<Requests["graphql"]>) {
    return this.requests.graphql(...args)
  }

  /** Perform an HTTP query */
  protected fetch(...args: Parameters<Requests["fetch"]>) {
    return this.requests.fetch(...args)
  }

  /** Ratelimit */
  protected ratelimit() {
    return this.requests.ratelimit()
  }

  /** Render an EJS template */
  protected async render({ state }: { state: state }) {
    const name = this.context.template
    const path = new URL(`templates/${name}.ejs`, this.meta.url)
    const template = await read(path)
    const { data: args = {} } = await this.inputs.safeParseAsync(this.context.args) as { data?: Record<PropertyKey, unknown> }
    this.log.debug(`rendering template: ${name}`)
    return ejs.render(template, Object.assign(structuredClone(this.context), { args, result: state.result?.result ?? null, state, format: new Formatter(this.context) }), {
      async: true,
      _with: true,
      context: null,
    })
  }

  /** Is supported ? */
  protected supported() {
    if (!this.supports.includes(this.context.entity)) {
      throws(`Not supported for ${this.context.entity}`)
    }
  }

  /** Run component */
  protected async run(state: state) {
    const { result: raw, error } = await super.run(state)
    const result = { content: "", mime: "application/xml", base64: false, result: raw ?? error }
    state = { result, ...state }
    state.results.push(result)

    // Render content
    if ((this.context.template) && (this.context.render)) {
      result.content = await this.render({ state })
    }

    // Apply processors
    for (const [i, processor] of Object.entries(this.context.processors)) {
      this.log.debug(`running processor: ${processor.id}`)
      const tracker = Component.tracker in this.context ? `${this.context[Component.tracker]}[${i}]` : processor.id
      const processed = await Processor.run({ tracker, state, context: processor, plugin: this })
      if (processed.result) {
        Object.assign(result.result, processed.result)
      }
      if (processed.error) {
        state.errors.push({ severity: "error", source: tracker, message: `${processed.error}` })
      }
    }

    return { result, error }
  }

  /** List tests */
  tests() {
    return super.tests(`${Plugin.path}/${this.id}/tests/list.yml`)
  }

  /** List templates */
  async templates() {
    return [...await list(`${Plugin.path}/${this.id}/templates/*.ejs`)].map((ejs) => basename(ejs).replace(/\.ejs$/, ""))
  }

  /** List plugins */
  static async list() {
    return [...await list(`${Plugin.path}/**/mod.ts`)].map((mod) => mod.replace(/\/mod\.ts$/, ""))
  }

  /** Run component statically */
  static run({ tracker, state, context }: { tracker?: string; state: state; context: Record<PropertyKey, unknown> }) {
    if (tracker) {
      Object.defineProperties(context, { [Component.tracker]: { enumerable: false, value: tracker } })
    }
    if (!context.id) {
      return new Plugin.NOP(context).run(state)
    }
    return super.run({ state, context: context as typeof context & { id: string } })
  }

  /** Plugins root path */
  protected static get path() {
    return `${super.path}/plugins`
  }

  /** Metadata */
  get metadata() {
    return super.metadata
  }

  /** NOP plugin */
  static readonly NOP = class extends Plugin {
    /** Import meta */
    protected static readonly meta = { ...import.meta, url: import.meta.url.replace(/\.ts$/, "@nop") }

    /** Name */
    readonly name = "🔳 NOP"

    /** Category */
    readonly category = "core"

    /** Description */
    readonly description = "No operation"

    /** Inputs */
    readonly inputs = is.object({})

    /** Outputs */
    readonly outputs = is.object({})

    /** Constructor */
    constructor(context = {} as Record<PropertyKey, unknown>, { meta = Plugin.NOP.meta } = {}) {
      super(schema_nop.parse(context) as Plugin["context"])
      Object.assign(this, { meta, id: "@nop" })
    }

    /** Is supported ? */
    protected supported() {}

    /** Action */
    protected action() {
      return Promise.resolve({})
    }

    /** Render an EJS template */
    render({ template, result, state }: { template: string; result: Record<PropertyKey, unknown>; state: state }) {
      this.context.template = template
      this.context.args = {}
      return super.render({ state: { ...state, result: { result } as unknown as typeof state["result"] } })
    }
  }
}

// Exports
export { is }
export type { state }
