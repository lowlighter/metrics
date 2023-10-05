//Imports
import { ensureDir, expandGlob } from "std/fs/mod.ts"
import { throws } from "@utils/errors.ts"
import { dirname } from "std/path/dirname.ts"

/** Read file */
export function read(path: string | URL) {
  return globalThis.Deno?.readTextFile(path)
}

/** Write file */
export async function write(path: string, data: string | Uint8Array | ReadableStream<Uint8Array>) {
  await ensureDir(dirname(path))
  if (typeof data === "string") {
    return globalThis.Deno?.writeTextFile(path, data)
  }
  return globalThis.Deno?.writeFile(path, data)
}

/** List files in globpath */
export async function list(glob: string) {
  const files = []
  const base = glob.match(/(?<base>.*\/)\*/)?.groups?.base
  const prefix = base ? new RegExp(`.*?${base}`) : null
  for await (const { path } of expandGlob(glob, { extended: true, globstar: true })) {
    let file = path.replaceAll("\\", "/")
    if (prefix) {
      file = file.replace(prefix, "")
    }
    files.push(file)
  }
  return files
}

/** Environment */
export const env = globalThis.Deno?.env ?? { set(_k: string, _v: string) {}, get(_: string) {} }

/** Port listener */
export const listen = globalThis.Deno?.listen ?? (() => throws("Deno.listen is not available in this environment"))

/** Inspect */
export function inspect(message: unknown) {
  if (globalThis.Deno?.inspect) {
    return globalThis.Deno.inspect(message, { colors: true, depth: Infinity, iterableLimit: 16, strAbbreviateSize: 120 })
  }
  try {
    return JSON.stringify(message, null, 2)
  } catch {
    return message
  }
}

/** Current working directory */
export function cwd() {
  return globalThis.Deno?.cwd() ?? ""
}

/** Operating system */
export const os = globalThis.Deno?.build.os ?? "unknown"
