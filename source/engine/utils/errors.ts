/** Metrics error */
export class MetricsError extends Error {
  /** Is unrecoverable error */
  readonly unrecoverable

  /** Constructor */
  constructor(message?: string, { unrecoverable = false } = {}) {
    super(message)
    //this.stack = ""
    this.unrecoverable = unrecoverable
  }
}

/** Throws an error */
export function throws(message?: string, options?: ConstructorParameters<typeof MetricsError>[1]): never {
  throw new MetricsError(message, options)
}
