// Imports
import { is, parse, Processor, state } from "@engine/components/processor.ts"
import { extension } from "std/media_types/extension.ts"
import { decodeBase64 } from "std/encoding/base64.ts"
import { write } from "@engine/utils/deno/io.ts"

/** Processor */
export default class extends Processor {
  /** Import meta */
  static readonly meta = import.meta

  /** Name */
  readonly name = "📮 Publish to local file"

  /** Category */
  readonly category = "publisher"

  /** Description */
  readonly description = "Write content to local file to allow custom actions on it"

  /** Inputs */
  readonly inputs = is.object({
    filepath: is.string().default("metrics.*").describe("Target filename (use `*` to automatically match detected filetype extension)"),
  })

  /** Permissions */
  readonly permissions = ["write:all"]

  /** Action */
  protected async action(state: state) {
    const result = await this.piped(state)
    const { mime, base64 } = result
    const { filepath } = await parse(this.inputs, this.context.args)
    let file = filepath
    if (mime) {
      const ext = extension(mime)!
      this.log.trace(`using extension: ${ext} for ${mime}`)
      file = file.replaceAll("*", ext)
    }
    this.log.io(`writing file: ${file}`)
    await write(file, base64 ? decodeBase64(result.content) : result.content)
  }
}
