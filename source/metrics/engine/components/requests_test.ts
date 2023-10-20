import { Requests } from "@engine/components/requests.ts"
import { expect, Status } from "@utils/testing.ts"
import { Secret } from "@utils/secret.ts"
import * as dir from "@engine/paths.ts"

Deno.test("Requests()", { permissions: { read: [dir.source] } }, async (t) => {
  const requests = new Requests(import.meta, { logs: "none", mock: true, api: "https://api.github.com", timezone: "Europe/Paris", token: new Secret(null) })

  await t.step("rest()", async (t) => {
    await t.step("mocks responses when mock is enabled", async () => {
      await expect(requests.rest(requests.api.meta.getOctocat)).to.be.eventually.containSubset({ status: Status.OK }).and.to.include.keys("data")
    })
    await t.step("fallbacks on net if mocks are missing when mock is enabled", async () => {
      await expect(requests.rest(requests.api.meta.getZen)).to.be.rejectedWith(Error, /requires net access/i)
      await expect(requests.rest(requests.api.meta.root)).to.be.rejectedWith(Error, /requires net access/i)
    })
    await t.step("handles paginated responses", async () => {
      await expect(requests.rest(requests.api.meta.root, {}, { paginate: true })).to.be.rejectedWith(Error, /requires net access/i)
    })
  })

  await t.step("graphql()", async (t) => {
    await t.step("mocks responses when mock is enabled", async () => {
      await expect(requests.graphql("../tests/mock", { foo: true })).to.be.eventually.deep.equal({ bar: true })
    })
    await t.step("fallbacks on net if mocks are missing when mock is enabled", async () => {
      await expect(requests.graphql("../tests/mock_missing", { foo: true })).to.be.rejectedWith(Error, /requires net access/i)
    })
    await t.step("handles paginated responses", async (t) => {
      await t.step("iterates over cursors", async () => {
        await expect(requests.graphql("../tests/mock_paginate", { foo: true }, { paginate: true })).to.be.rejectedWith(Error, /requires net access/i)
      })
      await t.step("throws for requests without pagination", async () => {
        await expect(requests.graphql("../tests/mock_paginate_bad", { foo: true }, { paginate: true })).to.be.rejectedWith(Error, /missing "pageInfo.*" but pagination is enabled/i)
      })
    })
  })

  await t.step("fetch()", async (t) => {
    await t.step('mocks responses for ".test" domains when mock is enabled', async () => {
      await expect(requests.fetch("https://metrics.test/mock")).to.be.eventually.equal("foo")
    })
    await t.step("fallbacks on net if mocks are missing when mock is enabled", async () => {
      await expect(requests.fetch("https://metrics.test/mock_missing")).to.be.rejectedWith(Error, /requires net access/i)
    })
    await t.step("returns plain text when asked", async () => {
      await expect(requests.fetch(`data:text/plain;base64,${btoa("foo")}`, { type: "text" })).to.eventually.equal("foo")
    })
    await t.step("returns parsed json when asked", async () => {
      await expect(requests.fetch(`data:application/json;base64,${btoa('{"foo":true}')}`, { type: "json" })).to.eventually.deep.equal({ foo: true })
    })
    await t.step("returns response when asked", async () => {
      const fetched = requests.fetch(`data:text/plain;base64,${btoa("foo")}`, { type: "response" })
      await expect(fetched).to.eventually.be.instanceof(Response)
      const response = await fetched
      response.body?.cancel()
    })
  })

  await t.step("ratelimit() returns remaining requests", async () => {
    await expect(requests.ratelimit()).to.eventually.include.keys("core", "graphql", "search", "code")
  })
})
