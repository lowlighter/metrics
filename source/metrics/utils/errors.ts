//Imports
import { is } from "@utils/validator.ts"

/** Metrics error */
export class MetricsError extends Error {
  /** Is unrecoverable error */
  readonly unrecoverable = false
}

/** Throws an error */
export function throws(message?: string, { unrecoverable = false } = {}): never {
  throw Object.assign(new MetricsError(message), { stack: "", unrecoverable })
}

/** Format Validation error */
export function formatValidationError(error: is.ZodError) {
  if (!(error instanceof is.ZodError)) {
    return error
  }
  const messages = []
  for (const { message, path } of error.errors) {
    messages.push(`${path.join(".")}: ${message}`)
  }
  return Object.assign(new Error(messages.join("\n")), { stack: "" })
}
