import { expect, MetricsError } from "@utils/testing.ts"
import { matchPatterns, parseHandle } from "@utils/github.ts"

Deno.test("parseHandle()", { permissions: "none" }, async (t) => {
  await t.step("for accounts", () => {
    for (const { handle, entity } of [{ handle: "octocat", entity: "user" }, { handle: "github", entity: "organization" }]) {
      const login = handle
      expect(parseHandle(handle, { entity })).to.deep.equal({ login })
      expect(parseHandle(`${handle}/repository`, { entity })).to.deep.equal({ login })
      expect(() => parseHandle("", { entity })).to.throw(MetricsError, /invalid .* handle/i)
    }
  })

  await t.step("for repositories", () => {
    const { owner, name } = { owner: "octocat", name: "repository" }
    const entity = "repository"
    const handle = `${owner}/${name}`
    expect(parseHandle(handle, { entity })).to.deep.equal({ owner, name })
    expect(() => parseHandle("", { entity })).to.throw(MetricsError, /invalid .* handle/i)
    expect(() => parseHandle(owner, { entity })).to.throw(MetricsError, /invalid .* handle/i)
  })

  await t.step("throws errors on invalid inputs", () => {
    for (const arg of [undefined, null]) {
      expect(() => parseHandle(arg, { entity: "user" })).to.throw(MetricsError, /no handle provided/i)
    }
    expect(() => parseHandle("octocat", { entity: "unknown" })).to.throw(MetricsError, /invalid entity/i)
  })
})

Deno.test("parseHandle()", { permissions: "none" }, async (t) => {
  await t.step("for accounts", () => {
    expect(matchPatterns("*", "octocat")).to.equal(true)
    expect(matchPatterns("*/*", "octocat")).to.equal(false)
    expect(matchPatterns("octo*", "octocat")).to.equal(true)
    expect(matchPatterns("github", "octocat")).to.equal(false)
    expect(matchPatterns(["octo*", "!*dog"], "octocat")).to.equal(true)
    expect(matchPatterns(["octo*", "!*dog"], "octodog")).to.equal(false)
    expect(matchPatterns(["!octo*", "octocat"], "octocat")).to.equal(true)
    expect(matchPatterns(["!octo*", "octocat"], "octodog")).to.equal(false)
  })
  await t.step("for repositories", () => {
    expect(matchPatterns("*", "octocat/repository")).to.equal(false)
    expect(matchPatterns("*/*", "octocat/repository")).to.equal(true)
    expect(matchPatterns("octocat/*", "octocat/repository")).to.equal(true)
    expect(matchPatterns("github/*", "octocat/repository")).to.equal(false)
    expect(matchPatterns(["octocat/*", "!octocat/fork"], "octocat/repository")).to.equal(true)
    expect(matchPatterns(["octocat/*", "!octocat/fork"], "octocat/fork")).to.equal(false)
    expect(matchPatterns(["!octocat/*", "octocat/repository"], "octocat/repository")).to.equal(true)
    expect(matchPatterns(["!octocat/*", "octocat/repository"], "octocat/fork")).to.equal(false)
  })
})
