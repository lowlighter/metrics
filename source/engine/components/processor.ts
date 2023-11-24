// Imports
import { Component, is, parse, state } from "@engine/components/component.ts"
import type { processor as schema } from "@engine/config.ts"
import { list } from "@engine/utils/deno/io.ts"
import type { Plugin } from "@engine/components/plugin.ts"
import { Requests } from "@engine/components/requests.ts"
import { throws } from "@engine/utils/errors.ts"

/** Processor */
export abstract class Processor extends Component {
  /** Import meta */
  protected static readonly meta = import.meta

  /** Context */
  declare protected readonly context: is.infer<typeof schema> & { parent?: Record<PropertyKey, unknown> }

  /** Constructor */
  protected constructor(context: Processor["context"]) {
    super(context)
    if (this.context.parent) {
      Object.assign(this, { log: this.log.with({ handle: this.context.parent.handle, entity: this.context.parent.entity }) })
    }
    this.log.trace("instantiated")
  }

  /** Inputs */
  readonly inputs = is.object({})

  /** Outputs */
  readonly outputs = is.object({})

  /** Is supported ? */
  protected async supported(state: state) {
    const { mime } = await this.piped(state)
    if ((this.supports.length) && (!this.supports.includes(mime))) {
      throws(`${this.id} not supported for ${mime}`, { unrecoverable: true })
    }
  }

  /** Retrieve piped result */
  protected async piped(state: state) {
    await parse(Component.state.pick({ result: true }).required(), state)
    return state.result!
  }

  /** Requests */
  protected readonly requests = null as unknown as Requests

  /** Does this processor needs to perform requests ? */
  protected requesting = false

  /** List processors */
  static async list() {
    return [...await list(`${this.path}/**/mod.ts`)].map((mod) => mod.replace(/\/mod\.ts$/, ""))
  }

  /** Run component statically */
  static async run({ tracker, state, context, plugin }: { tracker?: string; state?: state; context: Record<PropertyKey, unknown> & { id: string }; plugin?: Plugin }) {
    state ??= await parse(this.state, { result: { source: { id: null, index: 0 }, content: "", mime: "application/octet-stream", base64: false, result: {} }, results: [], errors: [] })
    if (tracker) {
      Object.defineProperties(context, { [Component.tracker]: { enumerable: false, value: tracker } })
    }
    if (plugin) {
      Object.defineProperties(context, {
        [Processor.plugin]: { enumerable: false, value: plugin },
        parent: { enumerable: false, value: (plugin as unknown as { context: Record<PropertyKey, unknown> }).context },
      })
    }
    return super.run({ state, context: context as typeof context & { id: string } })
  }

  /** Load component statically */
  static async load(context: Record<PropertyKey, unknown> & { id: string }) {
    const processor = await super.load(context) as Processor
    if ((context[Processor.plugin]) && (processor.requesting)) {
      const parent = context[Processor.plugin] as { requests: { octokit: unknown }; context: Requests["context"] }
      const requests = Object.assign(new Requests(processor.meta, parent.context), { octokit: parent.requests.octokit })
      Object.assign(processor, { requests })
    }
    return processor
  }

  /** Plugin symbol */
  private static readonly plugin = Symbol.for("@@plugin")

  /** Processors root path */
  protected static get path() {
    return `${super.path}/processors`
  }
}

// Exports
export { is, parse }
export type { state }
