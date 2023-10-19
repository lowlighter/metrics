import { expect, test } from "@utils/testing.ts"
import { Plugin } from "@engine/components/plugin.ts"
import { Processor } from "@engine/components/processor.ts"
import { process } from "@engine/process.ts"
import { deepMerge } from "std/collections/deep_merge.ts"
import { Browser } from "@utils/browser.ts"
import * as dir from "@engine/paths.ts"
import { Logger } from "@utils/log.ts"
import { Component } from "@engine/components/component.ts"

const config = {
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
}

// Plugins
for (const id of await Plugin.list()) {
  const plugin = await Plugin.load({ id })
  const tests = await plugin.tests()
  const templates = await plugin.templates()
  const name = `${plugin.icon} plugins/${plugin.id}`
  if (!tests.length) {
    Deno.test.ignore(name, () => void null)
    continue
  }
  for (const test of tests) {
    Deno.test(`${name} | ${test.name}`, await getPermissions(test), async (t) => {
      const {teardown} = setup()
      for (const template of templates) {
        await t.step(template, async () => {
          await expect(process(deepMerge({ presets: { default: { plugins: { template } } } }, deepMerge(config, test, { arrays: "replace" })))).to.be.fulfilled.and.eventually.be.ok
        })
      }
      teardown()
    })
  }
}

// Processors
for (const id of await Processor.list()) {
  const processor = await Processor.load({ id })
  const tests = await processor.tests()
  const name = `${processor.icon} processors/${processor.id}`
  if (!tests.length) {
    Deno.test.ignore(name, () => void null)
    continue
  }
  for (const test of tests) {
    Deno.test(`${name} | ${test.name}`, await getPermissions(test), async () => {
      const {teardown} = setup()
      await expect(process(deepMerge(config, test, { arrays: "replace" }))).to.be.fulfilled.and.eventually.be.ok
      teardown()
    })
  }
}

/** Setup for components tests */
function setup() {
  const {raw} = Logger
  const {shareable} = Browser
  Logger.raw = false
  Browser.shareable = false
  const teardown = () => {
    Logger.raw = raw
    Browser.shareable = shareable
  }
  return {teardown}
}

/** Compute required permissions */
async function getPermissions(test:Awaited<ReturnType<typeof Component["prototype"]["tests"]>>[0]) {
  // Aggregate permissions from all plugins and processors
  const requested = new Set<string>()
  const components = new Set<string>()
  for (const {processors, ...plugin} of test.plugins) {
    if ((plugin as test).id)
      components.add(`plugins/${(plugin as test).id}`)
    for (const {id} of processors) {
      components.add(`processors/${id}`)
    }
  }Logger.raw
  await Promise.all([...components].map(id => Component.load({id}).then((component) => component.permissions.forEach((permission) => requested.add(permission)))))

  // Compute permissions
  const permissions = {
    read:[dir.source, dir.cache],
    env:[...requested].filter((permission) => permission.startsWith("env:")).map((permission) => permission.replace("env:", "")),
    net:[...requested].filter((permission) => permission.startsWith("net:")).map((permission) => permission.replace("net:", "")),
  } as test
  if (requested.has("run:chrome")) {
    const bin = await Browser.getBinary("chrome", { cache: dir.cache })
    Object.assign(permissions, deepMerge(permissions, {read:[dir.cache], net:["127.0.0.1", "localhost"], env:["CHROME_EXTRA_FLAGS"], run:[bin]}))
  }
  if (requested.has("write")) {
    Object.assign(permissions, deepMerge(permissions, {write:[dir.test]}))
  }

  return {permissions}
}