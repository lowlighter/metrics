//Imports
import { ensureDir, expandGlob } from "std/fs/mod.ts"
import { throws } from "@utils/errors.ts"
import { dirname } from "std/path/dirname.ts"
import { deferred } from "std/async/deferred.ts"

/** Read file */
export function read(path: string | URL, options: { sync: true }): string
export function read(path: string | URL, options?: { sync?: false }): Promise<string>
export function read(path: string | URL, { sync = false } = {}) {
  return sync ? globalThis.Deno?.readTextFileSync(path) : globalThis.Deno?.readTextFile(path)
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
export const env = {
  get(key: string) {
    if ((!globalThis.Deno) || (globalThis.Deno.permissions.querySync?.({ name: "env", variable: key }).state === "denied")) {
      return ""
    }
    return globalThis.Deno.env.get(key) ?? ""
  },
  set(key: string, value: string) {
    if ((!globalThis.Deno) || (globalThis.Deno.permissions.querySync?.({ name: "env" }).state === "denied")) {
      return
    }
    return globalThis.Deno.env.set(key, value)
  },
  get deployment() {
    return !!env.get("DENO_DEPLOYMENT_ID")
  },
}

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

/** KV storage */
export class KV {
  /** Constructor */
  constructor(path = ".kv") {
    if (globalThis.Deno) {
      ;(async () => {
        this.#kv = env.deployment ? await globalThis.Deno?.openKv() : await globalThis.Deno?.openKv(path)
        this.ready.resolve(this)
      })()
    }
  }

  /** Is ready ? */
  readonly ready = deferred<this>()

  /** KV storage */
  #kv = null as null | Deno.Kv

  /** Get key value */
  async get<T = unknown>(path: string) {
    if (!this.#kv) {
      throws("KV storage is not ready")
    }
    const { value } = await this.#kv.get(path.split("."))
    return (value ?? null) as T
  }

  /** Has key */
  async has(path: string) {
    const value = await this.get(path)
    return (value !== null) && (value !== undefined)
  }

  /** Delete key */
  async delete(path: string) {
    if (!this.#kv) {
      throws("KV storage is not ready")
    }
    await this.#kv.delete(path.split("."))
  }

  /** Set key value */
  async set(path: string, value: unknown, { ttl = NaN } = {}) {
    if (!this.#kv) {
      throws("KV storage is not ready")
    }
    await this.#kv.set(path.split("."), value, { ...(Number.isFinite(ttl) ? { expireIn: ttl } : null) })
    if (Number.isFinite(ttl)) {
      setTimeout(() => this.delete(path), ttl + 1)
    }
  }
}
