//Imports
import { throws } from "@engine/utils/errors.ts"
import { globToRegExp } from "std/path/glob.ts"

/** Regexs (nb: don't be overly restrictive as GitHub will perform the validation anyways)*/
const regex = {
  account: /^(?<login>[^/]+)/,
  repository: /^(?<owner>[^/]+)\/(?<name>[^/]+)$/,
} as const

/** Common ignored patterns */
export const ignored = {
  users: [
    "!*\\[bot\\]",
    "!actions-user",
    "!action@github.com",
  ],
  repositories: [],
}

/** Reactions */
export const reactions = {
  rest: {
    heart: "❤️",
    "+1": "👍",
    "-1": "👎",
    laugh: "😄",
    confused: "😕",
    eyes: "👀",
    rocket: "🚀",
    hooray: "🎉",
  },
}

/** Parse handle */
export function parseHandle(handle: string, options: { entity: "user" | "organization" }): { login: string }
export function parseHandle(handle: string, options: { entity: "repository" }): { owner: string; name: string }
export function parseHandle(handle: string | null | void, options: { entity: string }): { login: string }
export function parseHandle(handle: string | null | void, { entity }: { entity: string }) {
  if (typeof handle !== "string") {
    throws("No handle provided", { unrecoverable: true })
  }
  handle = handle.replace(/[\n\r]/g, "")
  switch (entity) {
    case "repository": {
      const { owner, name } = regex.repository.exec(handle)?.groups ?? throws(`Invalid ${entity} handle: ${handle}`, { unrecoverable: true })
      return { owner, name }
    }
    case "user":
    case "organization": {
      const { login } = regex.account.exec(handle)?.groups ?? throws(`Invalid ${entity} handle: ${handle}`, { unrecoverable: true })
      return { login }
    }
    default:
      throws(`Invalid entity: ${entity}`, { unrecoverable: true })
  }
}

/** Match patterns */
export function matchPatterns(patterns: string | string[], value: unknown) {
  let match = false
  for (const pattern of [patterns].flat(Infinity) as string[]) {
    const negate = pattern.startsWith("!")
    const regex = globToRegExp(pattern.replace(/^!/, ""), { extended: true, globstar: true, caseInsensitive: true, os: "linux" })
    if (regex.test(`${value}`)) {
      match = !negate
    }
  }
  return match
}
