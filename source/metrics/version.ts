// Imports
import { read } from "@utils/io.ts"
import * as JSONC from "std/jsonc/parse.ts"
import { basename } from "std/path/basename.ts"
import { cmp } from "std/semver/cmp.ts"
import { parse } from "std/semver/parse.ts"
import { isSemVer } from "std/semver/is_semver.ts"

/** Version */
let config = { version: "(unknown version)" }
try {
  config = JSONC.parse(await read("deno.jsonc")) as typeof config
} catch {
  // Ignore
}
export const { version } = config

/** Get latest version number */
export async function latest() {
  let latest = basename(await fetch("https://github.com/lowlighter/metrics/releases/latest").then((response) => response.url))
  if (!isSemVer(latest)) {
    latest = `${latest}.0`
  }
  try {
    if (cmp(parse(latest), ">", parse(version))) {
      return latest
    }
    return version
  } catch {
    return version
  }
}
