import { expect, MetricsError } from "@engine/utils/testing.ts"
import { cli, config, load, server, webrequest } from "@engine/config.ts"
import { MetricsValidationError, parse } from "@engine/utils/validation.ts"

Deno.test("parse(config)", { permissions: "none" }, async (t) => {
  await t.step("is parseable", async () => {
    await expect(parse(config, { config: { plugins: [{ id: "foo", args: { bar: true } }] } })).to.be.fulfilled
  })

  await t.step("honors default preset", async () => {
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

  await t.step("honors named presets", async (t) => {
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
    await t.step("with default preset overriden by named preset", async () => {
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
    await t.step("with named preset overriden by another named preset", async () => {
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
  })

  await t.step("supports syntaxic sugar for plugins and processors", async (t) => {
    await t.step("by passing id as a single extra object property", async () => {
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

    await t.step("throws when ambiguous", async () => {
      await expect(parse(config, { plugins: [{ foo: {}, args: { bar: true } }] })).to.be.rejectedWith(MetricsValidationError)
      await expect(parse(config, { plugins: [{ foo: {}, bar: {} }] })).to.be.rejectedWith(MetricsValidationError)
    })
  })
})

Deno.test("parse(cli)", { permissions: "none" }, async (t) => {
  await t.step("is parseable and has defaults", async () => {
    await expect(parse(cli, {})).to.be.fulfilled
  })
})

Deno.test("parse(server)", { permissions: "none" }, async (t) => {
  await t.step("is parseable and has defaults", async () => {
    await expect(parse(server, {})).to.be.fulfilled
    await expect(parse(server, { github_app: { id: 1, private_key_path: "/dev/null", client_id: "" } })).to.be.fulfilled
  })

  await t.step("parse(webrequest)", async (t) => {
    await t.step("is parseable and has defaults", async () => {
      await expect(parse(webrequest, {})).to.be.fulfilled
    })
  })
})

Deno.test("load()", { permissions: "none" }, async (t) => {
  await t.step("reads file and returns parsed config", async () => {
    await expect(load(`data:text/plain;base64,${btoa('{"logs":"message"}')}`)).to.eventually.deep.equal({ logs: "message" })
  })
  await t.step("throws if not a dictionary", async () => {
    await expect(load(`data:text/plain;base64,${btoa("foo")}`)).to.be.rejectedWith(MetricsError, /expected configuration to be a dictionary/i)
  })
  await t.step("throws if file is unreadable", async () => {
    await expect(load("/unreadable_config_file.metrics.yml")).to.eventually.fulfilled
  })
})
