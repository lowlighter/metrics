// Tests for lines plugin null-author handling, context mode, and template rendering
const ejs = require("ejs")
const path = require("path")
const fs = require("fs")

describe("Lines plugin unit & regression tests", () => {
  describe("source/plugins/lines/index.mjs logic", () => {
    test("Lines plugin handles null author in contributor stats without throwing", async () => {
      const linesPlugin = (await import("../../source/plugins/lines/index.mjs")).default

      const mockData = {
        account: "user",
        user: {
          repositories: {
            nodes: [
              { name: "test-repo", owner: { login: "test-user" } },
            ],
          },
        },
        shared: {
          "repositories.skipped": [],
        },
      }

      const mockImports = {
        metadata: {
          plugins: {
            lines: {
              enabled: () => true,
              inputs: () => ({
                skipped: [],
                sections: ["base", "history", "repositories"],
                "repositories.limit": 4,
                "history.limit": 1,
                delay: 0,
              }),
            },
          },
        },
        filters: {
          repo: () => true,
        },
        d3: {
          scaleTime: () => ({ domain: () => ({ range: () => ({}) }) }),
          scaleLinear: () => ({ domain: () => ({ range: () => ({}) }) }),
          axisBottom: () => () => ({ selectAll: () => ({ attr: () => ({ style: () => ({ style: () => ({}) }) }) }) }),
          axisLeft: () => () => ({ ticks: () => ({ tickFormat: () => ({ selectAll: () => ({ style: () => ({}) }) }) }) }),
          format: () => () => "",
          area: () => ({ x: () => ({ y0: () => ({ y1: () => () => "" }) }) }),
        },
        D3node: class {
          createSVG() {
            return {
              append: () => ({
                attr: () => ({ call: () => ({}) }),
                datum: () => ({ attr: () => ({ attr: () => ({}) }) }),
              }),
            }
          }
          svgString() {
            return "<svg>mock</svg>"
          }
        },
        format: {
          error: e => e,
        },
      }

      // Rest API mock returning both valid author and author: null (e.g. Copilot SWE agent or unlinked commit)
      const mockRest = {
        repos: {
          getContributorsStats: async () => ({
            data: [
              {
                total: 5,
                weeks: [{ w: 1690000000, a: 100, d: 20, c: 5 }],
                author: null, // Regression case: null author!
              },
              {
                total: 10,
                weeks: [{ w: 1690000000, a: 200, d: 50, c: 10 }],
                author: { login: "test-user" },
              },
            ],
          }),
        },
      }

      // 1. Personal user context
      const resultUser = await linesPlugin(
        { login: "test-user", data: mockData, imports: mockImports, rest: mockRest, q: { lines: true }, account: "user" },
        { enabled: true }
      )

      expect(resultUser).toBeDefined()
      expect(resultUser.added).toBe(200) // Only test-user's commits are counted in user mode
      expect(resultUser.deleted).toBe(50)

      // 2. Organization context
      const mockOrgData = { ...mockData, account: "organization" }
      const resultOrg = await linesPlugin(
        { login: "test-org", data: mockOrgData, imports: mockImports, rest: mockRest, q: { lines: true }, account: "organization" },
        { enabled: true }
      )

      expect(resultOrg).toBeDefined()
      expect(resultOrg.added).toBe(300) // All contributors counted in org mode, null author did not crash!

      // 3. Repository mode
      const resultRepo = await linesPlugin(
        { login: "test-user", data: mockData, imports: mockImports, rest: mockRest, q: { lines: true, repo: "test-repo" }, account: "user" },
        { enabled: true }
      )

      expect(resultRepo).toBeDefined()
      expect(resultRepo.added).toBe(300) // All contributors counted in repo mode, null author did not crash!
    })
  })

  describe("source/templates/classic/partials/lines.ejs template rendering", () => {
    const templatePath = path.join(__dirname, "../../source/templates/classic/partials/lines.ejs")
    const templateStr = fs.readFileSync(templatePath, "utf8")

    test("Template renders error message when plugins.lines.error is present", async () => {
      const rendered = await ejs.render(templateStr, {
        plugins: {
          lines: {
            error: { message: "Failed to compute lines" },
          },
        },
      })
      expect(rendered).toContain("Lines of code pushed")
      expect(rendered).toContain("Failed to compute lines")
    })

    test("Template renders sections when plugins.lines.sections is defined", async () => {
      const rendered = await ejs.render(templateStr, {
        f: n => String(n),
        plugins: {
          lines: {
            sections: ["repositories"],
            repos: [{ handle: "owner/repo", added: 100, deleted: 20, changed: 0 }],
          },
        },
      })
      expect(rendered).toContain("Lines of code pushed")
      expect(rendered).toContain("owner/repo")
    })

    test("Template cleanly renders nothing without crashing when sections does not include history or repositories", async () => {
      const rendered = await ejs.render(templateStr, {
        plugins: {
          lines: {
            sections: ["base"],
          },
        },
      })
      expect(rendered.trim()).toBe("")
    })
  })
})
