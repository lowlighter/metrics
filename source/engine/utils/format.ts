// Imports
import humanformat from "y/human-format@1.2.0?pin=v133"
import pluralize from "y/pluralize@8.0.0?pin=v133"

/** Formatter */
export class Formatter {
  /** Constructor */
  constructor({ timezone = Intl.DateTimeFormat().resolvedOptions().timeZone } = {}) {
    this.timezone = timezone
  }

  /** Timezone */
  readonly timezone

  /** Format date */
  date(date: string, options = {} as Intl.DateTimeFormatOptions) {
    const intl = new Intl.DateTimeFormat("en-GB", {
      timeZone: this.timezone,
      day: "day" in options ? options.day : "numeric",
      month: "month" in options ? options.month : "short",
      year: "year" in options ? options.year : "numeric",
    })
    return intl.format(new Date(date))
  }

  /** Format time */
  time(time: string) {
    const intl = new Intl.DateTimeFormat("en-GB", { timeZone: this.timezone, hour: "2-digit", minute: "2-digit", second: "2-digit" })
    return intl.format(new Date(time))
  }

  /** Format number */
  number(text: string, number: number, options?: Record<PropertyKey, unknown>): string
  number(number: number, options?: Record<PropertyKey, unknown>): string
  number() {
    let [text, number, options] = arguments
    if (typeof text === "number") {
      options = number
      number = text
      text = ""
    }
    options ??= {}
    if (options.format === "bytes") {
      options = { scale: "binary", unit: "B", ...options }
    }
    return `${humanformat(number, options).replace(/(\d)\s/, "$1")} ${pluralize(text, number)}`.trim()
  }

  /** Strip emojis from text */
  emojiless(text: string) {
    return text.replaceAll(/([\p{Emoji}\u200d]+)/gu, "")
  }

  /** Format content in HTML */
  html(content: string) {
    return `
      <html>
        <head>
          <title>Metrics</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body>
          <main>${content}</main>
          <style>
            body {
              margin: 0;
              padding: 0;
            }
          </style>
        </body>
      </html>
    `.trim()
  }
}

/** Default formatter */
export const Format = new Formatter()
