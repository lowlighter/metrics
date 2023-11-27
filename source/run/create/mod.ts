// Imports
import * as ejs from "y/ejs@3.1.9?pin=v133"
import { read, write } from "@engine/utils/deno/io.ts"
import * as dir from "@engine/paths.ts"
import { createStreaming } from "x/dprint@0.2.0/mod.ts"
import * as JSONC from "std/jsonc/parse.ts"
import { Checkbox, Confirm, Input, Select } from "x/cliffy@v1.0.0-rc.3/prompt/mod.ts"
import { existsSync } from "std/fs/exists.ts"
import { yaml } from "@run/compat/report.ts"
import { Logger } from "@engine/utils/log.ts"
import emojis from "https://unpkg.com/emoji.json@15.1.0/emoji.json" assert { type: "json" }

/** Base path for component templates */
const base = `${dir.source}/run/create/templates`

/** Logger */
const log = new Logger(import.meta)

/** Create component command */
export async function create(context: Partial<context> & Pick<context, "type">, { confirm = true, dryrun = false, writer = Deno.stdout } = {}) {
  const Type = `${context.type.charAt(0).toLocaleUpperCase()}${context.type.slice(1)}`

  // Dryrun
  if (dryrun) {
    Confirm.inject("y")
    await Confirm.prompt({ writer, message: "Dryrun" })
  }

  // Identifier
  if (context.id) {
    Input.inject(context.id)
  }
  context.id = await Input.prompt({
    writer,
    message: `${Type} identifier`,
    hint: `This will be used to reference the ${context.type} in configurations`,
    validate(value: string) {
      if (!value) {
        return `${Type} identifier cannot be empty`
      }
      if (!/^[.\w]+$/.test(value)) {
        return `${Type} identifier can only contain letters, numbers, underscores and dots`
      }
      return existsSync(`${dir.source}/${context.type}s/${value}`) ? `${Type} identifier is already used by another ${context.type}` : true
    },
  })

  // Icon
  if (context.icon) {
    Select.inject(context.icon)
  }
  context.icon = await Select.prompt<string>({
    writer,
    message: `${Type} icon`,
    hint: `This will be used to represent the ${context.type} in UI and documentations`,
    default: { plugin: "🧩", processor: "🪄" }[context.type],
    hideDefault: true,
    search: true,
    options: emojis.map(({ char: value, name }: { char: string; name: string }) => ({ name: `${value} — ${name}`, value })),
  })

  // Name
  if (context.name) {
    Input.inject(context.name)
  }
  context.name = await Input.prompt({
    writer,
    message: `${Type} name`,
    hint: `A human-friendly name for this ${context.type}`,
    default: `${context.id.charAt(0).toLocaleUpperCase()}${context.id.slice(1)}`,
  })

  // Description
  if (context.description) {
    Input.inject(context.description)
  }
  context.description = await Input.prompt({
    writer,
    message: `${Type} description`,
    hint: `A human-friendly description for this ${context.type}`,
    default: `${context.name}`,
  })

  // Category
  if (context.category) {
    Select.inject(context.category)
  }
  context.category = await Select.prompt({
    writer,
    message: `${Type} category`,
    hint: `This will be used to represent the ${context.type} in UI and documentations`,
    search: true,
    default: "other",
    options: [
      ...(context.type === "plugin"
        ? [
          { name: "GitHub", value: "github" },
          { name: "Social", value: "social" },
        ]
        : []),
      ...(context.type === "processor"
        ? [
          { name: "Injector", value: "injector" },
          { name: "Optimizer", value: "optimizer" },
          { name: "Publisher", value: "publisher" },
          { name: "Renderer", value: "renderer" },
          { name: "Transformer", value: "transformer" },
        ]
        : []),
      { name: "Other", value: "other" },
      Select.separator("──── Internal ────".padEnd(36, "─")),
      { name: "Control", value: "control" },
      { name: "Testing", value: "testing" },
      { name: "Legacy", value: "legacy" },
    ],
  })

  // Supported entities and formats
  if (context.supports) {
    Checkbox.inject(context.supports)
  }
  context.supports = await Checkbox.prompt({
    writer,
    message: { plugin: "Supported entities", processor: "Supported formats" }[context.type],
    hint: `This will be used to determine if the ${context.type} can be used on a given ${{ plugin: "entity", processor: "format" }[context.type]} (leave empty to support anything)`,
    options: [
      ...(context.type === "plugin"
        ? [
          { name: "Users", value: "user", checked: true },
          { name: "Organizations", value: "organization", checked: true },
          { name: "Repositories", value: "repository" },
        ]
        : []),
      ...(context.type === "processor"
        ? [
          { name: "XML (or partial SVG image)", value: "application/xml" },
          { name: "SVG image", value: "image/svg+xml" },
          Checkbox.separator("──── Binary images ────".padEnd(36, "─")),
          { name: "PNG image", value: "image/png" },
          { name: "JPEG image", value: "image/jpeg" },
          { name: "WebP image", value: "image/webp" },
          Checkbox.separator("──── Other formats ────".padEnd(36, "─")),
          { name: "Text file", value: "text/plain" },
          { name: "HTML file", value: "text/html" },
          { name: "JSON file", value: "application/json" },
          { name: "PDF file", value: "application/pdf" },
        ]
        : []),
    ],
  })

  // Additional features
  if (context.use) {
    Checkbox.inject(Object.entries(context.use).filter(([, value]) => value).map(([key]) => key))
  }
  const use = await Checkbox.prompt({
    writer,
    message: "Engine features",
    hint: `Toggle engine features to enable in this ${context.type}`,
    options: [
      Checkbox.separator("──── Requests and web scraping APIs ────".padEnd(36, "─")),
      { name: "Use GitHub GraphQL API", value: "graphql" },
      { name: "Use GitHub REST API", value: "rest" },
      { name: "Use fetch API", value: "fetch" },
      { name: "Use web scraping", value: "webscraping" },
      Checkbox.separator("──── Other features ────".padEnd(36, "─")),
      { name: "Add additional documentation directory", value: "docs"}
    ],
  })
  context.use = Object.fromEntries(use.map((key: string) => [key, true]))

  // Review
  await writer.write(new TextEncoder().encode(`\n${yaml(context)}\n`))
  if (!confirm) {
    Confirm.inject("y")
  }
  if (await Confirm.prompt({ writer, message: `Create ${context.type} ?` })) {
    await skeleton(context as context, { dryrun })
  }
}

