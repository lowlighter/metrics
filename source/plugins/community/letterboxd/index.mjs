import rss from "rss-parser"

export default async function({login, q, imports, data, account}, {enabled = false, extras = false} = {}) {
  try {
    if ((!q.letterboxd) || (!imports.metadata.plugins.letterboxd.enabled(enabled, {extras})))
      return null

    let {user, limit} = imports.metadata.plugins.letterboxd.inputs({data, account, q})
    if (!user) user = login

    const source = `https://letterboxd.com/${user}/rss/`
    const parser = new rss({
      customFields: {
        item: [
          ["letterboxd:filmTitle", "filmTitle"],
          ["letterboxd:filmYear", "filmYear"],
          ["letterboxd:memberRating", "memberRating"],
        ],
      },
    })

    console.debug(`metrics/compute/${login}/plugins > letterboxd > fetching RSS from ${source}`)
    const {items} = await parser.parseURL(source)

    // Collect all film links — from both direct film entries AND list descriptions
    const filmLinks = new Map() // url -> {title, year, rating} partial info

    for (const item of items) {
      // Direct film diary/watch entries
      if (item.guid && (item.guid.includes("letterboxd-watch-") || item.guid.includes("letterboxd-diary-"))) {
        const url = (item.link || "").split("?")[0].replace(/\/$/, "") + "/"
        if (url.includes("letterboxd.com/")) {
          filmLinks.set(url, {
            title: item.filmTitle || item.title || "",
            year: item.filmYear || "",
            rating: item.memberRating ? parseFloat(item.memberRating) : 0,
          })
        }
      }

      // Parse list descriptions — rss-parser stores CDATA in item.content with real (not escaped) quotes
      if (item.content) {
        const filmPattern = /href="(https?:\/\/letterboxd\.com\/film\/[^"]+)"[^>]*>([^<]+)<\/a>/g
        let match
        while ((match = filmPattern.exec(item.content)) !== null) {
          const url = match[1].replace(/\/$/, "") + "/"
          const title = match[2].trim()
          if (!filmLinks.has(url))
            filmLinks.set(url, {title, year: "", rating: 0})
        }
      }
    }

    console.debug(`metrics/compute/${login}/plugins > letterboxd > found ${filmLinks.size} films`)

    // Fetch poster image for each film from its Letterboxd page
    const films = []
    for (const [filmUrl, info] of filmLinks) {
      if (films.length >= limit) break
      try {
        console.debug(`metrics/compute/${login}/plugins > letterboxd > fetching poster for ${filmUrl}`)
        const {data: html} = await imports.axios.get(filmUrl, {
          headers: {"User-Agent": "Mozilla/5.0 (compatible; Metrics/3.0)"},
          timeout: 10000,
        })

        // Extract og:image for the movie poster
        const posterMatch = html.match(/<meta property="og:image" content="([^"]+)"/)
        const titleMatch = html.match(/<meta property="og:title" content="([^"]+)"/)
        const yearMatch = html.match(/class="number"[^>]*>(\d{4})</)
        const descMatch = html.match(/<meta property="og:description" content="([^"]+)">/)
        const dirMatch = html.match(/<meta name="twitter:data1" content="([^"]+)">/)
        const avgMatch = html.match(/<meta name="twitter:data2" content="([^"]+)">/)

        const poster = posterMatch ? posterMatch[1] : ""
        const title = titleMatch
          ? titleMatch[1].replace(/ — Letterboxd$/, "").trim()
          : info.title
        const year = yearMatch ? yearMatch[1] : info.year
        const description = descMatch ? descMatch[1].replace(/&quot;/g, '"').replace(/&#39;/g, "'") : ""
        const director = dirMatch ? dirMatch[1] : ""
        let communityRating = avgMatch ? avgMatch[1] : ""
        if (communityRating.includes(" out of ")) {
          communityRating = communityRating.split(" out of ")[0]
        }

        // Convert poster to base64 for SVG embedding
        const artwork = poster ? await imports.imgb64(poster) : ""

        films.push({
          title,
          year,
          rating: info.rating || 0,
          communityRating,
          director,
          description,
          link: filmUrl,
          poster: artwork,
        })
      }
      catch (err) {
        console.debug(`metrics/compute/${login}/plugins > letterboxd > failed to fetch ${filmUrl}: ${err.message}`)
        // Still add with no poster
        films.push({title: info.title, year: info.year, rating: info.rating, communityRating: "", director: "", description: "", link: filmUrl, poster: ""})
      }
    }

    return {user, films}
  }
  catch (error) {
    throw imports.format.error(error)
  }
}
