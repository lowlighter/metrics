//Imports
import { Internal, is } from "@engine/components/internal.ts"
import { cli as schema, load } from "@engine/config.ts"
import github from "y/@actions/github@5.1.1?pin=v133"
import { latest, version } from "@engine/version.ts"
import core from "y/@actions/core@1.10.1?pin=v133"
import { process } from "@engine/process.ts"
import { parse as parseFlags } from "std/flags/mod.ts"
import { brightRed, cyan, gray } from "std/fmt/colors.ts"
import { env } from "@engine/utils/deno/env.ts"
import { compat } from "@run/compat.ts"
import { parse } from "@engine/utils/validation.ts"
import { Server } from "@run/serve/server.ts"

/** CLI */
class CLI extends Internal {
  /** Import meta */
  static readonly meta = import.meta

  /** Context */
  declare protected readonly context: is.infer<typeof schema>

  /** Constructor */
  constructor(config = {} as Record<PropertyKey, unknown>) {
    super(parse(schema, config, { sync: true }))
    this.config = config
  }

  /** Configuration */
  protected readonly config

  /** Run metrics */
  async run() {
    this.log.info(`Metrics ${version.number}`)
    this.log.probe(github.context)
    this.log.probe(Deno.env.toObject())
    // GitHub action setup
    if ((env.actions) && (env.get("INPUTS"))) {
      const inputs = JSON.parse(env.get("INPUTS")!) as Record<PropertyKey, unknown>
      for (const [key, value] of Object.entries(inputs)) {
        env.set(`INPUT_${key.replace(/ /g, "_").toUpperCase()}`, `${value}`)
      }
      console.log("config", core.getInput("config"))
      await compat(inputs)
    }
    // Check for updates
    if (this.context.check_updates) {
      const upstream = await latest()
      if (version.number !== upstream) {
        core.info(`Version ${upstream} is available!`)
      }
    }
    // Run metrics
    await process(this.context.config)
  }

  /** Start metrics serve */
  serve() {
    return new Server(this.config).start()
  }
}

// Entry point
if (import.meta.main) {
  let { _: [action = "help"], config } = parseFlags(Deno.args)
  if (env.deployment) {
    action = "serve"
  }
  switch (action) {
    case "run": {
      await new CLI(await load(config)).run()
      break
    }
    case "version": {
      console.log(version.number)
      break
    }
    case "serve": {
      new CLI(await load(config)).serve()
      break
    }
    default:
      console.log(brightRed(`Unknown action: ${action}`))
      /* falls through */
    case "help": {
      console.log([
        cyan(`Metrics ${version.number}`),
        "",
        "Usage is:",
        "  help               Show this help message",
        "  version            Show version number",
        "  run                Run metrics",
        "  serve              Start metrics server",
        gray("    --config <path>  Path to configuration file"),
        "",
      ].join("\n"))
    }
  }
}
