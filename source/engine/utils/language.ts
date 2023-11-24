// Imports
import hljs from "y/highlight.js@11.8.0/lib/core?pin=v133"
import * as YAML from "std/yaml/parse.ts"

/** Language cache */
export const cache = await load("languages.yml") as Record<string, { ace_mode: string; extensions?: string[]; interpreters?: string[] }>

/** Language guesser */
// TODO(@lowlighter): to implement
// deno-lint-ignore require-await
export async function language(_filename: string, content: string, { gitattributes = "" } = {}) {
  /*
    load("vendor.yml")
    load("documentation.yml")
  */
  // deno-lint-ignore no-explicit-any
  const result = {} as any

  // Process gitattributes override
  if (gitattributes) {
    result.from = "gitattributes"
  }

  // Process interpreter
  if (content.startsWith("#!/")) {
    const _line = content.split("\n", 1)[0]
    result.from = "shebang"
  }

  // Search for specific filename
  // deno-lint-ignore no-constant-condition
  if (false) {
    result.from = "filename"
  }

  // Search for specific extension
  // deno-lint-ignore no-constant-condition
  if (false) {
    result.from = "extension"
  }

  return {
    language: null,
    type: "unknown",
    bytes: 0,
    color: "#959da5",
  }
}

/** Highlight code */
export async function highlight(language: string, code: string) {
  // Resolve language name
  for (const [key, { ace_mode: mode, extensions = [] }] of Object.entries(cache)) {
    const name = key.toLocaleLowerCase()
    if ((name === language.toLocaleLowerCase()) || (extensions.find((extension) => extension === `.${language}`))) {
      language = mode
      break
    }
  }

  // Load language highlighting syntax
  if (!hljs.listLanguages().includes(language)) {
    try {
      const module = await import(`y/highlight.js@11.8.0/lib/languages/${language}?pin=v133`)
      hljs.registerLanguage(language, module.default)
    } catch {
      // Ignore
    }
  }

  // Highlight code
  if (hljs.getLanguage(language)) {
    code = hljs.highlight(code, { language, ignoreIllegals: true }).value
  }
  return { language, code }
}

/** Load file from GitHub linguist */
async function load(file: string) {
  return YAML.parse(await fetch(`https://raw.githubusercontent.com/github-linguist/linguist/master/lib/linguist/${file}`).then((response) => response.text()))
}
