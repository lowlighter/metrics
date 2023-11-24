//Imports
import { Plugin } from "@engine/components/plugin.ts"
import { Processor } from "@engine/components/processor.ts"
import { cli, preset, server, webrequest } from "@engine/config.ts"
import { toSchema } from "@engine/utils/validation.ts"
import { version } from "@engine/version.ts"

/** Metadata */
export async function metadata() {
  const metadata = {
    version: version.number,
    plugins: [] as Record<PropertyKey, unknown>[],
    processors: [] as Record<PropertyKey, unknown>[],
    modes: {
      web: toSchema(webrequest.omit({ plugins: true })),
      actions: toSchema(cli.omit({ config: true })),
      server: toSchema(server.omit({ config: true })),
    },
    presets: {
      schema: toSchema(preset),
    },
  }

  // Populate plugins
  for (const id of await Plugin.list()) {
    const plugin = await Plugin.load({ id })
    metadata.plugins.push(plugin.metadata)
  }

  // Populate processors
  for (const id of await Processor.list()) {
    const processor = await Processor.load({ id })
    metadata.processors.push(processor.metadata)
  }

  return metadata
}
