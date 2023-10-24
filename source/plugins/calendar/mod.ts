// Imports
import { is, parse, Plugin } from "@engine/components/plugin.ts"

/** Plugin */
export default class extends Plugin {
  /** Import meta */
  static readonly meta = import.meta

  /** Name */
  readonly name = "📆 Commit calendar"

  /** Category */
  readonly category = "github"

  /** Supports */
  readonly supports = ["user"]

  /** Description */
  readonly description = "Displays a commit calendar along with a few additional statistics"

  /** Inputs */
  readonly inputs = is.object({
    view: is.enum(["isometric", "top-down"]).default("isometric").describe("Calendar view"),
    range: is.union([
      is.object({
        from: is.union([is.literal("registration"), is.coerce.number().min(1970), is.coerce.number().negative()]).default("registration").describe(
          "Start date (use `registration` to set it to user registration year, and a negative value to set it to `range.to` minus specified value)",
        ),
        to: is.union([is.literal("current-year"), is.coerce.number().min(1970)]).default("current-year").describe("End date (use `current-year` to set it to current year)"),
      }),
      is.literal("last-180-days"),
      is.literal("last-365-days"),
      is.literal("current-year"),
      is.coerce.number().min(1970),
    ]).default("last-365-days").describe("Date range"),
    colors: is.enum(["auto", "halloween", "winter"]).default("auto").describe("Color scheme"),
  })

  /** Outputs */
  readonly outputs = is.object({
    range: is.object({
      start: is.coerce.date().describe("Start date"),
      end: is.coerce.date().describe("End date"),
      average: is.number().min(0).describe("Average number of commits per day"),
      max: is.number().int().min(0).describe("Highest number of commits in a single day"),
      streak: is.object({
        max: is.number().int().min(0).describe("Highest number of consecutive days with commits"),
        current: is.number().int().min(0).describe("Current number of consecutive days with commits"),
      }).describe("Streak statistics"),
    }).describe("Date range"),
    calendar: is.object({
      colors: is.enum(["default", "halloween", "winter"]).describe("Color scheme"),
      years: is.array(is.object({
        year: is.union([is.string(), is.coerce.number().int().positive()]).describe("Year"),
        weeks: is.array(is.object({
          days: is.array(
            is.object({
              date: is.coerce.date().describe("Date"),
              count: is.number().int().min(0).describe("Number of commits"),
              level: is.number().min(0).max(4).describe("Commit quartile level"),
            }).nullable(),
          ).describe("Days statistics (`null` if fetched day is outside current year)"),
        })).describe("Weeks statistics"),
        average: is.number().min(0).describe("Average number of commits per day for the year "),
        max: is.number().int().min(0).describe("Highest number of commits in a single day for the year"),
        streak: is.object({
          max: is.number().int().min(0).describe("Highest number of consecutive days with commits for the year"),
        }).describe("Streak statistics"),
      })),
    }).describe("Calendar statistics"),
  })

