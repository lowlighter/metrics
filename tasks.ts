// Imports
import * as JSONC from "https://deno.land/std@0.203.0/jsonc/mod.ts"
import { z as is } from "https://deno.land/x/zod@v3.21.4/mod.ts"
import { assertEquals, assertMatch, assertThrows } from "https://deno.land/std@0.203.0/assert/mod.ts"
import { expandGlobSync } from "https://deno.land/std@0.203.0/fs/expand_glob.ts"
import { parse } from "https://deno.land/std@0.203.0/flags/mod.ts"
import { bgBrightBlue, gray } from "https://deno.land/std@0.203.0/fmt/colors.ts"
import { italic } from "https://deno.land/std@0.203.0/fmt/colors.ts"
import { load } from "https://deno.land/std@0.203.0/dotenv/mod.ts"
import stringArgv from "https://esm.sh/string-argv@0.3.2"

/** Parsing ========================================================================================================= */

/** Enums */
const enums = {
  empty: [""],
  check: ["all", "remote"],
  target: ["x86_64-unknown-linux-gnu", "x86_64-pc-windows-msvc", "x86_64-apple-darwin", "aarch64-apple-darwin"],
  reporter: ["pretty", "dot", "junit", "tap"],
  sysPermission: ["hostname", "osRelease", "osUptime", "loadavg", "networkInterfaces", "systemMemoryInfo", "uid", "gid"],
} as const
type Enum<T extends keyof typeof enums = keyof typeof enums> = [typeof enums[T][0], ...typeof enums[T]]

/** Validators */
const isTruthy = (key: string, { validate = "" } = {}) => is.boolean().transform((v) => v === true ? `--${validate ? `${validate}-` : ""}${key}` : "")
const isFalsy = (key: string, { negate = "no" } = {}) => is.boolean().transform((v) => v === false ? `--${negate ? `${negate}-` : ""}${key}` : "")
const isNumber = (key: string, { boolean = false } = {}) =>
  is.union([boolean ? is.boolean() : is.never(), is.number().int().min(0)]).transform((v) => typeof v === "number" ? `--${key}=${v}` : v === true ? `--${key}` : "")
const isString = (key: string, { boolean = false, validate = "", negate = "no", values = enums.empty as readonly unknown[] } = {}) =>
  is.union([boolean ? is.boolean() : is.never(), values.filter((x) => x).length ? is.enum(values as Enum) : is.string().min(1)]).transform((v) =>
    typeof v === "string" ? `--${key}=${v}` : v === true ? `--${validate ? `${validate}-` : ""}${key}` : (v === false) && negate ? `--${negate}-${key}` : ""
  )
const isStringArray = (key: string, { boolean = false, glob = false, values = enums.empty as readonly unknown[] } = {}) =>
  is.union([boolean ? is.boolean() : is.never(), is.preprocess((v) => [v].flat(Infinity), is.array(values.filter((x) => x).length ? is.enum(values as Enum) : is.string().min(1)).min(1))]).transform((
    v,
  ) => Array.isArray(v) ? `--${key}=${v.flatMap((p) => glob ? expandGlob(p) : p).join(",")}` : v === true ? `--${key}` : "")
const isPermissions = (key: string, { glob = false } = {}) =>
  is.union([
    is.boolean(),
    is.preprocess(
      (v) => [v].flat(Infinity),
      is.array(
        is.union([is.string().min(1), is.object({ allow: is.string().min(1) }).strict(), is.object({ deny: is.string().min(1) }).strict()]).transform<Array<{ allow: string; deny: string }>>((v) => {
          const normalized = (typeof v === "object") ? { allow: "", deny: "", ...v } : { allow: v, deny: "" }
          const expanded = [] as Array<typeof normalized>
          if (glob) {
            for (const key of ["allow", "deny"] as const) {
              if (normalized[key]) {
                expanded.push(...expandGlob(normalized[key]).map((w) => ({ [key]: w, [{ allow: "deny", deny: "allow" }[key]]: "" } as typeof normalized)))
              }
            }
          } else {
            expanded.push(normalized)
          }
          return expanded
        }),
      ).min(1).transform((v) => [v].flat(Infinity) as Array<{ allow: string; deny: string }>),
    ),
  ]).transform((v) =>
    Array.isArray(v)
      ? [`--allow-${key}=${v.map(({ allow }) => allow).filter((x) => x).join(",")}`, `--deny-${key}=${v.map(({ deny }) => deny).filter((x) => x).join(",")}`].filter((x) => !x.endsWith("=")).join(" ")
        .trim()
      : v === true
      ? `--allow-${key}`
      : v === false
      ? `--deny-${key}`
      : ""
  )

