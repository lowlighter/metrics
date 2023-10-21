import { faker, mock } from "@engine/utils/testing.ts"

export default mock({}, () => {
  return `
    <rss version="2.0">
      <channel>
        <title>${faker.company.name()}</title>
        <link>${faker.internet.url()}</link>
        <description>${faker.company.catchPhrase()}</description>
        <item>
          <title>${faker.company.buzzPhrase()}</title>
          <link>${faker.internet.url()}</link>
          <pubDate>Sat, 16 Sep 2023 19:48:15 +0000</pubDate>
        </item>
        <item>
          <title>${faker.company.buzzPhrase()}</title>
          <link>${faker.internet.url()}</link>
          <pubDate>Sat, 16 Sep 2023 22:27:08 +0000</pubDate>
        </item>
      </channel>
    </rss>
  `.trim()
})
