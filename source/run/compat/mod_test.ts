import { expect, t, test } from "@engine/utils/testing.ts"
import { compat as _compat } from "@run/compat/mod.ts"
import { Secret } from "@engine/utils/secret.ts"

const permissions = { net: ["raw.githubusercontent.com"] }

async function compat(inputs: Parameters<typeof _compat>[0], options?: Omit<Parameters<typeof _compat>[1], "log" | "mock">) {
  const { content: { config } } = await _compat(inputs, { log: null, mock: true, ...options })
  return config as test
}

async function testing(name: string, { renamed = name, inputs, expected }: { renamed?: string; inputs: Record<string, unknown>; expected: Record<string, unknown> }) {
  const config = await compat({ [`plugin_${name}`]: true, ...Object.fromEntries(Object.entries(inputs).map(([key, value]) => [key.startsWith("_") ? key.slice(1) : `plugin_${name}_${key}`, value])) })
  await expect(config.plugins.find((plugin: test) => renamed in plugin)).to.containSubset({ [renamed]: expected[name] })
}

Deno.test(t(import.meta, "`compat()` transpiles `token`"), { permissions }, async () => {
  const config = await compat({ token: "ghp_" })
  expect(config.presets.default.plugins.token).to.be.instanceOf(Secret)
})

Deno.test(t(import.meta, "`compat()` transpiles `user`"), { permissions }, async () => {
  const config = await compat({ user: "octocat" })
  await expect(config).to.containSubset({
    presets: {
      default: {
        plugins: {
          handle: "octocat",
          entity: "user",
        },
      },
    },
  })
})

Deno.test(t(import.meta, "`compat()` transpiles `repo`"), { permissions }, async () => {
  const config = await compat({ user: "octocat", repo: "hello-world" })
  await expect(config).to.containSubset({
    presets: {
      default: {
        plugins: {
          handle: "octocat/hello-world",
          entity: "repository",
        },
      },
    },
  })
})

Deno.test(t(import.meta, "`compat()` transpiles `github_api_rest` and `github_api_graphql`"), { permissions }, async () => {
  for (const key of ["github_api_rest", "github_api_graphql"] as const) {
    const config = await compat({ [key]: "https://api.metrics.test" })
    await expect(config).to.containSubset({
      presets: {
        default: {
          plugins: {
            api: "https://api.metrics.test",
          },
        },
      },
    })
  }
})

Deno.test(t(import.meta, "`compat()` transpiles `config_presets`"), { permissions }, async () => {
  await expect(compat({ config_presets: ["@preset"] })).to.be.fulfilled
})

Deno.test(t(import.meta, "`compat()` transpiles `config_timezone`"), { permissions }, async () => {
  const config = await compat({ config_timezone: "Europe/Paris" })
  await expect(config).to.containSubset({
    presets: {
      default: {
        plugins: {
          timezone: "Europe/Paris",
        },
      },
    },
  })
})

Deno.test(t(import.meta, "`compat()` transpiles `retries` and `retries_delay`"), { permissions }, async () => {
  const config = await compat({ retries: 5, retries_delay: 60 })
  await expect(config).to.containSubset({
    presets: {
      default: {
        plugins: {
          retries: { attempts: 5, delay: 60 },
        },
        processors: {
          retries: { attempts: 5, delay: 60 },
        },
      },
    },
  })
})

Deno.test(t(import.meta, "`compat()` transpiles `debug`"), { permissions }, async () => {
  const config = await compat({ debug: true })
  await expect(config).to.containSubset({
    presets: {
      default: {
        plugins: {
          logs: "debug",
        },
        processors: {
          logs: "debug",
        },
      },
    },
  })
})

Deno.test(t(import.meta, "`compat()` transpiles `plugins_errors_fatal`"), { permissions }, async () => {
  const config = await compat({ plugins_errors_fatal: true })
  await expect(config).to.containSubset({
    presets: {
      default: {
        plugins: {
          fatal: true,
        },
        processors: {
          fatal: true,
        },
      },
    },
  })
})

Deno.test(t(import.meta, "`compat()` transpiles `use_mocked_data`"), { permissions }, async () => {
  const config = await compat({ use_mocked_data: true })
  await expect(config).to.containSubset({
    presets: {
      default: {
        plugins: {
          mock: true,
        },
      },
    },
  })
})

Deno.test(t(import.meta, "`compat()` transpiles `dryrun`"), { permissions }, async () => {
  const config = await compat({ dryrun: true })
  await expect(config.plugins.find((plugin: test) => plugin.processors?.find((processor: test) => "publish.file" in processor))).to.be.undefined
})

Deno.test(t(import.meta, "`compat()` transpiles `config_display`"), { permissions }, async () => {
  for (const value of ["regular", "large", "columns"] as const) {
    await expect(compat({ config_display: value })).to.be.fulfilled
  }
})

Deno.test(t(import.meta, "`compat()` transpiles `config_animations`"), { permissions }, async () => {
  await expect(compat({ config_animations: false })).to.be.fulfilled
})

Deno.test(t(import.meta, "`compat()` transpiles `config_padding`"), { permissions }, async () => {
  for (const value of ["1", "1%", "1 + 1%", "1, 1", "1, 1%", "1%, 1", "1 + 1%, 1", "1, 1 + 1%", "1 + 1%, 1 + 1%"] as const) {
    await expect(compat({ config_padding: value })).to.be.fulfilled
  }
})

Deno.test(t(import.meta, "`compat()` transpiles `verify`, `debug_flags`, `experimental_features` and `clean_workflows`"), { permissions }, async () => {
  await expect(compat({ verify: true, clean_workflows: ["all"], debug_flags: ["--cakeday"], experimental_features: ["--optimize-svg"] })).to.be.fulfilled
})