/** Config parser */
const config = is.object({
  unstable: isTruthy("unstable"),
  quiet: isTruthy("quiet"),
  check: isString("check", { boolean: true, values: enums.check }),
  remote: isFalsy("remote"),
  npm: isFalsy("npm"),
  cachedOnly: isTruthy("cached-only"),
  reload: isStringArray("reload", { boolean: true, glob: true }),
  watch: isStringArray("watch", { boolean: true, glob: true }),
  location: isString("location"),
  lock: isFalsy("lock"),
  seed: isNumber("seed"),
  permissions: is.object({
    all: isTruthy("all", { validate: "allow" }),
    read: isPermissions("read", { glob: true }),
    write: isPermissions("write", { glob: true }),
    net: isPermissions("net"),
    env: isPermissions("env"),
    sys: isStringArray("sys", { boolean: true, values: enums.sysPermission }),
    run: isPermissions("run", { glob: true }),
    ffi: isPermissions("ffi", { glob: true }),
    hrtime: isTruthy("hrtime", { validate: "allow" }),
    prompt: isFalsy("prompt"),
  }).partial(),
  json: isTruthy("json"),
  ignore: isStringArray("ignore", { glob: true }),
  filter: isString("filter"),
  run: isFalsy("run"),
  include: isStringArray("include", { glob: true }),
  output: isString("output"),
  target: isString("target", { values: enums.target }),
  terminal: isFalsy("terminal"),
  traceOps: isTruthy("trace-ops"),
  doc: isTruthy("doc"),
  failFast: isNumber("fail-fast", { boolean: true }),
  shuffle: isNumber("shuffle", { boolean: true }),
  coverage: isString("coverage"),
  parallel: isTruthy("parallel"),
  reporter: isString("reporter", { values: enums.reporter }),
}).partial().transform((v) => Object.values(v).flatMap((f) => typeof f === "object" ? [...Object.values(f)] : f).filter(Boolean))

/** Meta parser */
const meta = is.object({
  task: is.preprocess((v) => [v].flat(Infinity), is.array(is.string())),
  description: is.string().default(""),
  cwd: is.string().default(Deno.cwd()),
  env: is.record(is.string(), is.union([is.boolean(), is.string()])).transform((v) =>
    Object.fromEntries(Object.entries(v).map(([k, v]) => [k, v === true ? Deno.env.get(k) ?? "" : v === false ? "" : v]))
  ).default(() => ({})),
})

/** Expand glob */
function expandGlob(pattern: string) {
  pattern = pattern.replaceAll(/\$(\w+)/g, (match, name) => Deno.env.get(name) ?? (name === "CWD" ? Deno.cwd() : match))
  const expanded = [...expandGlobSync(pattern, { includeDirs: false, caseInsensitive: true })]
  return expanded.length ? expanded.map(({ path }) => path) : !pattern.includes("*") ? [pattern] : []
}

/** Tasks ========================================================================================================= */

/** Task */
class Task {
  /** Task name */
  readonly name

  /** Task metadata */
  readonly meta

  /** Task flags */
  readonly flags

  /** Constructor */
  constructor(name: string, content: unknown) {
    this.name = name
    this.meta = meta.parse(content)
    this.flags = config.parse(content)
  }

  /** Command */
  get command() {
    const args = []
    for (const task of this.meta.task) {
      const argv = stringArgv(task)
      const argc = []
      let isDeno = false
      for (let i = 0; i < argv.length; i++) {
        const arg = argv[i]
        argc.push(arg)
        if (arg === "deno") {
          isDeno = true
          continue
        }
        if (isDeno && (["test", "run"].includes(arg))) {
          argc.push(...this.flags)
          isDeno = false
          continue
        }
        isDeno = false
      }
      //TODO(@lowlighter): is bad
      args.push(argc.map((a) => a.includes(" ") ? `'${a}'` : a).join(" "))
    }
    return args.join(" && ")
  }

  /** Run task */
  async run() {
    console.log(gray(`$ ${this.command}`))
    await Deno.writeTextFile(".btr.json", JSON.stringify({ tasks: { btr: this.command } }))
    const command = new Deno.Command("deno", {
      args: ["task", "--config", ".btr.json", "btr"],
      stdout: "inherit",
      stderr: "inherit",
      stdin: "inherit",
      cwd: this.meta.cwd,
      env: this.meta.env,
      windowsRawArguments: true,
    })
    const { code } = await command.output()
    Deno.exit(code)
  }

