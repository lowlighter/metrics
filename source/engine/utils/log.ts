//Imports
import { inspect } from "@engine/utils/inspect.ts"

/** Logger */
export class Logger {
  /** Identifier */
  readonly id

  /** Tags */
  readonly tags

  /** IO */
  private readonly stdio

  /** Constructor */
  constructor(meta: { url: string }, { level = "none" as "none" | channel | number, tags = {} as Record<PropertyKey, unknown>, stdio = console as stdio } = {}) {
    this.id = meta.url.replace(Logger.root, "").replace(".ts", "").replace("/mod", "")
    this.tags = tags
    this.stdio = stdio
    this.setLevel(level)
  }

  /** Log level */
  setLevel(level: "none" | channel | number) {
    switch (true) {
      case (level === "none"):
        Object.assign(this, { level: -Infinity })
        return
      case (typeof level === "number") && (Object.values(Logger.channels).includes(level)):
        Object.assign(this, { level })
        return
      case (level in Logger.channels):
        Object.assign(this, { level: Logger.channels[level as channel] })
        return
    }
  }

  /** Error */
  error(message: unknown) {
    if (this.level >= Logger.channels.error) this.print("error", message)
  }

  /** Warn */
  warn(message: unknown) {
    if (this.level >= Logger.channels.warn) this.print("warn", message)
  }

  /** Success */
  success(message: unknown) {
    if (this.level >= Logger.channels.success) this.print("success", message)
  }

  /** Info */
  info(message: unknown) {
    if (this.level >= Logger.channels.info) this.print("info", message)
  }

  /** Message */
  message(message: unknown) {
    if (this.level >= Logger.channels.message) this.print("message", message)
  }

  /** IO operations */
  io(message: unknown) {
    if (this.level >= Logger.channels.io) this.print("io", message)
  }

  /** Debug */
  debug(message: unknown) {
    if (this.level >= Logger.channels.debug) this.print("debug", message)
  }

  /** Trace */
  trace(message: unknown) {
    if (this.level >= Logger.channels.trace) this.print("trace", message)
  }

  /** Development message (bypass log level) */
  probe(message: unknown) {
    this.print("probe", message)
  }

  /** Raw message (bypass log level) */
  raw(...message: Parameters<typeof this.stdio.log>) {
    if (Logger.raw) {
      this.stdio.log(...message)
    }
  }

  /** Create a new logger with tags */
  with(tags: Record<PropertyKey, unknown>) {
    const logger = new Logger({ url: "" })
    Object.assign(logger, { id: this.id, level: this.level, tags: { ...this.tags, ...tags }, stdio: this.stdio })
    return logger
  }

  /** Print message */
  private print(channel: channel, content: unknown) {
    switch (channel) {
      case "error":
        return this.stdio.error(...this.format(channel, content))
      case "warn":
        return this.stdio.warn(...this.format(channel, content))
      case "success":
      case "info":
        return this.stdio.info(...this.format(channel, content))
      case "message":
        return this.stdio.log(...this.format(channel, content))
      case "io":
      case "debug":
      case "trace":
      case "probe":
        return this.stdio.debug(...this.format(channel, content))
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
      styles.push(`color: ${{ black: "gray" }[color] ?? color}`, "")
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
    none: -Infinity,
  }

  /** Log level */
  readonly level = Logger.channels.none

  /** Print raw logs */
  static raw = true

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
export type channel = Exclude<keyof typeof Logger.channels, "none">

/** Stdio */
type stdio = {
  error: (...args: unknown[]) => void
  warn: (...args: unknown[]) => void
  info: (...args: unknown[]) => void
  log: (...args: unknown[]) => void
  debug: (...args: unknown[]) => void
}
