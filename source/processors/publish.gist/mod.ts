// Imports
import { is, Processor, state } from "@processor"
import { extension } from "std/media_types/extension.ts"
import * as Base64 from "std/encoding/base64.ts"

/** Processor */
export default class extends Processor {
  /** Import meta */
  static readonly meta = import.meta

  /** Name */
  readonly name = "📮 Publish to GitHub Gist"

  /** Category */
  readonly category = "publisher"

  /** Description */
  readonly description = "Publish content to [GitHub Gist](https://gist.github.com)"

  /** Inputs */
  readonly inputs = is.object({
    gist: is.coerce.string().describe("Target gist id (gist must be created beforehand, id can be found in the url after the username)"),
    filepath: is.string().default("metrics.*").describe("Target filename (use `*` to automatically match detected filetype extension)"),
  })

  /** Supports */
  readonly supports = ["application/xml", "image/svg+xml", "image/png", "image/jpeg", "image/webp", "application/json", "text/html", "application/pdf", "text/plain"]

  /** Does this processor needs to perform requests ? */
  protected requesting = true

  /** Action */
  protected async action(state: state) {
    const result = await this.piped(state)
    const { mime, base64 } = result
    const { gist, filepath } = await this.inputs.parseAsync(this.context.args)
    let file = filepath
    let content = result.content
    if (mime) {
      const ext = extension(mime) ?? ""
      this.log.trace(`using extension: ${ext} for ${mime}`)
      file = file.replaceAll("*", ext)
    }
    if (base64) {
      this.log.trace("decoding base64 content")
      content = new TextDecoder().decode(Base64.decode(content))
    }
    this.log.io(`uploading gist ${gist}: ${file}`)
    await this.requests.rest(this.requests.api.gists.update, { gist_id: gist, files: { [file]: { content } } })
  }
}
