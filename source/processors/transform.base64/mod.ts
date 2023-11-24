// Imports
import { is, parse, Processor, state } from "@engine/components/processor.ts"
import { DOMParser } from "x/deno_dom@v0.1.38/deno-dom-wasm.ts"
import { Format } from "@engine/utils/format.ts"
import { resize } from "x/deno_image@0.0.4/mod.ts"
import { contentType } from "std/media_types/mod.ts"
import { extname } from "std/path/extname.ts"
import { encodeBase64 } from "std/encoding/base64.ts"

/** Fallback */
const fallback = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mOcOnfpfwAGfgLYttYINwAAAABJRU5ErkJggg=="

/** Processor */
export default class extends Processor {
  /** Import meta */
  static readonly meta = import.meta

  /** Name */
  readonly name = "🏭 Transform images to base64 encoded images"

  /** Category */
  readonly category = "transformer"

  /** Description */
  readonly description = "Transform images to base64 encoded images"

  /** Supports */
  readonly supports = ["application/xml", "image/svg+xml", "text/html"]

  /** Permissions */
  readonly permissions = ["net:all"]

  /** Inputs */
  readonly inputs = is.object({
    select: is.string().default("img").describe("HTML query selector"),
  })

  /** Does this processor needs to perform requests ? */
  protected requesting = true

  /** Action */
  protected async action(state: state) {
    const result = await this.piped(state)
    const { select } = await parse(this.inputs, this.context.args)
    const document = new DOMParser().parseFromString(Format.html(result.content), "text/html")!
    for (const element of document.querySelectorAll(select)) {
      if (!/^img$/i.test((element as unknown as { tagName: string }).tagName)) {
        continue
      }
      const image = element as unknown as { getAttribute(key: string): string | null; setAttribute(key: string, value: string): void }
      const url = image.getAttribute("src")
      const height = Number(image.getAttribute("height")) || 0
      const width = Number(image.getAttribute("width")) || 0
      image.setAttribute("src", await this.base64(url, { width, height }))
    }
    result.content = document.querySelector("main")!.innerHTML
  }

  /** Convert remote image to base64 */
  private async base64(url: string | null, { width = 0, height = 0 } = {}) {
    this.log.trace(`${url}: processing`)
    if (!url) {
      return fallback
    }
    if ((url.startsWith("data:image/")) && (url.includes(";base64,"))) {
      this.log.trace(`${url}: already base64 encoded`)
      return url
    }
    try {
      const response = await this.requests.fetch(url, { type: "response" })
      const type = response.headers.get("content-type") || contentType(extname(url)) || "image/png"
      this.log.trace(`${url}: detected ${type}`)
      let buffer = new Uint8Array(await response.arrayBuffer())
      if ((["image/jpeg", "image/png"].includes(type)) && (width || height)) {
        this.log.trace(`${url}: resizing to ${width || "(auto)"}x${height || "(auto)"}`)
        buffer = await resize(buffer, { width, height })
      }
      return `data:${type};base64,${encodeBase64(buffer)}`
    } catch (error) {
      this.log.warn(`${url}: error, ${error}`)
      return fallback
    }
  }
}