  /** Print tasks list */
  about() {
    const { columns } = Deno.consoleSize()
    const split = (text: string) => {
      return [...text.matchAll(new RegExp(`.{1,${columns - 4}}`, "g"))].map(([line]) => line.padEnd(columns - 4, " "))
    }
    console.log(`╔═${bgBrightBlue(` ${this.name} `)}${"═".repeat(columns - this.name.length - 5)}╗`)
    split(this.meta.description).forEach((line) => console.log(`║ ${line} ║`))
    split(" ").forEach((line) => console.log(`║ ${line} ║`))
    split(`${this.command}`).forEach((line) => console.log(`║ ${italic(gray(line))} ║`))
    console.log(`╚${"═".repeat(columns - 2)}╝`)
    console.log(" ")
  }
}

/** Main ========================================================================================================= */

async function main() {
  await load({ export: true })
  const { _: [task], ..._args } = parse(Deno.args)
  const { "btr-tasks": tasks } = JSONC.parse(await Deno.readTextFile("deno.jsonc"))
  if (task) {
    await new Task(`${task}`, tasks[task]).run()
  } else {
    for (const [k, v] of Object.entries(tasks)) {
      new Task(k, v).about()
    }
  }
}
if (import.meta.main) {
  await main()
}

/** Tests ========================================================================================================= */
Deno.test("isTruthy / booleans", () => {
  assertEquals(isTruthy("foo").parse(true), "--foo")
  assertEquals(isTruthy("foo").parse(false), "")
  assertThrows(() => isTruthy("foo").parse(""))
})

Deno.test("isTruthy / alternate flags", () => {
  assertEquals(isTruthy("foo", { validate: "" }).parse(true), "--foo")
  assertEquals(isTruthy("foo", { validate: "yes" }).parse(true), "--yes-foo")
  assertThrows(() => isTruthy("foo").parse(""))
})

Deno.test("isFalsy / booleans", () => {
  assertEquals(isFalsy("foo").parse(true), "")
  assertEquals(isFalsy("foo").parse(false), "--no-foo")
  assertThrows(() => isFalsy("foo").parse(""))
})

Deno.test("isFalsy / alternate flags", () => {
  assertEquals(isFalsy("foo", { negate: "" }).parse(false), "--foo")
  assertEquals(isFalsy("foo", { negate: "no" }).parse(false), "--no-foo")
})

Deno.test("isNumber / numbers", () => {
  assertEquals(isNumber("foo").parse(0), "--foo=0")
  assertThrows(() => isNumber("foo").parse(NaN))
  assertThrows(() => isNumber("foo").parse(""))
})

Deno.test("isNumber / booleans", () => {
  assertEquals(isNumber("foo", { boolean: true }).parse(true), "--foo")
  assertEquals(isNumber("foo", { boolean: true }).parse(false), "")
  assertThrows(() => isNumber("foo", { boolean: false }).parse(true))
  assertThrows(() => isNumber("foo", { boolean: false }).parse(false))
})

Deno.test("isString / strings", () => {
  assertEquals(isString("foo").parse("bar"), "--foo=bar")
  assertThrows(() => isString("foo").parse(""))
  assertThrows(() => isString("foo").parse(0))
  assertThrows(() => isString("foo").parse(true))
})

Deno.test("isString / enums", () => {
  assertEquals(isString("foo", { values: enums.check }).parse("all"), "--foo=all")
  assertEquals(isString("foo", { values: enums.check, boolean: true, validate: "yes" }).parse(true), "--yes-foo")
  assertEquals(isString("foo", { values: enums.check, boolean: true, negate: "no" }).parse(false), "--no-foo")
  assertEquals(isString("foo", { values: enums.check, boolean: true, negate: "" }).parse(false), "")
  assertThrows(() => isString("foo", { values: enums.check }).parse("bad_value"))
  assertThrows(() => isString("foo", { values: enums.check }).parse(["bad_value"]))
  assertThrows(() => isString("foo", { values: enums.check }).parse(true))
})

Deno.test("isString / booleans", () => {
  assertEquals(isString("foo", { boolean: true }).parse(true), "--foo")
  assertEquals(isString("foo", { boolean: true, validate: "yes" }).parse(true), "--yes-foo")
  assertEquals(isString("foo", { boolean: true, negate: "no" }).parse(false), "--no-foo")
  assertEquals(isString("foo", { boolean: true, negate: "" }).parse(false), "")
  assertThrows(() => isString("foo", { boolean: false }).parse(true))
  assertThrows(() => isString("foo", { boolean: false }).parse(false))
})

