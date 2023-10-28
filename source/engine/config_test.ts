import { expect, MetricsError, t } from "@engine/utils/testing.ts"
import { cli, config, load, server, webrequest } from "@engine/config.ts"
import { MetricsValidationError, parse } from "@engine/utils/validation.ts"

Deno.test(t(import.meta, "`parse(config)` is parseable"), { permissions: "none" }, async () => {
  await expect(parse(config, { config: { plugins: [{ id: "foo", args: { bar: true } }] } })).to.be.fulfilled
})

Deno.test(t(import.meta, "`parse(config)` honors default preset"), { permissions: "none" }, async () => {
  const presets = {
    default: {
      plugins: {
        args: {
          foo: true,
        },
      },
    },
  }
  await expect(parse(config, { presets, plugins: [{ id: "foo" }] })).to.be.fulfilled.and.eventually.containSubset({
    plugins: [{
      id: "foo",
      args: {
        foo: true,
      },
    }],
  })
})

{
  const presets = {
    default: {
      plugins: {
        logs: "message",
      },
      processors: {
        logs: "info",
      },
    },
    A: {
      plugins: {
        args: {
          foo: true,
        },
        processors: [
          {
            id: "bar",
          },
        ],
      },
      processors: {
        args: {
          bar: false,
        },
      },
    },
    B: {
      processors: {
        logs: "warn",
        args: {
          bar: true,
        },
      },
    },
  }
  Deno.test(t(import.meta, "`parse(config)` honors named presets with default preset overriden by named preset"), { permissions: "none" }, async () => {
    await expect(parse(config, { presets, plugins: [{ id: "foo", preset: "A" }] })).to.be.fulfilled.and.eventually.containSubset({
      plugins: [
        {
          id: "foo",
          logs: "message",
          args: {
            foo: true,
          },
          processors: [
            {
              id: "bar",
              logs: "info",
              args: {
                bar: false,
              },
            },
          ],
        },
      ],
    })
  })
  Deno.test(t(import.meta, "`parse(config)` honors named presets with named preset overriden by another named preset"), { permissions: "none" }, async () => {
    await expect(parse(config, { presets, plugins: [{ id: "foo", preset: "A", processors: [{ id: "bar", preset: "B" }] }] })).to.be.fulfilled.and.eventually.containSubset({
      plugins: [
        {
          id: "foo",
          logs: "message",
          args: {
            foo: true,
          },
          processors: [
            {
              id: "bar",
              logs: "warn",
              args: {
                bar: true,
              },
            },
          ],
        },
      ],
    })
  })
  Deno.test(t(import.meta, "`parse(config)` supports syntaxic sugar for plugins and processors by passing id as a single extra object property"), { permissions: "none" }, async () => {
    const expected = {
      plugins: [
        {
          id: "foo",
          args: {
            bar: true,
          },
        },
      ],
    }
    await expect(parse(config, { plugins: [{ id: "foo", args: { bar: true } }] })).to.be.fulfilled.and.eventually.containSubset(expected)
    await expect(parse(config, { plugins: [{ foo: { bar: true } }] })).to.be.fulfilled.and.eventually.containSubset(expected)
    await expect(parse(config, { plugins: [{}] })).to.be.fulfilled.and.eventually.containSubset({ plugins: [{}] })
  })
  Deno.test(t(import.meta, "`parse(config)` supports syntaxic sugar for plugins and processors but throws when ambiguous"), { permissions: "none" }, async () => {
    await expect(parse(config, { plugins: [{ foo: {}, args: { bar: true } }] })).to.be.rejectedWith(MetricsValidationError)
    await expect(parse(config, { plugins: [{ foo: {}, bar: {} }] })).to.be.rejectedWith(MetricsValidationError)
    await expect(parse(config, { plugins: [{ foo: {}, processors: [{ foo: {}, bar: {} }] }] })).to.be.rejectedWith(MetricsValidationError)
  })
}

Deno.test(t(import.meta, "`parse(cli)` is parseable and has defaults"), { permissions: "none" }, async () => {
  await expect(parse(cli, {})).to.be.fulfilled
})

Deno.test(t(import.meta, "`parse(server)` is parseable and has defaults"), { permissions: "none" }, async () => {
  await expect(parse(server, {})).to.be.fulfilled
  await expect(parse(server, { github_app: { id: 1, private_key_path: "/dev/null", client_id: "" } })).to.be.fulfilled
})

Deno.test(t(import.meta, "`parse(webrequest)` is parseable and has defaults"), { permissions: "none" }, async () => {
  await expect(parse(webrequest, {})).to.be.fulfilled
  await expect(parse(webrequest, { plugins: [{}] })).to.be.fulfilled.and.eventually.containSubset({ plugins: [{}] })
  await expect(parse(webrequest, { plugins: [{ foo: {} }] })).to.be.fulfilled.and.eventually.containSubset({ plugins: [{ id: "foo" }] })
  await expect(parse(webrequest, { plugins: [{ foo: {}, processors: [{ bar: {} }] }] })).to.be.fulfilled.and.eventually.containSubset({ plugins: [{ id: "foo", processors: [{ id: "bar" }] }] })
})

Deno.test(t(import.meta, "`load()` reads file and returns parsed config"), { permissions: "none" }, async () => {
  await expect(load(`data:text/plain;base64,${btoa('{"logs":"message"}')}`)).to.eventually.deep.equal({ logs: "message" })
})

Deno.test(t(import.meta, "`load()` returns default config if file is unreadable"), { permissions: "none" }, async () => {
  await expect(load("/unreadable_config_file.metrics.yml")).to.eventually.fulfilled
})

Deno.test(t(import.meta, "`load()` throws if not a dictionary"), { permissions: "none" }, async () => {
  await expect(load(`data:text/plain;base64,${btoa("foo")}`)).to.be.rejectedWith(MetricsError, /expected configuration to be a dictionary/i)
})
