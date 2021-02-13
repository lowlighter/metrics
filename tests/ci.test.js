//Imports
  const path = require("path")
  const git = require("simple-git")(path.join(__dirname, ".."))

//Check generated files editions
  const diff = async () => (await git.diff("master...", ["--name-status"])).split("\n").map(x => x.trim()).filter(x => /^M\s+/.test(x)).map(x => x.replace(/^M\s+/, ""))
  describe('Auto-generated files were not modified (use "git checkout @ -- file" if needed)', () => void test.each([
    "README.md",
    "source/plugins/README.md",
    "source/templates/README.md",
    "action.yml",
    "settings.example.json"
  ])("%s", async file => expect((await diff()).includes(file)).toBe(false)))
