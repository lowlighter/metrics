// Imports
import { is, Plugin } from "@engine/components/plugin.ts"
import { matchPatterns, parseHandle } from "@engine/utils/github.ts"
import { delay } from "std/async/delay.ts"
import { Status } from "std/http/http_status.ts"

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
    repositories: is.object({
      affiliations: is.preprocess((value) => [value].flat(), is.array(is.enum(["owner", "collaborator", "organization_member"]))).default(["owner", "collaborator"]).describe(
        "Repository affiliations",
      ),
      visibility: is.enum(["public", "all"]).default("public").describe("Repository visibility"),
      archived: is.boolean().default(false).describe("Include archived repositories"),
      forked: is.boolean().default(false).describe("Include forked repositories"),
      matching: is.preprocess((value) => [value].flat(), is.array(is.coerce.string())).default("*/*").describe("Include repositories matching at least one of these patterns"),
    }).default(() => ({})).describe("Repositories options"),
    history: is.object({
      limit: is.number().min(0).nullable().default(1).describe("Years to keep in history (use `null` to keep all history)"),
    }).default(() => ({})).describe("History options"),
    contributors: is.object({
      matching: is.preprocess((value) => [value].flat(), is.array(is.coerce.string())).default("*").describe(
        "Include contributors matching at least one of these patterns (note: if `entity` is set to `user`, the default value will be set to the user `handle` instead of `*`)",
      ),
      limit: is.number().min(0).nullable().default(4).describe("Number of contributors to display (use `null` to display all contributors)"),
    }).default(() => ({})).describe("Contributors options"),
    fetch: is.object({
      attempts: is.number().min(0).default(30).describe("Number of retries"),
      delay: is.number().min(0).default(3).describe("Delay (in seconds) before trying to fetch data again when it is not ready yet"),
    }).default(() => ({})).describe("Data fetching options"),
  })

  /** Outputs */
  readonly outputs = is.object({
    repositories: is.record(
      is.string(),
      is.object({
        total: is.number().min(0).describe("Total number of lines added, deleted and changed"),
        added: is.number().min(0).describe("Total number of lines added"),
        deleted: is.number().min(0).describe("Total number of lines deleted"),
        changed: is.number().min(0).describe("Total number of lines changed"),
        contributors: is.record(
          is.string(),
          is.object({
            avatar: is.string().nullable().describe("User avatar"),
            total: is.number().min(0).describe("Total number of lines added, deleted and changed"),
            added: is.number().min(0).describe("Total number of lines added"),
            deleted: is.number().min(0).describe("Total number of lines deleted"),
            changed: is.number().min(0).describe("Total number of lines changed"),
          }),
        ).describe("Contributors statistics (contributors are ordered by the total number of lines added, deleted and changed in a descending order)"),
        weeks: is.record(
          is.string(),
          is.object({
            total: is.number().min(0).describe("Total number of lines added, deleted and changed"),
            added: is.number().min(0).describe("Total number of lines added"),
            deleted: is.number().min(0).describe("Total number of lines deleted"),
            changed: is.number().min(0).describe("Total number of lines changed"),
            contributors: is.record(
              is.string(),
              is.object({
                avatar: is.string().nullable().describe("User avatar"),
                total: is.number().min(0).describe("Number of lines added, deleted and changed"),
                added: is.number().min(0).describe("Number of lines added"),
                deleted: is.number().min(0).describe("Number of lines deleted"),
                changed: is.number().min(0).describe("Number of lines changed"),
              }),
            ).describe("Weekly contributors statistics (contributors are ordered by the total number of lines added, deleted and changed in a descending order)"),
          }),
        ).describe("Weekly statistics (weeks are ordered by date in an ascending order)"),
      }),
    ).describe("Repositories statistics"),
  })

  /** Action */
  protected async action() {
    const { handle } = this.context
    const __contributors = this.inputs.shape.contributors.removeDefault()
    const _contributors = __contributors.merge(is.object({ matching: __contributors.shape.matching.default(this.context.entity === "user" ? handle : "*") })).default(() => ({}))
    const { repositories, fetch: fetching, history, contributors } = await this.inputs.merge(is.object({ contributors: _contributors })).parseAsync(this.context.args)

    //Fetch repositories
    const { entity: { repositories: { nodes } } } = await this.graphql("repositories", {
      login: handle,
      privacy: repositories.visibility === "all" ? null : repositories.visibility.toLocaleUpperCase(),
      archived: repositories.archived ? null : false,
      forked: repositories.forked ? null : false,
      affiliations: repositories.affiliations.map((affiliation) => affiliation.toLocaleUpperCase()),
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

    return result
  }
}

/*

  plugin_lines_sections:
    description: |
      Displayed sections

      - `base` will display the total lines added and removed in `base.repositories` section
      - `repositories` will display repositories with the most lines added and removed
      - `history` will display a graph displaying lines added and removed over time

      > ℹ️ `base` requires at least [`base: repositories`](/source/plugins/base/README.md#base) to be set
    type: array
    format: comma-separated
    default: base
    example: repositories, history
    values:
      - base
      - repositories
      - history






//Setup
export default async function({login, data, imports, rest, q, account}, {enabled = false, extras = false} = {}) {
  //Plugin execution
  try {

    //Diff graphs
    if (sections.includes("history")) {
      const weeks = result.weeks.filter(({date}) => !_history_limit ? true : new Date(date) > new Date(new Date().getFullYear() - _history_limit, 0, 0))
      if (weeks.length) {
        //Generate SVG
        const height = 315, width = 480
        const margin = 5, offset = 34
        const {d3} = imports
        const d3n = new imports.D3node()
        const svg = d3n.createSVG(width, height)

        //Time range
        const start = new Date(weeks.at(0).date)
        const end = new Date(weeks.at(-1).date)
        const x = d3.scaleTime()
          .domain([start, end])
          .range([margin + offset, width - (offset + margin)])
        svg.append("g")
          .attr("transform", `translate(0,${height - (offset + margin)})`)
          .call(d3.axisBottom(x))
          .selectAll("text")
          .attr("transform", "translate(-5,5) rotate(-45)")
          .style("text-anchor", "end")
          .style("font-size", 20)

        //Diff range
        const points = weeks.flatMap(({added, deleted, changed}) => [added + changed, deleted + changed])
        const extremum = Math.max(...points)
        const y = d3.scaleLinear()
          .domain([extremum, -extremum])
          .range([margin, height - (offset + margin)])
        svg.append("g")
          .attr("transform", `translate(${margin + offset},0)`)
          .call(d3.axisLeft(y).ticks(7).tickFormat(d3.format(".2s")))
          .selectAll("text")
          .style("font-size", 20)

        //Generate history
        for (const {type, sign, fill} of [{type: "added", sign: +1, fill: "rgb(63, 185, 80)"}, {type: "deleted", sign: -1, fill: "rgb(218, 54, 51)"}]) {
          svg.append("path")
            .datum(weeks.map(({date, ...diff}) => [new Date(date), sign * (diff[type] + diff.changed)]))
            .attr(
              "d",
              d3.area()
                .x(d => x(d[0]))
                .y0(d => y(d[1]))
                .y1(() => y(0)),
            )
            .attr("fill", fill)
        }
        result.history = d3n.svgString()
      }
      else {
        console.debug(`metrics/compute/${login}/plugins > lines > no history data`)
        result.history = null
      }
    }

    */
