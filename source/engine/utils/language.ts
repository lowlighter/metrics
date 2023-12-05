// Imports
import hljs from "y/highlight.js@11.8.0/lib/core?pin=v133"
import hljsDiff from "y/highlight.js@11.8.0/lib/languages/diff?pin=v133"
import hljsMarkdown from "y/highlight.js@11.8.0/lib/languages/markdown?pin=v133"
import hljsTypeScript from "y/highlight.js@11.8.0/lib/languages/typescript?pin=v133"
import hljsXML from "y/highlight.js@11.8.0/lib/languages/xml?pin=v133"
import hljsYAML from "y/highlight.js@11.8.0/lib/languages/yaml?pin=v133"
import * as YAML from "std/yaml/parse.ts"
hljs.registerLanguage("diff", hljsDiff)
hljs.registerLanguage("markdown", hljsMarkdown)
hljs.registerLanguage("typescript", hljsTypeScript)
hljs.registerLanguage("xml", hljsXML)
hljs.registerAliases(["html", "ejs"], { languageName: "xml" })
hljs.registerLanguage("yaml", hljsYAML)

/** Language cache */
export const cache = await load("languages.yml").catch(() => ({})) as Record<string, { ace_mode: string; extensions?: string[]; interpreters?: string[] }>

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
export const highlight = Object.assign(function (language: string, code: string) {
  if (hljs.getLanguage(language)) {
    code = hljs.highlight(code, { language, ignoreIllegals: true }).value
  }
  return { language, code }
}, {
  /** List of registered languages */
  languages: hljs.listLanguages,
  /** Resolve language name and load highlighting syntax if required */
  async resolve(language: string) {
    for (const [key, { ace_mode: mode, extensions = [] }] of Object.entries(cache)) {
      const name = key.toLocaleLowerCase()
      if ((name === language.toLocaleLowerCase()) || (extensions.find((extension) => extension === `.${language}`))) {
        language = mode
        break
      }
    }
    if (!this.languages().includes(language)) {
      try {
        const module = await import(`y/highlight.js@11.8.0/lib/languages/${language}?pin=v133`)
        hljs.registerLanguage(language, module.default)
      } catch {
        // Ignore
      }
    }
    return language
  },
})

/** Load file from GitHub linguist */
async function load(file: string) {
  return YAML.parse(await fetch(`https://raw.githubusercontent.com/github-linguist/linguist/master/lib/linguist/${file}`).then((response) => response.text()))
}
