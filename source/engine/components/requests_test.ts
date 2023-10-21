import { Requests } from "@engine/components/requests.ts"
import { dir, expect, Status, t } from "@engine/utils/testing.ts"
import { Secret } from "@engine/utils/secret.ts"

const requests = new Requests(import.meta, { logs: "none", mock: true, api: "https://api.github.com", timezone: "Europe/Paris", token: new Secret(null) })

Deno.test(t(import.meta, "`.rest()` can perform REST API queries"), { permissions: "none" }, async () => {
  await expect(requests.rest(requests.api.meta.getZen)).to.be.rejectedWith(Error, /requires net access/i)
  await expect(requests.rest(requests.api.meta.root)).to.be.rejectedWith(Error, /requires net access/i)
})

Deno.test(t(import.meta, "`.rest()` handles paginated queries"), { permissions: "none" }, async () => {
  await expect(requests.rest(requests.api.meta.root, {}, { paginate: true })).to.be.rejectedWith(Error, /requires net access/i)
})

Deno.test(t(import.meta, "`.rest()` can mock queries when present"), { permissions: { read: [dir.source] } }, async () => {
  await expect(requests.rest(requests.api.meta.getOctocat)).to.be.eventually.containSubset({ status: Status.OK }).and.to.include.keys("data")
})

Deno.test(t(import.meta, "`.graphql()` can perform GraphQL API queries"), { permissions: "none" }, async () => {
  await expect(requests.graphql("../tests/mock_missing", { foo: true })).to.be.rejectedWith(Error, /requires net access/i)
})

Deno.test(t(import.meta, "`.graphql()` handles paginated queries"), { permissions: { read: [dir.source] } }, async () => {
  await expect(requests.graphql("../tests/mock_paginate", { foo: true }, { paginate: true })).to.be.rejectedWith(Error, /requires net access/i)
})

Deno.test(t(import.meta, "`.graphql()` throws on paginated queries without pagination in query"), { permissions: "none" }, async () => {
  await expect(requests.graphql("../tests/mock_paginate_bad", { foo: true }, { paginate: true })).to.be.rejectedWith(Error, /missing "pageInfo.*" but pagination is enabled/i)
})

Deno.test(t(import.meta, "`.graphql()` can mock queries when present"), { permissions: { read: [dir.source] } }, async () => {
  await expect(requests.graphql("../tests/mock", { foo: true })).to.be.eventually.deep.equal({ bar: true })
})

Deno.test(t(import.meta, "`.fetch()` returns plain text when asked"), { permissions: "none" }, async () => {
  await expect(requests.fetch(`data:text/plain;base64,${btoa("foo")}`, { type: "text" })).to.eventually.equal("foo")
})

Deno.test(t(import.meta, "`.fetch()` returns parsed json when asked"), { permissions: "none" }, async () => {
  await expect(requests.fetch(`data:application/json;base64,${btoa('{"foo":true}')}`, { type: "json" })).to.eventually.deep.equal({ foo: true })
})

Deno.test(t(import.meta, "`.fetch()` returns response when asked"), { permissions: "none" }, async () => {
  const fetched = requests.fetch(`data:text/plain;base64,${btoa("foo")}`, { type: "response" })
  await expect(fetched).to.eventually.be.instanceof(Response)
  const response = await fetched
  response.body?.cancel()
})

Deno.test(t(import.meta, "`.fetch()` can mock queries on `*.test` domain when present"), { permissions: { read: [dir.source] } }, async () => {
  await expect(requests.fetch("https://metrics.test/mock")).to.be.eventually.equal("foo")
  await expect(requests.fetch("https://metrics.test/mock_missing")).to.be.rejectedWith(Error, /requires net access/i)
})

Deno.test(t(import.meta, "`.ratelimit()` returns remaining requests"), { permissions: "none" }, async () => {
  await expect(requests.ratelimit()).to.eventually.include.keys("core", "graphql", "search", "code")
})
