// Imports
import { read } from "@engine/utils/deno/io.ts"
import * as JSONC from "std/jsonc/parse.ts"
import { basename } from "std/path/basename.ts"
import { cmp } from "std/semver/cmp.ts"
import { parse } from "std/semver/parse.ts"

/** Version (internal, exported for testing purposes only) */
export const testing = {
  number: "0.0.0",
  async parse(config = "deno.jsonc") {
    try {
      const parsed = JSONC.parse(await read(config)) as { version: string }
      parse(parsed.version)
      return parsed.version
    } catch {
      // Ignore
    }
    return testing.number
  },
}

/** Version */
export const version = {
  get number() {
    return testing.number
  },
}
testing.number = await testing.parse()

/** Get latest version number */
export async function latest(url = "https://github.com/lowlighter/metrics/releases/latest") {
  try {
    let latest = basename(await fetch(url).then((response) => (response.body?.cancel(), response.url)))
    try {
      parse(latest)
    } catch (error) {
      if (error instanceof TypeError) {
        latest = `${latest}.0`
      }
    }
    if (cmp(parse(latest), ">", parse(version.number))) {
      return latest
    }
  } catch {
    // Ignore
  }
  return version.number
}
