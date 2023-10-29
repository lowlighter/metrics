// Imports
/// <reference lib="dom" />
import { is, parse, Processor, state } from "@engine/components/processor.ts"
import { Browser } from "@engine/utils/browser.ts"
import { Format } from "@engine/utils/format.ts"
import { Plugin } from "@engine/components/plugin.ts"
import { read } from "@engine/utils/deno/io.ts"
import { contentType } from "std/media_types/content_type.ts"
import { encodeBase64 } from "std/encoding/base64.ts"

/** Formats */
export const formats = ["svg", "png", "jpg", "jpeg", "webp", "json", "html", "pdf", "txt", "text"] as const

//TODO(@lowlighter): template scripts

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
      is.literal("jpg").describe("Alias for JPEG"),
      is.literal("jpeg").describe("JPEG"),
      is.literal("webp").describe("WebP"),
      is.literal("json").describe("JSON"),
      is.literal("html").describe("HTML"),
      is.literal("pdf").describe("PDF"),
      is.literal("txt").describe("Alias for text"),
      is.literal("text").describe("Text"),
    ]).default("svg").describe("Output format"),
    template: is.string().nullable().default(null).describe("Template name or url. Set to `null` to use same template as parent plugin"),
  })

  /** Supports */
  readonly supports = ["application/xml"]

  /** Permissions */
  readonly permissions = ["run:chrome"]

  /** Action */
  protected async action(state: state) {
    const result = await this.piped(state)
    const { format: _format, template: _template } = await parse(this.inputs, this.context.args)
    const format = { jpg: "jpeg", txt: "text" }[_format as string] ?? _format
    result.mime = contentType(format)!

    //Render image
    const wrapper = ["html", "json"].includes(format) ? format : "svg"
    const template = _template ?? this.context.parent?.template as string ?? "classic"
    //TODO(@lowlighter): add warnings to state
    //if (!state.results.length)
    //  state.warnings.push({message:"No plugins to render"})
    const renderer = new (Plugin.NOP)(this.context.parent ?? {}, { meta: this.meta })
    let render = await renderer.render({
      template: wrapper,
      state,
      result: {
        fonts: await this.load(template, "fonts.css"),
        styles: await this.load(template, "styles.css"),
      },
    })

    //Process SVG in browser and convert to image if needed
    if (wrapper === "svg") {
      const page = await Browser.page({ log: this.log })
      try {
        // Compute SVG rendered dimensions
        this.log.trace("processing content in browser")
        await page.setContent(Format.html(render))
        //await page.waitForNavigation({ waitUntil: "load" })
        const { processed, width, height } = await page.evaluate(() => {
          const svg = document.querySelector("main svg")!
          const { y: height, width } = svg.querySelector("#metrics-end")!.getBoundingClientRect()
          svg.setAttribute("height", `${height}`)
          return { processed: new XMLSerializer().serializeToString(svg), height, width }
        })
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

    //TODO(@lowlighter): markdown and pdf formats
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
