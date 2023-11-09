/// <reference lib="deno.unstable" />
//Imports
import { throws } from "@engine/utils/errors.ts"

/** Port listener */
export function listen(options: Deno.ServeOptions, handler: Deno.ServeHandler) {
  return Deno.serve({ ...options, onListen: () => void null }, handler)
}

/** KV storage */
export class KV {
  /** Constructor */
  constructor(path?: string) {
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
