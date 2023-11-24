// Imports
/// <reference lib="dom" />
import { is, parse, Processor, state } from "@engine/components/processor.ts"
import { Browser } from "@engine/utils/browser.ts"
import { Format } from "@engine/utils/format.ts"
import { Plugin } from "@engine/components/plugin.ts"
import { list, read } from "@engine/utils/deno/io.ts"
import { contentType } from "std/media_types/content_type.ts"
import { encodeBase64 } from "std/encoding/base64.ts"
import * as YAML from "std/yaml/stringify.ts"

/** Processor */
export default class extends Processor {
  /** Import meta */
  static readonly meta = import.meta

  /** Name */
  readonly name = "🎨 Render image"

  /** Category */
  readonly category = "renderer"

  /** Description */
  readonly description = "Render image to desired output format"

  /** Inputs */
  readonly inputs = is.object({
    format: is.union([
      is.literal("svg").describe("SVG"),
      is.literal("png").describe("PNG"),
      is.literal("jpeg").describe("JPEG"),
      is.literal("webp").describe("WebP"),
      is.literal("text").describe("Text"),
      is.literal("html").describe("HTML"),
      is.literal("yaml").describe("YAML"),
      is.literal("json").describe("JSON"),
      is.literal("pdf").describe("PDF"),
    ]).default("svg").describe("Output format"),
    template: is.string().nullable().default(null).describe("Template name or url. Set to `null` to use same template as parent plugin (placeholder: `classic`)"),
  })

  /** Supports */
  readonly supports = ["application/xml"]

  /** Permissions */
  readonly permissions = ["run:chrome", "write:tmp"]

  /** Action */
  protected async action(state: state) {
    const result = await this.piped(state)
    const { format: _format, template: _template } = await parse(this.inputs, this.context.args)
    const format = { jpg: "jpeg", txt: "text", yml: "yaml", md: "markdown", pdf: "html" }[_format as string] ?? _format
    result.mime = contentType(format)!

    //Render image
    const wrapper = [...await list(`${Processor.path}/${this.id}/templates/*.ejs`)].map((template) => template.replace(/\.ejs$/, "")).includes(format) ? format : "svg"
    const template = _template ?? this.context.parent?.template as string ?? "classic"
    if (!result.content) {
      state.errors.push({ severity: "warning", source: this.id, message: "Nothing to render" })
    }
    const renderer = new Renderer(this.context.parent as Plugin["context"])
    let render = await renderer.render({
      template: wrapper,
      state,
      result: {
        fonts: await this.load(template, "fonts.css"),
        styles: await this.load(template, "styles.css"),
      },
    })

    // Process SVG in browser and convert to image if needed
    if (wrapper === "svg") {
      const page = await Browser.page({ log: this.log })
      try {
        // Compute SVG rendered dimensions
        this.log.trace("processing svg content in browser")
        await page.setContent(Format.html(render))
        const { processed, width, height } = await page.evaluate("dom://svg.ts")
        render = processed

        // Convert to image
        if (["png", "jpeg", "webp"].includes(format)) {
          this.log.debug(`converting SVG to ${format}`)
          await page.setTransparentBackground()
          render = encodeBase64(await page.screenshot({ format: format as "png" | "jpeg" | "webp", clip: { x: 0, y: 0, width, height, scale: 1 } }))
          result.base64 = true
        }
      } finally {
        await page.close()
      }
    }

    // Process HTML in browser and convert it to PDF if needed
    if (_format === "pdf") {
      const page = await Browser.page({ log: this.log })
      try {
        this.log.trace("converting html content to pdf in browser")
        await page.setContent(render)
        render = encodeBase64(await page.pdf())
        result.base64 = true
        result.mime = contentType(_format)!
      } finally {
        await page.close()
      }
    }

    // Final result
    result.content = render
  }

  /** Load template file */
  private async load(template: string, path: string) {
    try {
      this.log.trace(`loading template: ${template}`)
      return await read(/^(https?|file|metrics):/.test(template) ? new URL(`${template}/${path}`) : new URL(`templates/${template}/${path}`, import.meta.url))
    } catch {
      try {
        this.log.trace(`template ${template} has no ${path}, using fallback`)
        return await read(new URL(`templates/classic/${path}`, import.meta.url))
      } catch (error) {
        if (!(error instanceof globalThis?.Deno.errors.NotFound)) {
          this.log.warn(error)
        }
        return ""
      }
    }
  }
}

/** Renderer */
export class Renderer extends Plugin {
  static readonly meta = import.meta
  readonly name = "🎨 Render image"
  readonly category = "renderer"
  readonly description = "Render image to desired output format"
  readonly inputs = is.object({})
  readonly outputs = is.object({})
  protected action() {
    return Promise.resolve({})
  }
  constructor(context: Plugin["context"]) {
    super(context)
  }
  protected _renderctx = { YAML }
  render({ template, result, state }: { template: string; result: Record<PropertyKey, unknown>; state: state }) {
    this.context.template = template
    this.context.args = {}
    return super.render({ state: { ...state, result: { result } as unknown as typeof state["result"] } })
  }
}
