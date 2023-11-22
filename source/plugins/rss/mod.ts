// Imports
import { is, parse, Plugin } from "@engine/components/plugin.ts"
import RSS from "y/rss-parser@3.13.0?pin=v133"

/** Plugin */
export default class extends Plugin {
  /** Import meta */
  static readonly meta = import.meta

  /** Name */
  readonly name = "🗼 Rss feed"

  /** Category */
  readonly category = "social"

  /** Supports */
  readonly supports = ["user", "organization", "repository"]

  /** Permissions */
  readonly permissions = ["net:all"]

  /** Description */
  readonly description = "Displays entries from a RSS feed"

  /** Inputs */
  readonly inputs = is.object({
    feed: is.string().url().default("https://news.ycombinator.com/rss").describe("RSS feed (e.g. `https://news.ycombinator.com/rss`)"),
    limit: is.number().int().min(1).nullable().default(4).describe("Display limit. Set to `null` to disable"),
  })

  /** Outputs */
  readonly outputs = is.object({
    name: is.string().describe("Feed name"),
    description: is.string().describe("Feed description"),
    entries: is.array(is.object({
      title: is.string().describe("Entry title"),
      link: is.string().url().describe("Entry link"),
      date: is.date().nullable().describe("Entry date"),
    })).describe("Feed entries"),
  })

  /** Action */
  protected async action() {
    const { feed, limit } = await parse(this.inputs, this.context.args)
    const content = await this.fetch(feed, { type: "text" })
    const { title: name, description, items } = await (new RSS()).parseString(content)
    let entries = items.map(({ title, link, isoDate: date }) => ({ title, link, date: date ? new Date(date) : null }))
    this.log.debug(`found ${entries.length} entries from ${feed}`)
    if (limit) {
      entries = entries.slice(0, limit)
    }
    return { name, description, entries }
  }
}
