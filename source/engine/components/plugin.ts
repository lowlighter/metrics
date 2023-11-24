// Imports
import { Component, is, parse, state } from "@engine/components/component.ts"
import { list, read } from "@engine/utils/deno/io.ts"
import { plugin as schema, plugin_nameless } from "@engine/config.ts"
import * as ejs from "y/ejs@3.1.9?pin=v133"
import { Requests } from "@engine/components/requests.ts"
import { Formatter } from "@engine/utils/format.ts"
import { basename } from "std/path/basename.ts"
import { Processor } from "@engine/components/processor.ts"
import { throws } from "@engine/utils/errors.ts"
import { RequestInterface } from "y/@octokit/types@11.1.0?pin=v133"

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
  protected rest<T extends RequestInterface>(endpoint: T, vars = {} as Parameters<T>[0], options = {} as Parameters<Requests["rest"]>[2]) {
    return this.requests.rest(endpoint, vars, options)
  }

  /** Perform a GraphQL query */
  protected graphql(...args: Parameters<Requests["graphql"]>) {
    return this.requests.graphql(...args)
  }

  /** Perform an HTTP query */
  protected fetch(...args: Parameters<Requests["fetch"]>) {
    return this.requests.fetch(...args)
  }

  /** EJS template additional rendering context */
  protected _renderctx = {} as Record<PropertyKey, unknown>

  /** Render an EJS template */
  protected async render({ state }: { state: state }) {
    const name = this.context.template!
    const path = name.startsWith("metrics://") ? new URL(name) : new URL(`templates/${name}.ejs`, this.meta.url)
    const template = await read(path)
    const { data: args = {} } = await this.inputs.safeParseAsync(this.context.args) as { data?: Record<PropertyKey, unknown> }
    this.log.debug(`rendering template: ${name}`)
    return ejs.render(
      template,
      Object.assign(structuredClone(this.context), {
        args,
        result: state.result?.result ?? null,
        state,
        format: new Formatter(this.context),
        ...this._renderctx,
      }),
      {
        async: true,
        _with: true,
        context: null,
      },
    )
  }

  /** Is supported ? */
  protected supported() {
    if ((this.supports.length) && (!this.supports.includes(this.context.entity))) {
      throws(`${this.id} not supported for ${this.context.entity}`, { unrecoverable: true })
    }
  }

  /** Run component */
  protected async run(state: state) {
    const { result: raw, error } = await super.run(state)
    const result = { source: { id: this.id, index: 0 }, content: "", mime: "application/xml", base64: false, result: raw ?? error }
    state = { result, ...state }
    state.results.push(result)

    // Render content
    if (this.context.template) {
      result.content = await this.render({ state })
    }

    // Apply processors
    this.context.processors ??= []
    for (const [i, processor] of Object.entries(this.context.processors)) {
      this.log.debug(`running processor: ${processor.id}`)
      const tracker = Component.tracker in this.context ? `${this.context[Component.tracker]}[${i}]` : processor.id
      const processed = await Processor.run({ tracker, state, context: processor, plugin: this })
      if (processed.result) {
        Object.assign(result.result, processed.result)
      }
      if (processed.error) {
        state.result!.result = processed.error
        state.errors.push({ severity: "error", source: tracker, message: `${processed.error}` })
      }
    }

    return { result, error }
  }

  /** List templates */
  async templates() {
    return [...await list(`${(this.constructor as typeof Plugin).path}/${this.id}/templates/*.ejs`)].map((ejs) => basename(ejs).replace(/\.ejs$/, ""))
  }

  /** List plugins */
  static async list() {
    return [...await list(`${this.path}/**/mod.ts`)].map((mod) => mod.replace(/\/mod\.ts$/, ""))
  }

  /** Run component statically */
  static async run({ tracker, state, context }: { tracker?: string; state?: state; context: Record<PropertyKey, unknown> }) {
    state ??= await parse(this.state, { results: [], errors: [] })
    if (tracker) {
      Object.defineProperties(context, { [Component.tracker]: { enumerable: false, value: tracker } })
    }
    if (!context.id) {
      context.id = Plugin.nameless
    }
    return await super.run({ state, context: context as typeof context & { id: string } }) as unknown as ReturnType<Plugin["run"]>
  }

  /** Load component statically */
  static async load(context: Record<PropertyKey, unknown> & { id: string }) {
    if (!context.id) {
      context.id = Plugin.nameless
    }
    return await super.load(context) as Plugin
  }

  /** Plugins root path */
  protected static get path() {
    return `${super.path}/plugins`
  }

  /** Plugin that can be used without explicit naming */
  static readonly nameless = plugin_nameless
}

// Exports
export { is, parse }
export type { state }
