// Imports
import { Plugin } from "@engine/components/plugin.ts"
import { config as schema } from "@engine/config.ts"
import { parse } from "@engine/utils/validation.ts"

/** Process metrics */
export async function process(_config: Record<PropertyKey, unknown>) {
  const config = await parse(schema, _config)
  const pending = new Set<Promise<unknown>>()
  const state = await parse(Plugin.state, { results: [], errors: [] })
  let result = undefined as typeof state.result

  // Process config
  for (const [tracker, plugin] of Object.entries(config.plugins)) {
    switch (plugin.id) {
      case Plugin.nameless: {
        await Promise.all([...pending])
        const { result: _result } = await Plugin.run({ tracker, context: plugin, state })
        result = _result
        pending.clear()
        continue
      }
      default: {
        pending.add(Plugin.run({ tracker, context: plugin, state }))
        continue
      }
    }
  }
  const results = await Promise.all([...pending]) as Array<{ result: typeof state.result }>
  if (!result) {
    result = results.at(-1)?.result
  }

  return result ?? null
}
