//Imports
import { Internal, is } from "@engine/components/internal.ts"
import { cli as schema, load } from "@engine/config.ts"
import github from "y/@actions/github@5.1.1?pin=v133"
import { latest, version } from "@engine/version.ts"
import core from "y/@actions/core@1.10.1?pin=v133"
import { process } from "@engine/process.ts"
import { env } from "@engine/utils/deno/env.ts"
import { compat } from "@run/compat/mod.ts"
import { parse } from "@engine/utils/validation.ts"
import { Server } from "@run/serve/server.ts"
import { Command, EnumType } from "x/cliffy@v1.0.0-rc.3/command/mod.ts"
import { create } from "@run/create/mod.ts"

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
  switch (true) {
    // Deployment
    case env.deployment: {
      new CLI().serve()
      break
    }
    // CLI usage
    default: {
      await new Command()
        .name("metrics")
        .description("A simple reverse proxy example cli.")
        .version(version.number)
        .helpOption("-h, --help", "Show this help", function (this: Command) {
          console.log(this.getHelp())
        })
        .versionOption("-v, --version", "Show version number", function (this: Command) {
          console.log(this.getVersion())
        })
        .action(function (this: Command) {
          console.log(this.getHelp())
        })
        // GitHub actions
        .command("github-action")
        .hidden()
        .description("Run metrics as a GitHub action")
        .action(() => new CLI().run())
        // Run metrics engine
        .command("run")
        .description("Run metrics")
        .option("-c, --config <file:string>", "Metrics configuration file", { default: "metrics.config.yml" })
        .action(async ({ config }) => new CLI(await load(config)).run())
        // Start metrics server
        .command("serve")
        .description("Start metrics server")
        .option("-c, --config <file:string>", "Metrics configuration file", { default: "metrics.config.yml" })
        .action(async ({ config }) => new CLI(await load(config)).serve())
        // Create a new component
        .command("create")
        .type("component", new EnumType(["plugin", "processor"]))
        .description("Create a new plugin or processor")
        .option("-i, --icon <icon:string>", "Component icon")
        .option("-n, --name <name:string>", "Component name")
        .option("-d, --description <description:string>", "Component description")
        .option("-c, --category <category:string>", "Component category")
        .option("-s, --supports <scopes:string>", "Component supported targets", { collect: true })
        .option("-u.g, --use.graphql", "Component uses GitHub GraphQL API")
        .option("-u.r, --use.rest", "Component uses GitHub REST API")
        .option("-u.f, --use.fetch", "Component uses fetch API")
        .option("-u.w, --use.webscraping", "Component uses web scraping")
        .option("-y, --yes", "Skip confirmation")
        .option("--dryrun", "Dryrun")
        .arguments("<type:component> [id:string]")
        .action(({ dryrun, yes, ...options }, type, id) => create({ type, id, ...options }, { dryrun, confirm: !yes }))
        // Parse arguments
        .parse(Deno.args)
    }
  }
}
