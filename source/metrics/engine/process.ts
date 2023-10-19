// Imports
import { Plugin } from "@engine/components/plugin.ts"
import { config as schema } from "@engine/config.ts"

/** Process metrics */
export async function process(_config: Record<PropertyKey, unknown>) {
  const config = await schema.parseAsync(_config)
  const pending = new Set<Promise<unknown>>()
  const state = await Plugin.state.parseAsync({ results: [], errors: [] })
  let result = undefined as typeof state.result

  // Process config
  for (const [tracker, plugin] of Object.entries(config.plugins)) {
    if ((plugin as { id?: string }).id) {
      pending.add(Plugin.run({ tracker, context: plugin, state }))
      continue
    }
    await Promise.all([...pending])
    const { result: _result } = await Plugin.run({ tracker, context: plugin, state })
    result = _result as any //TODO
    pending.clear()
  }
  const results = await Promise.all([...pending]) as Array<{ result: typeof state.result }>
  if (!result) {
    result = results.at(-1)?.result
  }

  return result ?? null
}
