// Imports
import { join } from "std/path/join.ts"
import { parse } from "std/flags/mod.ts"
import { cwd, env } from "@utils/io.ts"
import { expandGlobSync } from "std/fs/expand_glob.ts"

// Flags
const { "allow-net": _net = [], "allow-sys": _sys = [], "allow-write": _write = [], "allow-run": _run = [], _: [subcommand, ...args], ..._flags } = parse(Deno.args, {
  collect: ["allow-net", "allow-sys", "allow-write", "allow-run", "allow-ffi", "allow-hrtime"],
})
if (!subcommand) {
  console.log("echo 'missing subcommand'")
}

// Paths
const PWD = env.get("PWD") ?? cwd()
const TMP = env.get("TMP") ?? join(PWD, "/.tmp")
const TEST = join(PWD, "/.test")
const CACHE = join(PWD, "/node_modules/.cache")
if ((!PWD) || (!TMP)) {
  console.log("echo 'missing PWD or TMP environment variables'")
}

// Network
const net = new Set([
  // Dependencies
  "deno.land/std",
  "deno.land/x",
  "esm.sh",
  "registry.npmjs.org",
  // Puppeteer
  "127.0.0.1",
  "storage.googleapis.com",
  // User defined
  ..._net,
])

// System
const sys = new Set([
  // Puppeteer (as SIGHUP is not implemented on Windows, it is needed to detect on which OS the app is runnnig)
  "osRelease",
  // User defined
  ..._sys,
])

// Write
const write = new Set([
  // Dependencies
  TMP,
  // Puppeteer
  join(CACHE, "chromium"),
  // KV store
  join(PWD, ".kv"),
  // User defined
  ..._write,
])

// Process
const run = new Set([
  // Puppeteer
  ...[...expandGlobSync(join(CACHE, "chromium/**/*.exe"))].map(({ path }) => path),
  // User defined
  ..._run,
])

// Additional flags
const dflags = ["--allow-ffi", "--allow-hrtime", "--allow-all", "--watch", "--no-check", "--reload"]

// Additional arguments based on sub command
switch (subcommand) {
  case "test":
    // processors/render.gemojis
    net.add("api.github.com/emojis")
    // processors/render.twemojis
    net.add("cdn.jsdelivr.net")
    // Temporary test files
    write.add(TEST)
    // Subprocess
    run.add("deno")
    // Arguments
    args.unshift(
      "--seed=0",
      "--trace-ops",
      // "--parallel",
      "--coverage=.coverage",
      "--doc",
      //  "--shuffle",
    )
    dflags.push("--fail-fast", "--filter")
    break
  case "run":
    // Temporary test files
    if (args.includes("source/metrics/utils/browser.ts")) {
      write.add(TEST)
    }

    // GitHub API
    net.add("api.github.com")
    // Github OAuth
    net.add("github.com/login/oauth")
    break
}
const flags = {
  deno: Object.entries(_flags).filter(([k]) => dflags.includes(`--${k}`)).map(([k, v]) => `--${k}${v !== true ? `=${v}` : ""}`),
  user: Object.entries(_flags).filter(([k]) => !dflags.includes(`--${k}`)).map(([k, v]) => `--${k}${v !== true ? `=${v}` : ""}`),
}

// Command
console.log([
  // Subcommand
  "deno",
  subcommand,
  "--unstable",
  // Minimal permissions
  "--allow-env",
  "--allow-read",
  // Granular permissions
  `--allow-net=${[...net]}`,
  `--allow-write=${[...write]}`,
  `--allow-run=${[...run]}`,
  `--allow-sys=${[...sys]}`,
  // Additional arguments
  ...flags.deno,
  ...args,
  ...flags.user,
].join(" "))
