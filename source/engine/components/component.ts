// Imports
import type { component as schema, config } from "@engine/config.ts"
import { delay } from "std/async/delay.ts"
import type { Validator } from "@engine/utils/validation.ts"
import { Internal, is, parse, toSchema } from "@engine/components/internal.ts"
import { toFileUrl } from "std/path/to_file_url.ts"
import { MetricsError, throws } from "@engine/utils/errors.ts"
import { exists } from "std/fs/exists.ts"
import * as YAML from "std/yaml/parse.ts"
import { list, read } from "@engine/utils/deno/io.ts"
import * as dir from "@engine/paths.ts"
import { extract, test as hasfm } from "std/front_matter/yaml.ts"

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

  /** Permissions */
  readonly permissions = [] as string[]

  /** Icon */
  get icon() {
    return this.name.match(/([\p{Emoji}\u200d]+)/gu)?.[0] ?? "⏹️"
  }

  /** Action */
  protected abstract action(state: state): Promise<unknown>

  /** Is supported ? */
  protected abstract supported(state: state): Promise<void> | void

  /** Run component */
  protected async run(state: state) {
    this.log.info("execution started")
    await parse(Component.state, state)
    this.log.trace(this.context)
    let result = undefined, error = null, recoverable = true
    for (let attempt = 1; attempt <= (this.context.retries?.attempts ?? 1); attempt++) {
      if (attempt > 1) {
        this.log.message(`attempt ${attempt} of ${this.context.retries.attempts}`)
      }
      try {
        // Run component action
        await this.supported(state)
        result = await parse(this.outputs, await this.action(state) ?? {})
      } catch (caught) {
        error = caught
        // Handle unrecoverable errors
        if ((error instanceof MetricsError) && (error[MetricsError.unrecoverable as keyof MetricsError])) {
          recoverable = false
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
  async tests() {
    const path = `${(this.constructor as typeof Component).path}/${this.id}/tests/list.yml`
    if (!await exists(path)) {
      return []
    }
    const content = await read(path)
    return YAML.parse(content) as Array<is.infer<typeof config> & { name: string }>
  }

  /** List documentations */
  docs() {
    const path = `${(this.constructor as typeof Component).path}/${this.id}/docs`
    return list(`${path}/*.md`, { sync: true }).map((file) => {
      const raw = read(`${path}/${file}`, { sync: true })
      if (hasfm(raw)) {
        const { attrs: { title = file, type }, body: content } = extract(raw)
        return { title, content, ...(type ? { type } : {}) }
      }
      return { title: file, content: raw }
    })
  }

  /** Load component statically */
  static async load(context: Record<PropertyKey, unknown> & { id: string }) {
    let error = null
    const url = /^(https?|file):/.test(context.id)
      ? new URL(context.id)
      : context.id.startsWith("metrics://")
      ? toFileUrl(context.id.replace("metrics:/", dir.source))
      : toFileUrl(`${this.path}/${context.id}${context.id.endsWith("_test.ts") ? "" : "/mod.ts"}`)
    const { default: Module } = await import(url.href).catch((reason) => (error = reason, {}))
    if (!Module) {
      throws(`${this.name} ${context.id} could not be loaded (${error})`)
    }
    return new Module(context) as Component
  }

  /** Run component statically */
  static async run({ state, context }: { state: state; context: Record<PropertyKey, unknown> & { id: string } }) {
    const component = await this.load(context)
    return component.run(state)
  }

  /** Result */
  static readonly result = is.object({
    source: is.object({
      id: is.string().nullable(),
      index: is.number(),
    }),
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
  get metadata() {
    return {
      id: this.id,
      icon: this.icon,
      name: this.name,
      category: this.category,
      description: this.description,
      scopes: this.scopes,
      supports: this.supports,
      permissions: this.permissions,
      inputs: toSchema(this.inputs),
      outputs: toSchema(this.outputs),
      docs: this.docs(),
    }
  }
}

/** State */
export type state = is.infer<typeof Component["state"]>

// Exports
export { is, parse, toSchema }
