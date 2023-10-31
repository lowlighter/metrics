// Imports
import { throws } from "@engine/utils/errors.ts"

/** Inspect */
export function inspect(message: unknown, { json = false } = {}) {
  try {
    if (json) {
      throws()
    }
    return Deno.inspect(message, { colors: true, depth: Infinity, iterableLimit: 16, strAbbreviateSize: 120 })
  } catch {
    try {
      return JSON.stringify(message, null, 2)
    } catch {
      return `${message}`
    }
  }
}
