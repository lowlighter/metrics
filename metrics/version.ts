// Imports
import { read } from "@utils/io.ts"
import * as JSONC from "std/jsonc/mod.ts"

/** Version */
export const { version } = JSONC.parse(await read("deno.jsonc")) as { version: string }
