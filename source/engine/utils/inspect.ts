/** Inspect */
export function inspect(message: unknown) {
  try {
    return Deno.inspect(message, { colors: true, depth: Infinity, iterableLimit: 16, strAbbreviateSize: 120 })
  } catch {
    try {
      return JSON.stringify(message, null, 2)
    } catch {
      return `${message}`
    }
  }
}
