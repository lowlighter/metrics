// Imports
import { fromFileUrl } from "std/path/from_file_url.ts"

/** Project root path */
export const root = fromFileUrl(new URL("../..", import.meta.url)).replaceAll("\\", "/").replace(/\/$/, "")

/** Source path */
export const source = `${root}/source`

/** Test path */
export const test = `${root}/.test`

/** Cache path */
export const cache = `${root}/.cache`
