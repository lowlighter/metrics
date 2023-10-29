/** Get environment value */
function get(key: string, options: { boolean: true }): boolean
function get(key: string, options?: { boolean: false }): string
function get(key: string, { boolean = false } = {}) {
  if (boolean) {
    const value = env.get(key, { boolean: false })
    if (!value.length) {
      return false
    }
    return !/^(0|[Nn]o?|NO|[Oo]ff|OFF|[Ff]alse|FALSE)$/.test(value)
  }
  try {
    return Deno.env.get(key) ?? ""
  } catch {
    return ""
  }
}

/** Set environment value */
function set(key: string, value: string) {
  try {
    return Deno.env.set(key, value)
  } catch {
    return
  }
}

/** Environment */
export const env = {
  get,
  set,
  get deployment() {
    return env.get("DENO_DEPLOYMENT_ID", { boolean: true })
  },
  get actions() {
    return env.get("GITHUB_ACTIONS", { boolean: true })
  },
}
