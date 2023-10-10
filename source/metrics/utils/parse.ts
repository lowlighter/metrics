//Imports
import { throws } from "@utils/errors.ts"
import { globToRegExp } from "std/path/glob.ts"

/** Parse handle */
export function parseHandle(handle: string, options: { entity: "user" }): { login: string }
export function parseHandle(handle: string, options: { entity: "organization" }): { login: string }
export function parseHandle(handle: string, options: { entity: "repository" }): { owner: string; name: string }
export function parseHandle(handle: string, options?: { entity: string }): { handle: string; login: string }
export function parseHandle(_handle: string, { entity = "unknown" } = {}) {
  const handle = _handle.replace(/[\n\r]/g, "")
  switch (entity) {
    case "repository": {
      const [owner, name] = handle.split("/") as [string, string]
      if ((!owner) || (!name)) {
        throws(`Invalid repo handle: ${handle}`)
      }
      return { owner, name }
    }
    case "user":
    case "organization": {
      return { login: handle }
    }
    default: {
      const [login] = handle.split("/") as [string]
      return { handle, login }
    }
  }
}

export function matchPattern(pattern: string, value: unknown) {
  return globToRegExp(pattern, { extended: true, globstar: true, caseInsensitive: true }).test(`${value}`)
}
