/** Runtime (internal, exported for testing purposes only) */
export const testing = {
  deno: !!globalThis.Deno,
}

/** Runtime */
const runtime = {
  get deno() {
    return testing.deno
  },
}

/** Inspect */
export function inspect(message: unknown) {
  if (!runtime.deno) {
    try {
      return JSON.stringify(message, null, 2)
    } catch {
      return `${message}`
    }
  }
  return Deno.inspect(message, { colors: true, depth: Infinity, iterableLimit: 16, strAbbreviateSize: 120 })
}
