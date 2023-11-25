import { expect, MetricsError, t } from "@engine/utils/testing.ts"
import { matchPatterns, parseHandle } from "@engine/utils/github.ts"

Deno.test(t(import.meta, "`parseHandle()` can parse accounts handles"), { permissions: "none" }, () => {
  for (const { handle, entity } of [{ handle: "octocat", entity: "user" }, { handle: "github", entity: "organization" }]) {
    const login = handle
    expect(parseHandle(handle, { entity })).to.deep.equal({ login })
    expect(parseHandle(`${handle}/repository`, { entity })).to.deep.equal({ login })
    expect(() => parseHandle("", { entity })).to.throw(MetricsError, /invalid .* handle/i)
  }
})

Deno.test(t(import.meta, "`parseHandle()` can parse repositories handles"), { permissions: "none" }, () => {
  const { owner, name } = { owner: "octocat", name: "repository" }
  const entity = "repository"
  const handle = `${owner}/${name}`
  expect(parseHandle(handle, { entity })).to.deep.equal({ owner, name })
  expect(() => parseHandle("", { entity })).to.throw(MetricsError, /invalid .* handle/i)
  expect(() => parseHandle(owner, { entity })).to.throw(MetricsError, /invalid .* handle/i)
})

Deno.test(t(import.meta, "`parseHandle()` throws errors on invalid inputs"), { permissions: "none" }, () => {
  for (const arg of [undefined, null]) {
    expect(() => parseHandle(arg, { entity: "user" })).to.throw(MetricsError, /no handle provided/i)
  }
  expect(() => parseHandle("octocat", { entity: "unknown" })).to.throw(MetricsError, /invalid entity/i)
})

Deno.test(t(import.meta, "`matchPatterns()` returns a matching result for accounts handles"), { permissions: "none" }, () => {
  expect(matchPatterns("*", "octocat")).to.equal(true)
  expect(matchPatterns("*/*", "octocat")).to.equal(false)
  expect(matchPatterns("octo*", "octocat")).to.equal(true)
  expect(matchPatterns("github", "octocat")).to.equal(false)
  expect(matchPatterns(["octo*", "!*squid"], "octocat")).to.equal(true)
  expect(matchPatterns(["octo*", "!*squid"], "octosquid")).to.equal(false)
  expect(matchPatterns(["!octo*", "octocat"], "octocat")).to.equal(true)
  expect(matchPatterns(["!octo*", "octocat"], "octosquid")).to.equal(false)
})

Deno.test(t(import.meta, "`matchPatterns()` returns a matching result for repositories handles"), { permissions: "none" }, () => {
  expect(matchPatterns("*", "octocat/repository")).to.equal(false)
  expect(matchPatterns("*/*", "octocat/repository")).to.equal(true)
  expect(matchPatterns("octocat/*", "octocat/repository")).to.equal(true)
  expect(matchPatterns("github/*", "octocat/repository")).to.equal(false)
  expect(matchPatterns(["octocat/*", "!octocat/fork"], "octocat/repository")).to.equal(true)
  expect(matchPatterns(["octocat/*", "!octocat/fork"], "octocat/fork")).to.equal(false)
  expect(matchPatterns(["!octocat/*", "octocat/repository"], "octocat/repository")).to.equal(true)
  expect(matchPatterns(["!octocat/*", "octocat/repository"], "octocat/fork")).to.equal(false)
})