Deno.test(t(import.meta, "`compat()` transpiles `setup_community_templates` and `query`"), { permissions }, async () => {
  await expect(compat({ setup_community_templates: ["lowlighter/metrics@main:classic"], query: { foo: "bar" } })).to.be.fulfilled
})

Deno.test(t(import.meta, "`compat()` transpiles `template`"), { permissions }, async () => {
  const config = await compat({ template: "terminal" })
  await expect(config).to.containSubset({
    presets: {
      default: {
        plugins: {
          template: "terminal",
        },
      },
    },
  })
})

Deno.test.ignore(t(import.meta, "`compat()` transpiles `markdown` and `markdown_cache`"), { permissions }, async () => {
  //TODO(#1574)
})

Deno.test.ignore(t(import.meta, "`compat()` transpiles *base*"), { permissions }, async () => {})

Deno.test(t(import.meta, "`compat()` transpiles *introduction*"), { permissions }, async () => {
  const name = "introduction"
  for (
    const tested of [
      { inputs: {}, expected: { [name]: {} } },
      { inputs: { title: false }, expected: { [name]: {} } },
    ] as const
  ) {
    await testing(name, tested)
  }
})

Deno.test(t(import.meta, "`compat()` transpiles *isocalendar*"), { permissions }, async () => {
  const name = "isocalendar"
  for (
    const tested of [
      { inputs: {}, expected: { [name]: {} } },
      { inputs: { duration: "half-year" }, expected: { [name]: { range: "last-180-days" } } },
      { inputs: { duration: "full-year" }, expected: { [name]: { range: "last-365-days" } } },
      { inputs: { _debug_flags: ["--winter"] }, expected: { [name]: { colors: "winter" } } },
      { inputs: { _debug_flags: ["--halloween"] }, expected: { [name]: { colors: "halloween" } } },
    ] as const
  ) {
    await testing(name, { renamed: "calendar", ...tested })
  }
})

Deno.test(t(import.meta, "`compat()` transpiles *calendar*"), { permissions }, async () => {
  const name = "calendar"
  for (
    const tested of [
      { inputs: {}, expected: { [name]: {} } },
      { inputs: { limit: 0 }, expected: { [name]: { range: { from: "registration", to: "current-year" } } } },
      { inputs: { limit: 1 }, expected: { [name]: { range: { from: -1, to: "current-year" } } } },
      { inputs: { limit: -1 }, expected: { [name]: { range: { from: 2020 - 1, to: "current-year" } } } },
      { inputs: { _debug_flags: ["--winter"] }, expected: { [name]: { colors: "winter" } } },
      { inputs: { _debug_flags: ["--halloween"] }, expected: { [name]: { colors: "halloween" } } },
    ] as const
  ) {
    await testing(name, tested)
  }
})

Deno.test(t(import.meta, "`compat()` transpiles *gists*"), { permissions }, async () => {
  const name = "gists"
  for (
    const tested of [
      { inputs: {}, expected: { [name]: {} } },
    ] as const
  ) {
    await testing(name, tested)
  }
})

Deno.test(t(import.meta, "`compat()` transpiles *lines*"), { permissions }, async () => {
  const name = "lines"
  for (
    const tested of [
      { inputs: { sections: ["base", "repositories", "history"] }, expected: { [name]: { display: { sections: ["repositories", "graph"] } } } },
      { inputs: { skipped: ["octocat/hello-world"] }, expected: { [name]: { repositories: { matching: ["!octocat/hello-world"] } } } },
      {
        inputs: { skipped: ["@use.patterns", "# comment", "octocat/hello-world", "+octocat/metrics"] },
        expected: { [name]: { repositories: { matching: ["!octocat/hello-world", "octocat/metrics"] } } },
      },
      { inputs: { repositories_limit: 1 }, expected: { [name]: { display: { repositories: { limit: 1 } } } } },
      { inputs: { history_limit: 1 }, expected: { [name]: { history: { limit: 1 } } } },
      { inputs: { history_limit: 0 }, expected: { [name]: { history: { limit: null } } } },
      { inputs: { delay: 1 }, expected: { [name]: { fetch: { delay: 1 } } } },
    ] as const
  ) {
    await testing(name, tested)
  }
})

Deno.test(t(import.meta, "`compat()` transpiles *rss*"), { permissions }, async () => {
  const name = "rss"
  for (
    const tested of [
      { inputs: { source: "https://example.com" }, expected: { [name]: { feed: "https://example.com" } } },
      { inputs: { limit: 0 }, expected: { [name]: { limit: null } } },
      { inputs: { limit: 1 }, expected: { [name]: { limit: 1 } } },
    ] as const
  ) {
    await testing(name, tested)
  }
})

Deno.test(t(import.meta, "`compat()` transpiles *screenshot*"), { permissions }, async () => {
  const name = "screenshot"
  for (
    const tested of [
      { inputs: { url: "https://example.com" }, expected: { [name]: { url: "https://example.com" } } },
      { inputs: { title: "foo" }, expected: { [name]: { title: "foo" } } },
      { inputs: { selector: "main" }, expected: { [name]: { select: "main" } } },
      { inputs: { mode: "image" }, expected: { [name]: { mode: "image" } } },
      { inputs: { mode: "text" }, expected: { [name]: { mode: "text" } } },
      { inputs: { viewport: JSON.stringify({ width: 100, height: 100 }) }, expected: { [name]: { viewport: { width: 100, height: 100 } } } },
      { inputs: { mode: "text" }, expected: { [name]: { mode: "text" } } },
      { inputs: { wait: 1000 }, expected: { [name]: { wait: 1 } } },
      { inputs: { background: false }, expected: { [name]: { background: false } } },
    ] as const
  ) {
    await testing(name, { renamed: "webscraping", ...tested })
  }
})
