// Imports
import hljs from "y/highlight.js@11.8.0/lib/core?pin=v133"
import * as YAML from "std/yaml/parse.ts"

/** Language cache */
const cache = {empty:true} as unknown as Record<string, {ace_mode:string, extensions?:string[], interpreters?:string[]}>

//ignore/only language
//gitattributes
//gitignore
//filter file if needed

/** Language guesser */
export async function language(filename:string, content:string, {gitattributes = ""} = {}) {

  /*
load("vendor.yml")
load("documentation.yml")
  */

  const result = {} as any

  if (gitattributes) {
    result.from = "gitattributes"
  }

  //gitattributes override
  if (content.startsWith("#!/")) {
    const line = content.split("\n", 1)[0]
    // search for single interpreter
    result.from = "shebang"
  }

  //
  if (true) {
    // search from .filenames
    result.from = "filename"
  }

  if (true) {
    // search from .extension
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
export async function highlight(language:string, code:string) {
  // Resolve language name
  if (cache.empty) {
    Object.assign(cache, await load("languages.yml"))
    delete cache.empty
  }
  for (const [key, {ace_mode:mode, extensions = []}] of Object.entries(cache)) {
    const name = key.toLocaleLowerCase()
    if ((name === language.toLocaleLowerCase())||(extensions.find(extension => extension === `.${language}`))) {
      language = mode
      break
    }
  }

  // Load language
  if (!hljs.listLanguages().includes(language)) {
    try {
      const module = await import(`y/highlight.js@11.8.0/lib/languages/${language}?pin=v133`)
      hljs.registerLanguage(language, module.default)
    }
    catch {
      // Ignore
    }
  }

  // Highlight code
  if (hljs.getLanguage(language))
    code = hljs.highlight(code, {language, ignoreIllegals: true}).value
  return {language, code}
}

/** Load file from GitHub linguist */
async function load(file:string) {
  return YAML.parse(await fetch(`https://raw.githubusercontent.com/github-linguist/linguist/master/lib/linguist/${file}`).then(response => response.text()))
}
