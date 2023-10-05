//Imports
import { z as is } from "x/zod@v3.21.4/mod.ts"
import { zodToJsonSchema } from "y/zod-to-json-schema@3.21.4"

/** Validator */
export type Validator<T extends is.ZodRawShape = is.ZodRawShape> = is.ZodObject<T>

/** Schema */
export function toSchema(validator: Validator) {
  return zodToJsonSchema(validator as unknown as Parameters<typeof zodToJsonSchema>[0])
}

// Exports
export { is }