Deno.test("isStringArray / strings", () => {
  assertEquals(isStringArray("foo").parse("bar"), "--foo=bar")
  assertEquals(isStringArray("foo").parse(["bar"]), "--foo=bar")
  assertEquals(isStringArray("foo").parse(["bar", "baz"]), "--foo=bar,baz")
  assertThrows(() => isString("foo").parse(""))
  assertThrows(() => isString("foo").parse([""]))
  assertThrows(() => isString("foo").parse(true))
})

Deno.test("isStringArray / glob strings", () => {
  assertMatch(isStringArray("foo", { glob: true }).parse("*.jsonc"), /--foo=.*deno.jsonc/)
  assertEquals(isStringArray("foo", { glob: false }).parse("*.jsonc"), "--foo=*.jsonc")
})

Deno.test("isStringArray / enums", () => {
  assertEquals(isStringArray("foo", { values: enums.check }).parse("all"), "--foo=all")
  assertEquals(isStringArray("foo", { values: enums.check }).parse(["all", "remote"]), "--foo=all,remote")
  assertEquals(isStringArray("foo", { values: enums.check, boolean: true }).parse(true), "--foo")
  assertEquals(isStringArray("foo", { values: enums.check, boolean: true }).parse(false), "")
  assertThrows(() => isStringArray("foo", { values: enums.check }).parse("bad_value"))
  assertThrows(() => isStringArray("foo", { values: enums.check }).parse(["bad_value"]))
  assertThrows(() => isStringArray("foo", { values: enums.check }).parse(true))
})

Deno.test("isStringArray / booleans", () => {
  assertEquals(isStringArray("foo", { boolean: true }).parse(true), "--foo")
  assertEquals(isStringArray("foo", { boolean: true }).parse(false), "")
})

Deno.test("isPermissions / booleans", () => {
  assertEquals(isPermissions("foo").parse(true), "--allow-foo")
  assertEquals(isPermissions("foo").parse(false), "--deny-foo")
})

Deno.test("isPermissions / strings", () => {
  assertEquals(isPermissions("foo").parse("bar"), "--allow-foo=bar")
  assertEquals(isPermissions("foo").parse(["bar"]), "--allow-foo=bar")
  assertEquals(isPermissions("foo").parse(["bar", "baz"]), "--allow-foo=bar,baz")
  assertThrows(() => isPermissions("foo").parse(""))
  assertThrows(() => isPermissions("foo").parse([]))
  assertThrows(() => isPermissions("foo").parse([""]))
})

Deno.test("isPermissions / objects", () => {
  assertEquals(isPermissions("foo").parse({ allow: "bar" }), "--allow-foo=bar")
  assertEquals(isPermissions("foo").parse({ deny: "bar" }), "--deny-foo=bar")
  assertEquals(isPermissions("foo").parse([{ allow: "bar" }]), "--allow-foo=bar")
  assertEquals(isPermissions("foo").parse([{ deny: "bar" }]), "--deny-foo=bar")
  assertEquals(isPermissions("foo").parse([{ allow: "bar" }, { deny: "bar" }]), "--allow-foo=bar --deny-foo=bar")
  assertThrows(() => isPermissions("foo").parse([{ deny: "" }]))
  assertThrows(() => isPermissions("foo").parse([{ allow: "" }]))
  assertThrows(() => isPermissions("foo").parse([{ allow: "bar", deny: "bar" }]))
})

Deno.test("isPermissions / glob strings", () => {
  assertMatch(isPermissions("foo", { glob: true }).parse("*.jsonc"), /--allow-foo=.*deno.jsonc/)
  assertMatch(isPermissions("foo", { glob: true }).parse({ allow: "*.jsonc" }), /--allow-foo=.*deno.jsonc/)
  assertEquals(isPermissions("foo", { glob: false }).parse("*.jsonc"), "--allow-foo=*.jsonc")
  assertEquals(isPermissions("foo", { glob: false }).parse({ deny: "*.jsonc" }), "--deny-foo=*.jsonc")
})

Deno.test("config", () => {
  assertEquals(config.parse({ unstable: true }), ["--unstable"])
  assertEquals(config.parse({ check: "remote" }), ["--check=remote"])
  assertEquals(config.parse({ permissions: { all: true } }), ["--allow-all"])
  assertEquals(config.parse({ permissions: { read: ["foo", "bar"] } }), ["--allow-read=foo,bar"])
  assertEquals(config.parse({ permissions: { read: ["foo", "bar"], write: true, run: false } }), ["--allow-read=foo,bar", "--allow-write", "--deny-run"])
})
