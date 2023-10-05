// Imports
import { Logger } from "@utils/log.ts"
import { internal as schema } from "@metrics/config.ts"
import { is, toSchema } from "@utils/validator.ts"
import { fromFileUrl } from "std/path/from_file_url.ts"
import { toFileUrl } from "std/path/to_file_url.ts"

/** Component root path */
const path = fromFileUrl(new URL("../..", import.meta.url)).replaceAll("\\", "/").replace(/\/$/, "")

/** Internal component */
export abstract class Internal {
  /** Import meta */
  protected static readonly meta = import.meta

  /** Import meta */
  protected readonly meta

  /** Logger */
  protected readonly log

  /** Context */
  protected readonly context

  /** Identifier */
  readonly id

  /** Constructor */
  protected constructor(context: is.infer<typeof schema>) {
    const constructor = this.constructor as typeof Internal
    const tags = {} as Record<PropertyKey, unknown>
    this.meta = constructor.meta
    this.id = this.meta.url.replace(toFileUrl(constructor.path).href, "").replace(/\/mod\.ts$/, "").replace(/^\//, "")
    this.context = context ?? {}
    if (Internal.tracker in this.context) {
      tags[Internal.tracker] = this.context[Internal.tracker]
    }
    this.log = new Logger(this.meta, { level: this.context.logs, tags })
  }

  /** Component root path */
  protected static get path() {
    return path
  }

  /** Internal tracker symbol */
  protected static readonly tracker = Symbol.for("@@tracker")
}

// Exports
export { is, toSchema }
