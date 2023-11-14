// Imports
import argv from "y/string-argv@0.3.1?pin=v133"
import { Logger } from "@engine/utils/log.ts"
import { TextDelimiterStream } from "std/streams/text_delimiter_stream.ts"

/** Execute command */
export async function command(input: string, options: { return: "stdout" | "stderr"; cwd?: string; env?: Record<PropertyKey, string>; log?: Logger }): Promise<string>
export async function command(input: string, options?: { cwd?: string; env?: Record<PropertyKey, string>; log?: Logger }): Promise<{ success: boolean; code: number; stdout: string; stderr: string }>
export async function command(input: string, { return: returned, cwd, log, env }: { return?: "stdout" | "stderr"; cwd?: string; env?: Record<PropertyKey, string>; log?: Logger } = {}) {
  const stdio = { stdout: "", stderr: "" }
  const [bin, ...args] = argv(input)
  log = log?.with({ bin })
  const command = new Deno.Command(bin, { args, stdin: "null", stdout: "piped", stderr: "piped", cwd, env })
  const process = command.spawn()
  const streams = Promise.allSettled((["stdout", "stderr"] as const).map(async (channel) => {
    const stream = process[channel].pipeThrough(new TextDecoderStream()).pipeThrough(new TextDelimiterStream("\n"))
    try {
      for await (const line of stream) {
        log?.[({ stdout: "message", stderr: "warn" } as const)[channel]](line)
        stdio[channel] += line + "\n"
      }
    } finally {
      stream.cancel()
    }
  }))
  const { success, code } = await process.status
  await streams
  if (returned) {
    return stdio[returned].trim()
  }
  return { success, code, ...stdio }
}