  /** Action */
  protected async action() {
    const { handle } = this.context
    const { range, ...inputs } = await parse(this.inputs, this.context.args)

    //Color scheme
    const { entity: { contributions: { calendar: { colors: [color] } } } } = await this.graphql("colors", { login: handle })
    const colors = inputs.colors !== "auto" ? inputs.colors : { "#ffee4a": "halloween", "#0a3069": "winter" }[color as string] ?? "default"

    //Compute date range
    const lastXdays = /^last-(?<n>\d+)-days$/
    const today = new Date()
    let end = this.date(today, { time: "23:59" })
    let start = this.date(today, { time: "00:00" })
    if (typeof range === "object") {
      // End date
      switch (true) {
        case range.to === "current-year":
          end = this.date(today.getFullYear(), { day: "31st dec", time: "23:59" })
          break
        case typeof range.to === "number":
          end = this.date(range.to as number, { day: "31st dec", time: "23:59" })
          break
      }
      // Start date
      switch (true) {
        case range.from === "registration": {
          start = this.date(new Date((await this.graphql("user", { login: handle })).entity.registration), { time: "00:00" })
          break
        }
        case typeof range.from === "number":
          if (range.from as number < 0) {
            start = this.date(end.getFullYear() + (range.from as number), { day: "1st jan", time: "00:00" })
          } else {
            start = this.date(range.from as number, { day: "1st jan", time: "00:00" })
          }
          break
      }
    } // Specific year
    else if (typeof range === "number") {
      start = this.date(range, { day: "1st jan", time: "00:00" })
      end = (range === today.getFullYear()) ? this.date(today, { time: "keep" }) : this.date(range, { day: "31st dec", time: "23:59" })
    } // Current year
    else if (range === "current-year") {
      start = this.date(today.getFullYear(), { day: "1st jan", time: "00:00" })
      end = this.date(today, { time: "keep" })
    } // Last X days
    else if (lastXdays.test(`${range}`)) {
      const n = Number((range as string).match(lastXdays)!.groups!.n)
      end = this.date(today, { time: "keep" })
      start = this.date(end, { time: "keep" })
      start.setHours((-n + 1) * 24 + start.getTimezoneOffset() / 60)
    }
    this.log.trace(`start date set from year "${typeof range === "object" ? range.from : range}" → ${start.toISOString()}`)
    this.log.trace(`end date set from "${typeof range === "object" ? range.to : range}" → ${end.toISOString()}`)

    //Fetch data
    const calendar = { colors, years: [] } as is.infer<typeof this["outputs"]["shape"]["calendar"]>
    const result = { range: { start, end, average: 0, max: 0, streak: { max: 0, current: 0 } }, calendar }
    this.log.debug(`fetching data from ${start.toISOString()} to ${end.toISOString()}`)
    for (let year = start.getFullYear(); year <= end.getFullYear(); year++) {
      this.log.trace(`processing ${lastXdays.test(`${range}`) ? `"${range}"` : `year ${year}`}`)
      calendar.years.push({ year, weeks: [], average: 0, max: 0, streak: { max: 0 } })

      //Ensure starting date is on a sunday (to avoid incomplete week arrays that would offset results later on)
      const A = lastXdays.test(`${range}`) ? this.date(start, { time: "keep" }) : this.date(year, { day: "1st jan", time: "00:00" })
      const O = this.date(A, { time: "keep" })
      A.setHours(-A.getDay() * 24)

      //Ensure ending date is either on today or a 31st of december
      const B = lastXdays.test(`${range}`) ? this.date(end, { time: "keep" }) : (year >= today.getFullYear()) ? this.date(today, { time: "keep" }) : this.date(year, { day: "31st dec", time: "23:59" })

      //Iterate over year
      for (let a = this.date(A, { time: "keep" }), first = true; a < B; first = false) {
        //Compute next date range
        let b = this.date(a, { time: "23:59" })
        b.setHours(27 * 24)
        if (b > B) {
          b = this.date(B, { time: "keep" })
        }

        //Fetch data from api and clean padded days on first iteration
        this.log.trace(`querying data from ${a.toISOString()} to ${b.toISOString()}`)
        const { entity: { contributions: { calendar: { weeks } } } } = await this.graphql("calendar", { login: handle, from: a.toISOString(), to: b.toISOString() })
        if (first) {
          for (let i = 0; i < weeks[0].days.length; i++) {
            const { date } = weeks[0].days[i]
            if (this.date(date, { time: "00:00" }) < O) {
              weeks[0].days[i] = null
            }
          }
        }
        calendar.years.at(-1)!.weeks.push(...weeks)
        this.log.trace(`fetched ${(weeks as Array<{ days: unknown[] }>).flatMap(({ days }) => days).filter((day) => day).length} days`)

        //Set next date range
        a = this.date(b, { time: "00:00" })
        a.setDate(a.getDate() + 1)
      }

      //Set custom title for special ranges
      if (lastXdays.test(`${range}`)) {
        calendar.years.at(-1)!.year = { "last-180-days": "Last 180 days", "last-365-days": "Last 365 days" }[range as string] ?? ""
        break
      }
    }
    this.log.debug(`fetched ${calendar.years.flatMap(({ weeks }) => weeks.flatMap(({ days }) => days)).filter((day) => day).length} days in total`)

    //Compute streaks and average
    const global = [] as number[]
    for (const year of calendar.years) {
      this.log.trace(`computing additional data for ${lastXdays.test(`${range}`) ? `"${range}"` : `year ${year}`}`)
      const local = [] as number[]
      let streak = 0
      for (const { days } of year.weeks) {
        for (const day of days) {
          if (!day) {
            continue
          }
          local.push(day.count)
          streak = day.count ? streak + 1 : 0
          result.range.streak.current = day.count ? result.range.streak.current + 1 : 0
          year.max = Math.max(year.max, day.count)
          year.streak.max = Math.max(year.streak.max, streak)
          day.level = { NONE: 0, FIRST_QUARTILE: 1, SECOND_QUARTILE: 2, THIRD_QUARTILE: 3, FOURTH_QUARTILE: 4 }[day.level as unknown as string] ?? 0
        }
      }
      year.average = local.reduce((a, b) => a + b, 0) / (local.length || 1)
      global.push(...local)
    }
    result.range.streak.max = Math.max(...calendar.years.map((year) => year.streak.max))
    result.range.max = Math.max(0, ...global)
    result.range.average = global.reduce((a, b) => a + b, 0) / (global.length || 1)

    return result
  }

  /** Create a date from a reference, and optionally clean time */
  private date(date: Date, options: { time: "00:00" | "23:59" | "keep" }): Date
  private date(year: number, options: { day: "1st jan" | "31st dec"; time: "00:00" | "23:59" }): Date
  private date(ref: number | Date, { day, time }: { day?: "1st jan" | "31st dec"; time: "00:00" | "23:59" | "keep" }) {
    const date = new Date(new Date().toLocaleString("en", { timeZone: this.context.timezone }))
    switch (typeof ref) {
      case "number":
        date.setFullYear(ref)
        if (day) {
          date.setMonth({ "1st jan": 0, "31st dec": 11 }[day])
          date.setDate({ "1st jan": 1, "31st dec": 31 }[day])
        }
        break
      case "object":
        date.setFullYear(ref.getFullYear())
        date.setMonth(ref.getMonth())
        date.setDate(ref.getDate())
        date.setHours(ref.getHours())
        date.setMinutes(ref.getMinutes())
        date.setSeconds(ref.getSeconds())
        date.setMilliseconds(ref.getMilliseconds())
        break
    }
    switch (time) {
      case "00:00":
        date.setHours(0)
        date.setMinutes(0)
        date.setSeconds(0)
        date.setMilliseconds(0)
        break
      case "23:59":
        date.setHours(23)
        date.setMinutes(59)
        date.setSeconds(59)
        date.setMilliseconds(999)
        break
    }
    return date
  }
}
