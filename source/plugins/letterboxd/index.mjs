import rss from "rss-parser"
import * as cheerio from "cheerio" // Assuming cheerio is available, metrics uses it in some plugins. If not, we'll use simple regex.

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
          ['letterboxd:filmTitle', 'filmTitle'],
          ['letterboxd:filmYear', 'filmYear'],
          ['letterboxd:memberRating', 'memberRating'],
        ]
      }
    })
    
    const {title, description, link, items} = await parser.parseURL(source)

    // Filter only watched films (ignore lists)
    let movies = items.filter(item => item.guid && item.guid.includes('letterboxd-watch-'))
    
    if (movies.length === 0) {
      // If no watches, just take the items and try to parse
      movies = items
    }

    const feed = movies.map(item => {
      let image = ""
      // Extract image using regex
      if (item.description) {
        const imgMatch = item.description.match(/<img[^>]+src="([^">]+)"/)
        if (imgMatch) {
          image = imgMatch[1]
        }
      }
      
      // Clean up title
      let movieTitle = item.filmTitle || item.title
      
      return {
        title: movieTitle,
        year: item.filmYear || "",
        rating: item.memberRating ? parseFloat(item.memberRating) : 0,
        link: item.link,
        image: image,
        date: new Date(item.isoDate || item.pubDate)
      }
    })

    if (limit > 0) {
      feed.splice(limit)
    }

    return {user, feed}
  } catch (error) {
    throw imports.format.error(error)
  }
}
