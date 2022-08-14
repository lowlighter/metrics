//Imports
const path = require("path")
const git = require("simple-git")(path.join(__dirname, ".."))

//Edited files list
const diff = async () => (await git.diff(["origin/master...", "--name-status"])).split("\n").map(x => x.trim()).filter(x => /^M\s+/.test(x)).map(x => x.replace(/^M\s+/, ""))

//File changes
describe("Check file changes (checkout your files if needed)", () => {
  describe("Auto-generated files were not modified", () =>
    void test.each([
      "README.md",
      "source/plugins/README.md",
      "source/plugins/community/README.md",
      "source/templates/README.md",
      "action.yml",
      "settings.example.json",
      "tests/plugins/*",
      ".github/workflows/examples.yml",
      ".github/readme/partials/documentation/compatibility.md",
    ])("%s", async file => expect((await diff()).includes(file)).toBe(false)))
  if (!["lowlighter"].includes(process.env.PR_AUTHOR)) {
    describe("Repository level files were not modified", () =>
      void test.each([
        ".github/config/*",
        ".github/ISSUE_TEMPLATE/*",
        ".github/readme/partials/license.md",
        ".github/scripts/*",
        ".github/workflows/*",
        ".github/architecture.svg",
        ".github/dependabot.yml",
        ".github/FUNDING.yml",
        ".github/pull_request_template.md/*",
        "LICENSE",
        "ARCHITECTURE.md",
        "SECURITY.md",
        "tests/ci.test.js",
        "source/.eslintrc.yml",
        "source/app/mocks/.eslintrc.yml",
        "vercel.json",
      ])("%s", async file => expect((await diff()).filter(edited => new RegExp(`^${file.replace(/[.]/g, "[.]").replace(/[*]/g, "[\\s\\S]*")}$`).test(edited)).length).toBe(0)))
  }
})

//Template changes
describe("Check template changes", () => {
  test("Use community templates instead (see https://github.com/lowlighter/metrics/tree/master/source/templates/community)", async () => void expect((await diff()).filter(edited => /^sources[/]templates[/]/.test(edited) && /^source[/]templates[/](?:classic|terminal|markdown|repository|community)[/][\s\S]*$/.test(edited)).length).toBe(0))
})
