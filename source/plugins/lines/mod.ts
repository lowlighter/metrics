// Imports
import { is, parse, Plugin } from "@engine/components/plugin.ts"
import { ignored, matchPatterns, parseHandle } from "@engine/utils/github.ts"
import { delay } from "std/async/delay.ts"
import { Status } from "std/http/status.ts"
import { Graph } from "@engine/utils/graph.ts"

/** Plugin */
export default class extends Plugin {
  /** Import meta */
  static readonly meta = import.meta

  /** Name */
  readonly name = "💻 Lines of code changed"

  /** Category */
  readonly category = "github"

  /** Description */
  readonly description = "Displays the number of lines of code added and removed across repositories"

  /** Supports */
  readonly supports = ["user", "organization", "repository"]

  /** Inputs */
  readonly inputs = is.object({
    display: is.object({
      sections: is.preprocess(
        (value) => [...new Set([value].flat())],
        is.array(is.union([
          is.literal("graph").describe("Diff history graph"),
          is.literal("repositories").describe("Diff history per repository"),
        ])),
      ).default(() => ["graph" as const, "repositories" as const]).describe("Displayed sections"),
      repositories: is.object({
        limit: is.number().min(0).nullable().default(4).describe("Maximum number of repositories to display. Set to `null` to display all repositories"),
        details: is.boolean().default(false).describe("Detailed repositories diff history"),
        sort: is.union([
          is.literal("created_at").describe("Order repositories by creation date"),
          is.literal("updated_at").describe("Order repositories by updated date"),
          is.literal("pushed_at").describe("Order repositories by pushed date"),
          is.literal("name").describe("Order repositories by name"),
          is.literal("stargazers").describe("Order repositories by number of stargazers"),
          is.literal("diff").describe("Order repositories by number of lines changed"),
        ]).default("diff").describe("Repositories sorting method"),
      }).default(() => ({})),
    }).default(() => ({})).describe("Displayed content"),
    repositories: is.object({
      affiliations: is.preprocess(
        (value) => [...new Set([value].flat())],
        is.array(is.union([
          is.literal("owner").describe("Include repositories owned by user"),
          is.literal("collaborator").describe("Include repositories user has been added to as a collaborator"),
          is.literal("organization_member").describe("Include repositories owned by organizations user is a member of"),
        ])),
      ).default(() => ["owner", "collaborator"]).describe("Repository affiliations"),
      visibility: is.union([
        is.literal("public").describe("Includes public repositories only"),
        is.literal("all").describe("Includes public and private repositories (n.b. still subject to token permissions)"),
      ]).default("public").describe("Repository visibility"),
      archived: is.boolean().default(false).describe("Include archived repositories"),
      forked: is.boolean().default(false).describe("Include forked repositories"),
      matching: is.preprocess((value) => [value].flat(), is.array(is.string())).default(() => ["*/*", ...ignored.repositories]).describe(
        "Include repositories matching at least one of these patterns",
      ),
    }).default(() => ({})).describe("Repositories options"),
    history: is.object({
      limit: is.number().min(0).nullable().default(1).describe("Years to keep in history. Set to `null` to keep all history"),
    }).default(() => ({})).describe("History options"),
    contributors: is.object({
      matching: is.preprocess((value) => [value].flat(), is.array(is.string())).default(() => ["*", ...ignored.users]).describe(
        "Include contributors matching at least one of these patterns (n.b. if `entity: user`, the default value will be set to `handle` instead)",
      ),
      limit: is.number().min(0).nullable().default(4).describe("Number of contributors to display. Set to `null` to display all contributors"),
    }).default(() => ({})).describe("Contributors options"),
    fetch: is.object({
      attempts: is.number().min(0).default(30).describe("Number of retries"),
      delay: is.number().min(0).default(3).describe("Delay (in seconds) before trying to fetch data again when it is not ready yet"),
    }).default(() => ({})).describe("Data fetching options"),
  })

  /** Outputs */
  readonly outputs = is.object({
    repositories: is.record(
      is.string().describe("Repository handle"),
      is.object({
        total: is.number().min(0).describe("Total number of lines added, deleted and changed"),
        added: is.number().min(0).describe("Total number of lines added"),
        deleted: is.number().min(0).describe("Total number of lines deleted"),
        changed: is.number().min(0).describe("Total number of lines changed"),
        contributors: is.record(
          is.string().describe("Contributor handle"),
          is.object({
            avatar: is.string().nullable().describe("User avatar"),
            total: is.number().min(0).describe("Total number of lines added, deleted and changed by user"),
            added: is.number().min(0).describe("Total number of lines added by user"),
            deleted: is.number().min(0).describe("Total number of lines deleted by user"),
            changed: is.number().min(0).describe("Total number of lines changed by user"),
          }),
        ).describe("Contributors statistics (n.b. contributors are ordered by the total number of edited lines in descending order)"),
        weeks: is.record(
          is.string(),
          is.object({
            total: is.number().min(0).describe("Total number of lines added, deleted and changed"),
            added: is.number().min(0).describe("Total number of lines added"),
            deleted: is.number().min(0).describe("Total number of lines deleted"),
            changed: is.number().min(0).describe("Total number of lines changed"),
            contributors: is.record(
              is.string().describe("Contributor handle"),
              is.object({
                avatar: is.string().nullable().describe("User avatar"),
                total: is.number().min(0).describe("Number of lines added, deleted and changed by user"),
                added: is.number().min(0).describe("Number of lines added by user"),
                deleted: is.number().min(0).describe("Number of lines deleted by user"),
                changed: is.number().min(0).describe("Number of lines changed by user"),
              }),
            ).describe("Weekly contributors statistics (n.b. contributors are ordered by the total number of edited lines in descending order)"),
          }),
        ).describe("Weekly statistics (n.b. weeks are ordered by date in ascending order)"),
      }),
    ).describe("Repositories statistics"),
  })

