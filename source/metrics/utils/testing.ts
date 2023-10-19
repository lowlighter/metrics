// Imports
import { is, parse } from "@utils/validation.ts"
import { Logger } from "@utils/log.ts"
import chai from "y/chai@4.3.10"
import chaiSubset from "y/chai-subset@1.6.0"
import chaiAsPromised from "y/chai-as-promised@7.1.1"

/** Logger */
export const log = new Logger(import.meta)

/** Mock utility (first argument is the expected input, and second a mock function called with parsed input that return mocked output) */
export function mock<T extends is.ZodRawShape>(input: T, data: (vars: is.infer<is.ZodObject<T>>) => unknown) {
  return function (vars: Record<PropertyKey, unknown>) {
    return data(parse(is.object(input), vars, { sync: true }))
  }
}

/** Chai assertions */
chai.config.truncateThreshold = 0
chai.config.showDiff = true
export const { expect } = chai.use(chaiSubset).use(chaiAsPromised)

/** Testing type */
// deno-lint-ignore no-explicit-any
export type test = any

// Exports
export { MetricsError } from "@utils/errors.ts"
export { is, MetricsValidationError } from "@utils/validation.ts"
export { Status } from "std/http/http_status.ts"
export { faker } from "y/@faker-js/faker@8.0.2"
