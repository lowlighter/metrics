/// <reference lib="deno.unstable" />
// Imports
import { is, parse } from "@engine/utils/validation.ts"
import { Logger } from "@engine/utils/log.ts"
import * as dir from "@engine/paths.ts"
import { toFileUrl } from "std/path/to_file_url.ts"
import { bgBrightBlack, bgYellow, black, brightCyan, cyan } from "std/fmt/colors.ts"
import chai from "y/chai@4.3.10"
import chaiSubset from "y/chai-subset@1.6.0"
import chaiAsPromised from "y/chai-as-promised@7.1.1"
import { deferred } from "std/async/deferred.ts"
import { fromFileUrl } from "std/path/from_file_url.ts"

/** Logger */
export const log = new Logger(import.meta)

/** Mock utility (first argument is the expected input, and second a mock function called with parsed input that return mocked output) */
export function mock<T extends is.ZodRawShape>(input: T, data: (vars: is.infer<is.ZodObject<T>>) => unknown) {
  return function (vars: Record<PropertyKey, unknown>) {
    return data(parse(is.object(input), vars, { sync: true }))
  }
}

/** Test namer */
export function t(meta: { url: string } | string, test: string | null) {
  let [icon, mod] = (typeof meta === "string") ? meta.split(" ") : ["", meta.url.replace(toFileUrl(dir.source).href, "").replace(/_test\.ts$/, "").replace(/^\//, "")]
  switch (true) {
    case mod.startsWith("engine/utils"):
      icon = "🔧"
      break
    case mod.startsWith("engine/"):
      icon = "⚙️"
      break
  }
  const f = (text: string) => text.replace(/`([\s\S]+?)`/g, (_, text) => cyan(text)).replace(/\*([\s\S]+?)\*/g, (_, text) => brightCyan(text))
  return `${bgBrightBlack(`${icon.trim()} ${mod.padEnd(38)}`)} ${test !== null ? f(test) : bgYellow(black(" NO TESTS FOUND ! "))}`
}

/** Execute code in environment without Deno */
export function nodeno(func: () => void | Promise<void>, options?: { return?: false; permissions?: Deno.PermissionOptions; with?: Record<PropertyKey, unknown> }): () => Promise<void>
export function nodeno(
  func: () => unknown | Promise<unknown>,
  options: { return: true; permissions?: Deno.PermissionOptions; with?: Record<PropertyKey, unknown> },
): () => Promise<ReturnType<typeof func>>
export function nodeno(
  func: () => unknown | Promise<unknown>,
  { return: returned = false, permissions = "inherit", with: context = {} }: { return?: boolean; permissions?: Deno.PermissionOptions; with?: Record<PropertyKey, unknown> } = {},
) {
  // Retrieve caller file
  let file = ""
  const { prepareStackTrace } = Error
  try {
    const error = new Error()
    Error.prepareStackTrace = (_, stack) => stack
    const stack = error.stack as unknown as Array<{ getFileName(): string }>
    file = stack.map((callsite) => callsite.getFileName()).filter((file) => (file !== import.meta.url))[0]!
  } finally {
    Object.assign(Error, { prepareStackTrace })
  }

  // Load imports from caller file
  const imports = []
  if (file) {
    imports.push(...Deno.readTextFileSync(fromFileUrl(file)).match(/^import.*from.*$/gm) ?? [])
  }

  // Execute code in worker without deno
  const script = `
    ${imports.join("\n")}
    self.addEventListener("message", async ({data}) => {
      Object.assign(self, data)
      self.postMessage(await (async () => {
        try {
          delete self.Deno
          const result = await (${func.toString()})()
          return ${returned ? "result" : "null"}
        }
        catch (error) {
          return { error }
        }
      })())
      self.close()
    })
  `
  return () => {
    const promise = deferred()
    const worker = new Worker(`data:text/javascript;base64,${btoa(script)}`, { type: "module", deno: { permissions } })
    worker.postMessage(context)
    worker.addEventListener("message", ({ data }) => {
      worker.terminate()
      return !data?.error ? promise.resolve(data) : promise.reject(data.error)
    })
    return promise as unknown as Promise<ReturnType<typeof func>>
  }
}

/** Chai assertions */
chai.config.truncateThreshold = 0
chai.config.showDiff = true
export const { expect } = chai.use(chaiSubset).use(chaiAsPromised)

/** Testing type */
// deno-lint-ignore no-explicit-any
export type test = any

// Exports
export { MetricsError, throws } from "@engine/utils/errors.ts"
export { is, MetricsValidationError } from "@engine/utils/validation.ts"
export { Status } from "std/http/http_status.ts"
export { faker } from "y/@faker-js/faker@8.0.2"
export { dir }
