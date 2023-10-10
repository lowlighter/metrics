// Imports
export { faker } from "y/@faker-js/faker@8.0.2"
import { is } from "@utils/validator.ts"
import { Logger } from "@utils/log.ts"

/** Mock utility (first argument is the expected input, and second a mock function called with parsed input that return mocked output) */
export function mock<T extends is.ZodRawShape>(input: T, data: (vars: is.infer<is.ZodObject<T>>) => unknown) {
  return function (vars: Record<PropertyKey, unknown>) {
    return data(is.object(input).parse(vars))
  }
}

/** Logger */
export const log = new Logger(import.meta, { level: "trace" })

// Exports
export { is }
export * from "std/assert/mod.ts"
export * from "std/testing/bdd.ts"
export { Status } from "std/http/http_status.ts"