/** Create component skeleton */
async function skeleton(context: context, { dryrun = false } = {}) {
  const { id, type, use = {} } = context
  const destination = `${dir.source}/${type}s/${id}`

  // Copy files
  switch (type) {
    case "plugin": {
      await copy("templates/classic.ejs", `${destination}/templates/classic.ejs`, { template: true, context, dryrun })
      await copy("tests/list.plugin.yml", `${destination}/tests/list.yml`, { template: true, context, dryrun })
      await copy("mod.plugin.ts", `${destination}/mod.ts`, { template: true, context, dryrun })
      break
    }
    case "processor": {
      await copy("tests/list.processor.yml", `${destination}/tests/list.yml`, { template: true, context, dryrun })
      await copy("mod.processor.ts", `${destination}/mod.ts`, { template: true, context, dryrun })
      break
    }
  }

  // Copy features examples
  if (use.graphql) {
    for (const file of ["queries/example.graphql", "tests/example.graphql.ts"]) {
      await copy(file, `${destination}/${file}`, { dryrun })
    }
  }
  if (use.rest) {
    for (const file of ["tests/rest.ts"]) {
      await copy(file, `${destination}/${file}`, { dryrun })
    }
  }
  if (use.fetch) {
    for (const file of ["tests/example.http.ts"]) {
      await copy(file, `${destination}/${file}`, { dryrun })
    }
  }
  if (use.webscraping) {
    for (const file of ["dom/example.ts"]) {
      await copy(file, `${destination}/${file}`, { dryrun })
    }
  }
  if (use.docs) {
    for (const file of ["docs/example.md"]) {
      await copy(file, `${destination}/${file}`, { dryrun })
    }
  }
}

/** Copy template from source to destination */
async function copy(source: string, destination: string, { template = false, context = {}, dryrun = false } = {}) {
  // Template content
  let content = await read(`${base}/${source}`)
  if (template) {
    content = await ejs.render(content, context, { async: true, _with: true, context: null })
    if (destination.endsWith(".ts")) {
      content = content
        .replace(/^ *\/\/ *\n/gm, "")
        .replace(/\n{3,}/g, "\n\n")
        .replace(/\/\*{3}\s*\*\//g, "")
        .replace(/\/\*{3}(\S.*)\*\//g, "$1")
    }
  }

  // Format typescript code
  if (destination.endsWith(".ts")) {
    const fmt = await createStreaming(fetch("https://plugins.dprint.dev/typescript-0.88.4.wasm"))
    const { fmt: config } = JSONC.parse(await read("deno.jsonc")) as { fmt: Record<PropertyKey, unknown> }
    fmt.setConfig(config, { deno: true, ...config, semiColons: "asi" })
    content = fmt.formatText(destination, content)
  }

  // Write file
  log.io(`writing: ${destination}`)
  if (dryrun) {
    destination = "/dev/null"
  }
  await write(destination, content)
}

/** Context type */
type context = {
  type: "plugin" | "processor"
  id: string
  icon: string
  name: string
  description: string
  category: string
  supports: string[]
  use: {
    graphql?: boolean
    rest?: boolean
    fetch?: boolean
    webscraping?: boolean
    docs?:boolean
  }
}
