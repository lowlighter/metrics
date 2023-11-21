/** Unrecoverable symbol */
const symbol = Symbol.for("@@unrecoverable")

/** Metrics error */
export class MetricsError extends Error {
  /** Internal tracker symbol */
  static readonly unrecoverable = symbol

  /** Is unrecoverable error */
  readonly [symbol] = false as boolean

  /** Constructor */
  constructor(message?: string, { unrecoverable = false } = {}) {
    super(message)
    this.stack = ""
    Object.defineProperty(this, symbol, { enumerable: false, value: unrecoverable })
  }
}

/** Throws an error */
export function throws(message?: string, options?: ConstructorParameters<typeof MetricsError>[1]): never {
  throw new MetricsError(message, options)
}
