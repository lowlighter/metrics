// Imports
import { component as schema } from "@metrics/config.ts"
import { delay } from "std/async/delay.ts"
import { is, toSchema, Validator } from "@utils/validator.ts"
import { Internal } from "@metrics/components/internal.ts"
import { toFileUrl } from "std/path/to_file_url.ts"
import { formatValidationError, throws } from "@utils/errors.ts"
import { exists } from "std/fs/exists.ts"
import * as YAML from "std/yaml/mod.ts"
import { read } from "@utils/io.ts"

/** Component */
export abstract class Component extends Internal {
  /** Import meta */
  protected static readonly meta = import.meta

  /** Context */
  declare protected readonly context: is.infer<typeof schema>

  /** Name */
  abstract readonly name: string

  /** Category */
  abstract readonly category: string

  /** Description */
  abstract readonly description: string

  /** Inputs */
  abstract readonly inputs: Validator

  /** Ouputs */
  abstract readonly outputs: Validator

  /** Scopes */
  readonly scopes = [] as string[]

  /** Supports */
  readonly supports = [] as string[]

  /** Icon */
  get icon() {
    return this.name.match(/(\p{Emoji_Presentation}+)/gu)?.[0] ?? "⏹️"
  }

  /** Action */
  protected abstract action(state: state): Promise<unknown>

  /** Is supported ? */
  protected abstract supported(): void

  /** Run component */
  protected async run(state: state) {
    this.log.info("execution started")
    await Component.state.parseAsync(state)
    this.log.trace(this.context)
    let result = null, error = null, recoverable = true
    for (let attempt = 1; attempt <= (this.context.retries?.attempts ?? 1); attempt++) {
      if (attempt > 1) {
        this.log.message(`attempt ${attempt} of ${this.context.retries.attempts}`)
      }
      try {
        // Ensure component is supported for current context
        try {
          this.supported()
        } catch (error) {
          recoverable = false
          throw error
        }
        // Run component action
        result = await this.outputs.parseAsync(await this.action(state) ?? {})
      } catch (caught) {
        error = caught
        // Handle validation errors
        if (error instanceof is.ZodError) {
          recoverable = false
          error = formatValidationError(error)
        }
      }
      // Handle general errors
      if (error) {
        this.log.warn(`attempt ${attempt} failed`)
        this.log.warn(error)
        // Retry on recoverable errors
        if (recoverable && (this.context.retries.delay) && (attempt < this.context.retries.attempts)) {
          this.log.warn(`next attempt in ${this.context.retries.delay}s`)
          await delay(this.context.retries.delay * 1000)
          continue
        }
        // Handle fatal errors
        if (!recoverable) {
          this.log.error(`error is not recoverable`)
        }
        if (this.context.fatal) {
          this.log.error("execution failed")
          this.log.error(error)
          throw error
        }
        this.log.warn("execution failed")
      }
      this.log.success("execution completed")
      break
    }
    return { result, error }
  }

  /** List tests */
  async tests(path: string) {
    if (!await exists(path)) {
      return []
    }
    const content = await read(path)
    return YAML.parse(content) as Array<is.infer<typeof schema>>
  }

  /** Load component statically */
  static async load(context: Record<PropertyKey, unknown> & { id: string }) {
    const url = context.id.startsWith("https://") ? new URL(context.id) : toFileUrl(`${this.path}/${context.id}/mod.ts`)
    const { default: Module } = await import(url.href)
    if (!Module) {
      throws(`${this.name} ${context.id} could not be loaded`)
    }
    return new Module(context)
  }

  /** Run component statically */
  static async run({ state, context }: { state: state; context: Record<PropertyKey, unknown> & { id: string } }) {
    const component = await this.load(context)
    return component.run(state)
  }

  /** Result */
  static readonly result = is.object({
    content: is.string(),
    mime: is.string(),
    base64: is.boolean(),
    result: is.union([is.record(is.unknown()), is.instanceof(Error)]),
  })

  /** State */
  static readonly state = is.object({
    result: Component.result.optional(),
    results: is.array(Component.result),
    errors: is.array(is.object({
      source: is.string(),
      message: is.string(),
      severity: is.enum(["error", "warning"]),
    })),
  })

  /** Metadata */
  protected get metadata() {
    return {
      id: this.id,
      icon: this.icon,
      name: this.name,
      category: this.category,
      description: this.description,
      scopes: this.scopes,
      supports: this.supports,
      inputs: toSchema(this.inputs),
      outputs: toSchema(this.outputs),
    }
  }
}

/** State */
export type state = is.infer<typeof Component["state"]>

// Exports
export { is, toSchema }
