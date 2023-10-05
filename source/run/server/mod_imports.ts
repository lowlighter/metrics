// Imports
import { expandGlob } from "std/fs/expand_glob.ts"
import { relative } from "std/path/relative.ts"
import { fromFileUrl } from "std/path/from_file_url.ts"
import { write } from "@utils/io.ts"
import { dirname } from "std/path/dirname.ts"

if (import.meta.main) {
  const base = dirname(fromFileUrl(import.meta.url))
  const imports = []
  for await (const { path } of expandGlob("source/{plugins,processors}/**/mod.ts")) {
    imports.push(relative(base, path))
  }
  for await (const { path } of expandGlob("source/{plugins,processors}/**/tests/*.ts")) {
    imports.push(relative(base, path))
  }
  await write(
    "source/run/server/imports.ts",
    [
      "/*",
      " * Statically analyzable dynamic imports for deno deploy",
      " * Auto-generated, do not edit manually",
      " */",
      imports.map((imported) => `(async () => await import("${imported.replaceAll("\\", "/")}"))`).sort().join(";\n"),
    ].join("\n"),
  )
}
