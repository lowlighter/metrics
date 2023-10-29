//Imports
import { ensureDir } from "std/fs/ensure_dir.ts"
import { expandGlob } from "std/fs/expand_glob.ts"
import { throws } from "@engine/utils/errors.ts"
import { dirname } from "std/path/dirname.ts"
import { toFileUrl } from "std/path/to_file_url.ts"
import { resolve } from "std/path/resolve.ts"
import * as dir from "@engine/paths.ts"

/** Read file */
export function read(path: string | URL, options: { sync: true }): string
export function read(path: string | URL, options?: { sync?: false }): Promise<string>
export function read(path: string | URL, { sync = false } = {}) {
  if ((typeof path === "string") && (path.startsWith("metrics://"))) {
    path = path.replace("metrics:/", dir.source)
  } else if ((path instanceof URL) && (path.protocol === "metrics:")) {
    path = path.href.replace("metrics:/", dir.source)
  }
  if (!globalThis.Deno) {
    if (sync) {
      throws("Unsupported action: synchronous read")
    }
    return fetch(toFileUrl(resolve(path as string))).then((response) => response.text())
  }
  if ((typeof path === "string") && (path.startsWith("data:"))) {
    if (sync) {
      throws("Unsupported action: synchronous read")
    }
    return fetch(path).then((response) => response.text())
  }
  return sync ? Deno.readTextFileSync(path) : Deno.readTextFile(path)
}

/** Write file */
export async function write(path: string, data: string | Uint8Array | ReadableStream<Uint8Array>) {
  if (!globalThis.Deno) {
    return
  }
  await ensureDir(dirname(path))
  if (typeof data === "string") {
    return Deno.writeTextFile(path, data)
  }
  return Deno.writeFile(path, data)
}

/** List files in globpath */
export async function list(glob: string) {
  if (!globalThis.Deno) {
    throws("Unsupported action: list")
  }
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