  /** EJS template additional rendering context */
  protected _renderctx = { Graph }

  /** Action */
  protected async action() {
    const { handle } = this.context
    const __contributors = this.inputs.shape.contributors.removeDefault()
    const _contributors = __contributors.merge(is.object({ matching: __contributors.shape.matching.default(this.context.entity === "user" ? handle : ["*", ...ignored.users]) })).default(() => ({}))
    const { repositories, fetch: fetching, history, contributors, ...args } = await parse(this.inputs.merge(is.object({ contributors: _contributors })), this.context.args)

    //Fetch repositories
    const { entity: { repositories: { nodes } } } = await this.graphql("repositories", {
      login: handle,
      privacy: repositories.visibility === "all" ? null : repositories.visibility.toLocaleUpperCase(),
      archived: repositories.archived ? null : false,
      forked: repositories.forked ? null : false,
      affiliations: repositories.affiliations.map((affiliation) => affiliation.toLocaleUpperCase()),
      sort: ({ diff: "CREATED_AT" }[args.display.repositories.sort as string] ?? args.display.repositories.sort).toLocaleUpperCase(),
    }, { paginate: true })

    //Fetch contributors stats
    const pending = []
    for (const { name } of nodes.filter(({ name }: { name: string }) => matchPatterns(repositories.matching, name))) {
      pending.push((async () => {
        const { owner, name: repo } = parseHandle(name, { entity: "repository" })
        for (let i = 0; i < fetching.attempts; i++) {
          const { status, data } = await this.rest(this.api.repos.getContributorsStats, { owner, repo })
          if (status === Status.OK) {
            return { repo: name, data }
          }
          if (status === Status.NoContent as typeof status) {
            this.log.debug(`${name} is empty`)
            return { repo: name, data: [] }
          }
          this.log.trace(`${name} contributors stats: status ${status}`)
          if (fetching.delay) {
            this.log.trace(`${name} contributors stats: retrying in ${fetching.delay}s...`)
            await delay(fetching.delay * 1000)
          }
        }
        return { repo: name, data: null }
      })())
    }
    const fetched = [...await Promise.allSettled(pending)].filter((result): result is Exclude<typeof result, PromiseRejectedResult> => result.status === "fulfilled").map(({ value }) => value)

    //Compute lines
    type lines = { total: number; added: number; deleted: number; changed: number }
    type entry = { contributors: { [login: string]: lines }; weeks: { [date: string]: lines & { contributors: { [login: string]: lines & { avatar: string | null } } } } }
    const result = { repositories: {} } as { repositories: { [repo: string]: lines & entry } }
    for (const { repo, data } of fetched) {
      if (!Array.isArray(data)) {
        this.log.debug(`skipping lines from ${repo}: no data`)
        continue
      }
      const stats = { contributors: {}, weeks: {} } as entry
      for (const contributor of data.filter(({ author }) => contributors.matching.some((pattern) => matchPatterns(pattern, author?.login)))) {
        const user = { login: contributor.author?.login ?? null, avatar: contributor.author?.avatar_url ?? null, total: 0, added: 0, deleted: 0, changed: 0 }
        this.log.debug(`processing lines from ${repo} by ${user.login ?? "(unregistered user)"}`)
        for (const { w: timestamp = NaN, a: added = 0, d: deleted = 0, c: changed = 0 } of contributor.weeks) {
          if (!Number.isFinite(timestamp)) {
            continue
          }
          if ((typeof history.limit === "number") && (new Date(timestamp * 1000).getFullYear() < new Date().getFullYear() - history.limit)) {
            continue
          }
          const date = new Date(timestamp * 1000).toISOString().substring(0, 10)
          if (!stats.weeks[date]) {
            stats.weeks[date] = { total: 0, added: 0, deleted: 0, changed: 0, contributors: {} }
          }
          stats.weeks[date].added += added
          stats.weeks[date].deleted += deleted
          stats.weeks[date].changed += changed
          stats.weeks[date].total += added + deleted + changed
          if (user.login) {
            if (!stats.weeks[date].contributors[user.login]) {
              stats.weeks[date].contributors[user.login] = { avatar: user.avatar, total: 0, added: 0, deleted: 0, changed: 0 }
            }
            stats.weeks[date].contributors[user.login].added += added
            stats.weeks[date].contributors[user.login].deleted += deleted
            stats.weeks[date].contributors[user.login].changed += changed
            stats.weeks[date].contributors[user.login].total += added + deleted + changed
          }
          user.added += added
          user.deleted += deleted
          user.changed += changed
          user.total += added + deleted + changed
        }
        if (user.login) {
          stats.contributors[user.login] = user
        }
      }
      result.repositories[repo] = {
        total: Object.values(stats.weeks).reduce((lines, { total }) => lines + total, 0),
        added: Object.values(stats.weeks).reduce((lines, { added }) => lines + added, 0),
        deleted: Object.values(stats.weeks).reduce((lines, { deleted }) => lines + deleted, 0),
        changed: Object.values(stats.weeks).reduce((lines, { changed }) => lines + changed, 0),
        contributors: Object.fromEntries(Object.entries(stats.contributors).sort(([_a, a], [_b, b]) => b.total - a.total).slice(0, contributors.limit ?? Infinity)),
        weeks: Object.fromEntries(Object.entries(stats.weeks).sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())),
      }
    }
    if (args.display.repositories.sort === "diff") {
      result.repositories = Object.fromEntries(Object.entries(result.repositories).sort(([_, a], [__, b]) => b.total - a.total))
    }

    return result
  }
}
