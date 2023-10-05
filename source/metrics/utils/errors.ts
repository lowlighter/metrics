//Imports
import { is } from "@utils/validator.ts"

/** Throws an error */
export function throws(message?: string): never {
  throw Object.assign(new Error(message), { stack: "" })
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
