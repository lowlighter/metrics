//Imports
import { inspect } from "@utils/io.ts"
import { loglevel } from "@metrics/config.ts"

/** Logger */
export class Logger {
  /** Identifier */
  readonly id: string

  /** Level */
  level

  /** Constructor */
  constructor(meta: { url: string }, { level = loglevel.default as channel | "none", tags = {} as Record<string, unknown> } = {}) {
    this.id = meta.url.replace(Logger.root, "").replace(".ts", "").replace("/mod", "")
    this.level = level === "none" ? -Infinity : Logger.channels[level]
    this.tags = tags
  }

  /** Tags */
  readonly tags

  /** Error */
  error(message: unknown) {
    if (this.level >= Logger.channels.error) {
      this.print("error", message)
    }
  }

  /** Warn */
  warn(message: unknown) {
    if (this.level >= Logger.channels.warn) {
      this.print("warn", message)
    }
  }

  /** Success */
  success(message: unknown) {
    if (this.level >= Logger.channels.success) {
      this.print("success", message)
    }
  }

  /** Info */
  info(message: unknown) {
    if (this.level >= Logger.channels.info) {
      this.print("info", message)
    }
  }

  /** Message */
  message(message: unknown) {
    if (this.level >= Logger.channels.message) {
      this.print("message", message)
    }
  }

  /** IO operations */
  io(message: unknown) {
    if (this.level >= Logger.channels.io) {
      this.print("io", message)
    }
  }

  /** Debug */
  debug(message: unknown) {
    if (this.level >= Logger.channels.debug) {
      this.print("debug", message)
    }
  }

  /** Trace */
  trace(message: unknown) {
    if (this.level >= Logger.channels.trace) {
      this.print("trace", message)
    }
  }

  /** Development message (bypass log level) */
  probe(message: unknown) {
    this.print("probe", message)
  }

  /** Create a new logger with tags */
  with(tags: Record<string, unknown>) {
    const logger = new Logger({ url: "" })
    Object.assign(logger, { id: this.id, level: this.level, tags: { ...this.tags, ...tags } })
    return logger
  }

  /** Print message */
  private print(channel: channel, content: unknown) {
    switch (channel) {
      case "error":
        return console.error(...this.format(channel, content))
      case "warn":
        return console.warn(...this.format(channel, content))
      case "success":
      case "info":
        return console.info(...this.format(channel, content))
      case "message":
        return console.log(...this.format(channel, content))
      case "io":
      case "debug":
      case "trace":
      case "probe":
        return console.debug(...this.format(channel, content))
    }
  }

  /** Format */
  private format(channel: channel, message: unknown) {
    const color = Logger.colors[channel]
    const styles = [
      `%c${Logger.blocks[channel]}%c ${this.id.padEnd(28)}%c`,
      `color: ${{ black: "gray" }[color] ?? color}`,
      `background-color: ${{ inherit: "white" }[color] ?? color}; color: ${{ gray: "black", black: "gray", inherit: "black" }[color] ?? "white"}`,
      "",
    ]
    if (Object.keys(this.tags).length) {
      styles[0] += " "
    }
    for (const [key, value] of Object.entries(this.tags)) {
      styles[0] += `%c ${key} %c ${value} %c`
      styles.push("background-color: gray; font-style: italic", "background-color: white; color: gray; font-style: italic", "")
    }
    if (typeof message === "object") {
      styles[0] += `%c ${inspect(message)}`
      styles.push("")
    } else {
      styles[0] += `%c ${message}%c`
      styles.push(`color: ${{ black: "white" }[color] ?? color}`, "")
    }
    return styles
  }

  /** Channels */
  static readonly channels = {
    error: 0,
    warn: 1,
    success: 2,
    io: 3,
    info: 2,
    message: 3,
    debug: 4,
    trace: 5,
    probe: -1,
  }

  /** Project root path */
  private static readonly root = new URL("../..", import.meta.url).href

  /** Color schemes */
  private static readonly colors = {
    error: "red",
    warn: "yellow",
    success: "green",
    io: "blue",
    info: "cyan",
    message: "inherit",
    debug: "gray",
    trace: "black",
    probe: "magenta",
  }

  /** Blocks */
  private static readonly blocks = {
    error: "█",
    warn: "▓",
    success: "▒",
    io: "▒",
    info: "▒",
    message: "░",
    debug: "░",
    trace: "░",
    probe: "█",
  }
}

/** Channel */
type channel = keyof typeof Logger.channels
