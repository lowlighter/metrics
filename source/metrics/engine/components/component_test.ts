import { test } from "@utils/testing.ts"
import { deepMerge } from "std/collections/deep_merge.ts"
import { Browser } from "@utils/browser.ts"
import * as dir from "@engine/paths.ts"
import { Logger } from "@utils/log.ts"
import { Component } from "@engine/components/component.ts"

/** Config */
export const config = {
  presets: {
    default: {
      plugins: {
        logs: "none",
        mock: true,
        fatal: true,
        retries: { attempts: 1, delay: 0 },
      },
      get processors() {
        return this.plugins
      },
    },
  },
} as const

/** Setup for components tests */
export function setup() {
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

/** Compute required permissions */
export async function getPermissions(test: Awaited<ReturnType<typeof Component["prototype"]["tests"]>>[0]) {
  // Aggregate permissions from all plugins and processors
  const requested = new Set<string>()
  const components = new Set<string>()
  for (const { processors, ...plugin } of test.plugins) {
    if ((plugin as test).id) {
      components.add(`plugins/${(plugin as test).id}`)
    }
    for (const { id } of processors) {
      components.add(`processors/${id}`)
    }
  }
  await Promise.all([...components].map((id) => Component.load({ id }).then((component) => component.permissions.forEach((permission) => requested.add(permission)))))

  // Compute permissions
  const permissions = {
    read: [dir.source, dir.cache],
    env: [...requested].filter((permission) => permission.startsWith("env:")).map((permission) => permission.replace("env:", "")),
    net: [...requested].filter((permission) => permission.startsWith("net:")).map((permission) => permission.replace("net:", "")),
  } as test
  if (requested.has("run:chrome")) {
    const bin = await Browser.getBinary("chrome", { cache: dir.cache })
    Object.assign(permissions, deepMerge(permissions, { read: [dir.cache], net: ["127.0.0.1", "localhost"], env: ["CHROME_EXTRA_FLAGS"], run: [bin] }))
  }
  if (requested.has("write")) {
    Object.assign(permissions, deepMerge(permissions, { write: [dir.test] }))
  }

  return { permissions }
}
