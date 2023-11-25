//Imports
import { dir, test } from "@engine/utils/testing.ts"
import { deepMerge } from "std/collections/deep_merge.ts"
import { Browser } from "@engine/utils/browser.ts"
import { Logger } from "@engine/utils/log.ts"
import { Component } from "@engine/components/component.ts"
import { Plugin } from "@engine/components/plugin.ts"
import { Processor } from "@engine/components/processor.ts"
import { sugar } from "@engine/config.ts"
import { env } from "@engine/utils/deno/env.ts"

/** Default config for components testing */
export const config = {
  presets: {
    default: {
      plugins: {
        logs: "warn",
        mock: true,
        fatal: true,
        retries: { attempts: 1, delay: 0 },
      },
      processors: {
        logs: "warn",
        fatal: true,
        retries: { attempts: 1, delay: 0 },
      },
    },
  },
} as const

/** Setup and teardown for components testing */
export function setup(_: unknown) {
  const { raw } = Logger
  const { shareable } = Browser
  Logger.raw = false
  Browser.shareable = false
  const teardown = () => {
    Logger.raw = raw
    Browser.shareable = shareable
  }
  return { teardown }
}

/** Compute required permissions for components testing */
export async function getPermissions(test: Awaited<ReturnType<typeof Component["prototype"]["tests"]>>[0]) {
  // Aggregate permissions from all plugins and processors
  const requested = new Set<string>()
  const plugins = new Set<string>()
  const processors = new Set<string>()
  for (const plugin of test.plugins) {
    const { id } = sugar(plugin, "plugin") as { id?: string }
    if (id) {
      plugins.add(id)
    }
    if (plugin.processors) {
      for (const processor of plugin.processors) {
        const { id } = sugar(processor, "processor") as { id: string }
        processors.add(id)
      }
    }
  }
  await Promise.all([...plugins].map((id) => Plugin.load({ id }).then((plugin) => plugin.permissions.forEach((permission) => requested.add(permission)))))
  await Promise.all([...processors].map((id) => Processor.load({ id }).then((processor) => processor.permissions.forEach((permission) => requested.add(permission)))))

  // Compute permissions
  const permissions = {
    read: [dir.source, dir.cache],
    env: [...requested].filter((permission) => permission.startsWith("env:")).map((permission) => permission.replace("env:", "")),
    net: [...requested].filter((permission) => permission.startsWith("net:")).map((permission) => permission.replace("net:", "")),
    run: [...requested].filter((permission) => permission.startsWith("run:")).map((permission) => permission.replace("run:", "")).filter((bin) => !["chrome"].includes(bin)),
  } as test
  if (requested.has("net:all")) {
    permissions.net = "inherit"
  }
  // TODO(#1571)
  if (permissions.run.length) {
    permissions.run = "inherit"
  } else if (requested.has("run:chrome")) {
    Object.assign(
      permissions,
      deepMerge(permissions, {
        read: [dir.cache],
        net: ["127.0.0.1", "localhost"],
        env: ["CHROME_BIN", "CHROME_PATH", "CHROME_EXTRA_FLAGS"],
        run: [env.get("CHROME_BIN")],
        write: [`${env.get("HOME")}/.config/chromium/SingletonLock`],
      }),
    )
  }
  if (requested.has("write:tmp")) {
    Object.assign(permissions, deepMerge(permissions, { write: [env.get("TMP")] }))
  }
  if (requested.has("read:tmp")) {
    Object.assign(permissions, deepMerge(permissions, { read: [env.get("TMP")] }))
  }
  if (requested.has("write:all")) {
    Object.assign(permissions, deepMerge(permissions, { write: [dir.test] }))
  }

  return { permissions }
}

/** Exports */
export { Plugin, Processor }
