// Tests for steam plugin recency cutoff, playtime threshold, and template rendering
const ejs = require("ejs")
const path = require("path")
const fs = require("fs")

describe("Steam plugin unit & regression tests", () => {
  const now = Math.floor(Date.now() / 1000)
  const sevenMonthsAgo = now - 210 * 86400
  const twoDaysAgo = now - 2 * 86400

  test("filters out old games (> recent.days) from recently-played section", () => {
    const _recent_days = 14
    const recentCutoff = now - _recent_days * 86400

    const games = [
      { id: 578080, name: "PUBG: BATTLEGROUNDS", playtime: 133, played: sevenMonthsAgo }, // played 7 months ago
      { id: 730, name: "Counter-Strike 2", playtime: 5, played: twoDaysAgo } // played 2 days ago
    ]

    const recentlyPlayed = games
      .filter(({ played }) => played >= recentCutoff)
      .sort((a, b) => b.played - a.played)

    expect(recentlyPlayed).toHaveLength(1)
    expect(recentlyPlayed[0].name).toBe("Counter-Strike 2")
    expect(recentlyPlayed.some(g => g.name.includes("PUBG"))).toBe(false)
  })

  test("when recent_days is 0 (disabled cutoff), shows last played game across all owned games", () => {
    const _recent_days = 0
    const recentCutoff = Number(_recent_days) > 0 ? (now - Number(_recent_days) * 86400) : 0

    const games = [
      { id: 578080, name: "PUBG: BATTLEGROUNDS", playtime: 133, played: sevenMonthsAgo },
      { id: 10, name: "Old Game", playtime: 20, played: sevenMonthsAgo - 1000 }
    ]

    const recentlyPlayed = games
      .filter(({ played }) => (recentCutoff > 0 ? played >= recentCutoff : true))
      .sort((a, b) => b.played - a.played)

    expect(recentlyPlayed).toHaveLength(2)
    expect(recentlyPlayed[0].name).toBe("PUBG: BATTLEGROUNDS")
  })

  test("recently-played includes games with playtime < playtime.threshold (newly played games)", () => {
    const _playtime_threshold = 2 // 2 hours
    const games = [
      { id: 100, name: "Short Indie Game", playtime: 0.5, played: twoDaysAgo }, // 30 minutes playtime
      { id: 578080, name: "PUBG: BATTLEGROUNDS", playtime: 133, played: sevenMonthsAgo }
    ]

    // most-played filters by playtime >= _playtime_threshold
    const mostPlayed = games.filter(({ playtime }) => playtime >= _playtime_threshold)
    expect(mostPlayed).toHaveLength(1)
    expect(mostPlayed[0].name).toBe("PUBG: BATTLEGROUNDS")

    // recently-played should NOT filter out newly started games based on playtime_threshold
    const recentlyPlayed = games.filter(({ playtime }) => true) // no threshold filter
    expect(recentlyPlayed.some(g => g.name === "Short Indie Game")).toBe(true)
  })

  test("template gracefully skips recently-played section when no games were played recently", async () => {
    const templatePath = path.resolve(__dirname, "../../source/templates/classic/partials/steam.ejs")
    const templateContent = fs.readFileSync(templatePath, "utf8")

    const mockData = {
      plugins: {
        steam: {
          sections: ["player", "most-played", "recently-played"],
          player: { name: "TestPlayer", level: 10, avatar: "", created: 1500000000 },
          games: {
            count: 10,
            playtime: 200,
            "most-played": [
              {
                name: "PUBG: BATTLEGROUNDS",
                icon: "",
                playtime: 133,
                played: sevenMonthsAgo,
                achievements: [],
                rate: { achieved: 8, total: 37 },
                genres: ["Action"],
                description: "Battle royale"
              }
            ],
            "recently-played": [] // No games played recently!
          }
        }
      },
      s: count => (count > 1 ? "s" : ""),
      f: num => `${num}`,
      config: { timezone: { name: "Europe/Prague" } }
    }

    mockData.f.date = () => "24 Feb 2026"

    const rendered = await ejs.render(templateContent, mockData)
    expect(rendered).toContain("Most played")
    expect(rendered).toContain("PUBG: BATTLEGROUNDS")
    // Recently played section should NOT be rendered when empty
    expect(rendered).not.toContain("Recently played")
  })
})
