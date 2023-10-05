//Imports
import { throws } from "@utils/errors.ts"

/** Parse handle */
export function parseHandle(_handle: string, { entity = "unknown" as "user" | "organization" | "repository" | "unknown" } = {}) {
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
