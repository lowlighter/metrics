// Tests for music plugin explicit content handling (lowlighter/metrics#1674, community#31)

describe("Music plugin track sanitization", () => {
  const clean = text => (text || "").replace(/[\s\n\r]*(Explicit\s*Content|Explicit)[\s\n\r]*$/i, "").trim()

  test("strips trailing Explicit Content", () => {
    expect(clean("Kendrick Lamar\nExplicit Content")).toBe("Kendrick Lamar")
    expect(clean("Not Like Us Explicit Content")).toBe("Not Like Us")
  })

  test("strips trailing Explicit badge text", () => {
    expect(clean("Travis Scott Explicit")).toBe("Travis Scott")
    expect(clean("FE!N\nExplicit")).toBe("FE!N")
  })

  test("preserves non-explicit titles", () => {
    expect(clean("Taylor Swift")).toBe("Taylor Swift")
    expect(clean("Explicitly Stated")).toBe("Explicitly Stated")
  })

  test("handles null or undefined safely", () => {
    expect(clean(null)).toBe("")
    expect(clean(undefined)).toBe("")
  })
})
