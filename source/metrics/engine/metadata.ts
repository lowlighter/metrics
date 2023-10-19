//Imports
import { is, Plugin } from "@engine/components/plugin.ts"
import { Processor } from "@engine/components/processor.ts"
import { cli, server, webrequest } from "@metrics/config.ts"
import { version } from "@metrics/version.ts"

/** Metadata */
export async function metadata() {
  const metadata = {
    version,
    plugins: [] as Record<PropertyKey, unknown>[],
    processors: [] as Record<PropertyKey, unknown>[],
    cli: cli.omit({ config: true }),
    server: server.omit({ config: true }),
    webrequest: webrequest.extend({
      plugins: is.array(
        webrequest.shape.plugins._def.innerType._def.type.omit({ id: true, args: true }).extend({
          processors: is.array(webrequest.shape.plugins._def.innerType._def.type.shape.processors._def.innerType._def.type.omit({ id: true, args: true })),
        }),
      ),
    }),
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
