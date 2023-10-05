//Imports
import { Internal, is, toSchema } from "@metrics/components/internal.ts"
import { compare } from "y/compare-versions@6.1.0"
import { action as schema } from "@metrics/config.ts"
import github from "y/@actions/github@5.1.1"
import { version } from "@metrics/version.ts"
import { Requests } from "@metrics/components/requests.ts"
import core from "y/@actions/core@1.10.1"

/** GitHub Action */
class Action extends Internal {
  /** Import meta */
  static readonly meta = import.meta

  /** Context */
  declare protected readonly context: is.infer<typeof schema>

  /** Constructor */
  constructor(context = {} as Record<PropertyKey, unknown>) {
    super(schema.parse(context))
    this.requests = new Requests(this.meta, this.context)
  }

  /** Requests */
  private readonly requests

  /** Start action */
  async start() {
    this.log.info(`Metrics ${version}`)
    this.log.probe(github.context)

    // Check for updates
    if (this.context.check_updates) {
      const { data: [{ tag_name: tag }] } = await this.requests.api.repos.listReleases({ owner: "lowlighter", repo: "metrics" })
      if (compare(version, tag, "<")) {
        core.info(`Version ${tag} is available!`)
      }
    }

    //TODO(@lowlighter): to implement
  }

  /** Metadata */
  protected get metadata() {
    return {
      inputs: toSchema(schema.omit({ config: true })),
    }
  }
}

// Entry point
if (import.meta.main) {
  await new Action().start()
}
