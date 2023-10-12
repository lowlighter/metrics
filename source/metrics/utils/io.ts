//Imports
import { ensureDir } from "std/fs/ensure_dir.ts"
import { expandGlob } from "std/fs/expand_glob.ts"
import { throws } from "@utils/errors.ts"
import { dirname } from "std/path/dirname.ts"
import { deferred } from "std/async/deferred.ts"

/** Inspect */
export function inspect(message: unknown) {
  if (typeof globalThis.Deno?.inspect === "function") {
    return globalThis.Deno.inspect(message, { colors: true, depth: Infinity, iterableLimit: 16, strAbbreviateSize: 120 })
  }
  try {
    return JSON.stringify(message, null, 2)
  } catch {
    return message
  }
}

/** Port listener */
export const listen = globalThis.Deno?.listen ?? (() => throws("Deno.listen is not available in this environment"))

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

/** Get environment value */
function getEnv(key: string, options: { boolean: true }): boolean
function getEnv(key: string, options?: { boolean: false }): string
function getEnv(key: string, { boolean = false } = {}) {
  if (boolean) {
    const value = env.get(key, { boolean: false })
    if (!value.length) {
      return false
    }
    return !/^(0|[Nn]o?|NO|[Oo]ff|OFF|[Ff]alse|FALSE)$/.test(value)
  }
  if ((!globalThis.Deno) || (globalThis.Deno.permissions.querySync?.({ name: "env", variable: key }).state === "denied")) {
    return ""
  }
  try {
    return globalThis.Deno.env.get(key) ?? ""
  } catch {
    return ""
  }
}

/** Set environment value */
function setEnv(key: string, value: string) {
  if ((!globalThis.Deno) || (globalThis.Deno.permissions.querySync?.({ name: "env" }).state === "denied")) {
    return
  }
  try {
    return globalThis.Deno.env.set(key, value)
  } catch {
    return
  }
}

/** Environment */
export const env = {
  get: getEnv,
  set: setEnv,
  get deployment() {
    return env.get("DENO_DEPLOYMENT_ID", { boolean: true })
  },
  get docker() {
    return env.get("IS_DOCKER", { boolean: true })
  },
}

/** KV storage */
export class KV {
  /** Constructor */
  constructor(path = ".kv") {
    if (typeof globalThis.Deno?.openKv === "function") {
      ;(async () => {
        this.#kv = env.deployment ? await globalThis.Deno.openKv() : await globalThis.Deno.openKv(path)
        this.ready.resolve(this)
      })()
    } else {
      throws("Deno.openKv is not available in this environment")
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
