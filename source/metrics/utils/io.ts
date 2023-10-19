//Imports
import { ensureDir } from "std/fs/ensure_dir.ts"
import { expandGlob } from "std/fs/expand_glob.ts"
import { throws } from "@utils/errors.ts"
import { dirname } from "std/path/dirname.ts"
import { toFileUrl } from "std/path/to_file_url.ts"
import { resolve } from "std/path/resolve.ts"

/** Runtime (internal, exported for testing purposes only) */
export const testing = {
  deno: !!globalThis.Deno,
}

/** Runtime */
const runtime = {
  get deno() {
    return testing.deno
  },
}

/** Inspect */
export function inspect(message: unknown) {
  if (!runtime.deno) {
    try {
      return JSON.stringify(message, null, 2)
    } catch {
      return `${message}`
    }
  }
  return Deno.inspect(message, { colors: true, depth: Infinity, iterableLimit: 16, strAbbreviateSize: 120 })
}

/** Port listener */
export function listen(options: Deno.ListenOptions) {
  if (!runtime.deno) {
    throws("Unsupported action: listen")
  }
  return Deno.listen(options)
}

/** Read file */
export function read(path: string | URL, options: { sync: true }): string
export function read(path: string | URL, options?: { sync?: false }): Promise<string>
export function read(path: string | URL, { sync = false } = {}) {
  if (!runtime.deno) {
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
  if (!runtime.deno) {
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
  if (!runtime.deno) {
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
  if (!runtime.deno) {
    return ""
  }
  try {
    return Deno.env.get(key) ?? ""
  } catch {
    return ""
  }
}

/** Set environment value */
function setEnv(key: string, value: string) {
  try {
    return Deno.env.set(key, value)
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
  get actions() {
    return env.get("GITHUB_ACTIONS", { boolean: true })
  },
}

/** KV storage */
export class KV {
  /** Constructor */
  constructor(path?: string) {
    if (!runtime.deno) {
      throws("Unsupported action: openKV (if you're using deno, try with `--unstable` flag)")
    }
    this.ready = Deno.openKv(path).then((kv) => {
      this.#kv = kv
      return this
    })
  }

  /** Is ready ? */
  readonly ready

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

  /** Close KV storage */
  close() {
    if (!this.#kv) {
      throws("KV storage is not ready")
    }
    this.#kv.close()
  }
}
