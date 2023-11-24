//Imports
import { ensureDir } from "std/fs/ensure_dir.ts"
import { expandGlob, expandGlobSync } from "std/fs/expand_glob.ts"
import { throws } from "@engine/utils/errors.ts"
import { dirname } from "std/path/dirname.ts"
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
  if (path === "/dev/null") {
    return
  }
  await ensureDir(dirname(path))
  if (typeof data === "string") {
    return Deno.writeTextFile(path, data)
  }
  return Deno.writeFile(path, data)
}

/** List files in globpath */
export function list(glob: string, options: { sync: true }): string[]
export function list(glob: string, options?: { sync?: false }): Promise<string[]>
export function list(glob: string, { sync = false } = {}) {
  const files = []
  const base = glob.match(/(?<base>.*\/)\*/)?.groups?.base
  const prefix = new RegExp(`.*?${base}`)
  if (sync) {
    for (const { path } of expandGlobSync(glob, { extended: true, globstar: true })) {
      files.push(path.replaceAll("\\", "/").replace(prefix, ""))
    }
    return files
  }
  return (async () => {
    for await (const { path } of expandGlob(glob, { extended: true, globstar: true })) {
      files.push(path.replaceAll("\\", "/").replace(prefix, ""))
    }
    return files
  })()
}
