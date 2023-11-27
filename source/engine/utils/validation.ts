//Imports
import { z as is } from "x/zod@v3.21.4/mod.ts"
import { zodToJsonSchema } from "y/zod-to-json-schema@3.21.4?pin=v133"
import { fromZodError } from "y/zod-validation-error@1.5.0?pin=v133"
import { MetricsError } from "@engine/utils/errors.ts"

/** Validator */
export type Validator<T extends is.ZodRawShape = is.ZodRawShape> = is.ZodObject<T>

/** Deep partial */
export type DeepPartial<T> = T extends object ? { [P in keyof T]?: DeepPartial<T[P]> } : T

/** Validation error */
export class MetricsValidationError extends MetricsError {
  constructor(error: is.ZodError) {
    super(`${fromZodError(error)}`, { unrecoverable: true })
  }
}

/** Parse input (sync) */
function _parse<T extends Validator>(input: T, vars: unknown) {
  const result = input.safeParse(vars)
  if (!result.success) {
    throw new MetricsValidationError(result.error)
  }
  return result.data
}
/** Parse input (async) */
async function _parseAsync<T extends Validator>(input: T, vars: unknown) {
  const result = await input.safeParseAsync(vars)
  if (!result.success) {
    throw new MetricsValidationError(result.error)
  }
  return result.data
}

/** Parse input */
export function parse<T extends Validator>(input: T, vars: unknown, options: { sync: true }): is.infer<T>
export function parse<T extends Validator>(input: T, vars: unknown, options?: { sync?: false }): Promise<is.infer<T>>
export function parse<T extends Validator>(input: T, vars: unknown, { sync = false } = {}) {
  return sync ? _parse(input, vars) : _parseAsync(input, vars)
}

/** Schema */
export function toSchema(validator: Validator) {
  const schema = zodToJsonSchema(validator as unknown as Parameters<typeof zodToJsonSchema>[0], { $refStrategy: "none" })

  // Transform secrets
  transform(schema as schema, (_, value) => (Array.isArray(value.anyOf))&&(value.anyOf.length === 2)&&(!Object.keys(value.anyOf[0]).length)&&(!Object.keys(value.anyOf[1]).length), (_, value) => {
    delete value.anyOf
    return {...value, type: "string", writeOnly: true}
  })

  return schema
}

/** Schema type */
type schema = { anyOf?: schema[], properties?: Record<string, schema>, [key:string]: unknown}

/** Schema transforms */
function transform(schema:schema, predicate: (path:string[], value: schema) => boolean, transformer:(path:string[], value: schema) => schema, path = [] as string[]) {
  if (predicate(path, schema)) {
    Object.assign(schema[path.at(-1)!] ?? schema, transformer(path, schema))
  }
  if (Array.isArray(schema.anyOf)) {
    schema.anyOf.forEach(value => transform(value, predicate, transformer, path))
    return
  }
  if (schema.properties) {
    for (const [key, value] of Object.entries(schema.properties)) {
      transform(value, predicate, transformer, [...path, key])
    }
  }
}

// Exports
export { is }
