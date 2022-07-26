<!--header-->
<table>
  <tr><td colspan="2"><a href="/README.md#%EF%B8%8F-templates">← Back to templates index</a></td></tr>
  <tr><th colspan="2"><h3>📗 Classic template</h3></th></tr>
  <tr><td colspan="2" align="center"><p>A template mimicking GitHub visual identity.
This is also the default template.</p>
</td></tr>
  <tr>
    <th rowspan="3">Supported features<br><sub><a href="metadata.yml">→ Full specification</a></sub></th>
    <td><a href="/source/plugins/achievements/README.md" title="🏆 Achievements">🏆</a> <a href="/source/plugins/activity/README.md" title="📰 Recent activity">📰</a> <a href="/source/plugins/anilist/README.md" title="🌸 Anilist watch list and reading list">🌸</a> <a href="/source/plugins/calendar/README.md" title="📆 Commit calendar">📆</a> <a href="/source/plugins/code/README.md" title="♐ Random code snippet">♐</a> <a href="/source/plugins/fortune/README.md" title="🥠 Fortune">🥠</a> <a href="/source/plugins/nightscout/README.md" title="💉 Nightscout">💉</a> <a href="/source/plugins/poopmap/README.md" title="💩 PoopMap plugin">💩</a> <a href="/source/plugins/screenshot/README.md" title="📸 Website screenshot">📸</a> <a href="/source/plugins/stock/README.md" title="💹 Stock prices">💹</a> <a href="/source/plugins/discussions/README.md" title="💬 Discussions">💬</a> <a href="/source/plugins/followup/README.md" title="🎟️ Follow-up of issues and pull requests">🎟️</a> <a href="/source/plugins/gists/README.md" title="🎫 Gists">🎫</a> <a href="/source/plugins/habits/README.md" title="💡 Coding habits and activity">💡</a> <a href="/source/plugins/introduction/README.md" title="🙋 Introduction">🙋</a> <a href="/source/plugins/isocalendar/README.md" title="📅 Isometric commit calendar">📅</a> <a href="/source/plugins/languages/README.md" title="🈷️ Languages activity">🈷️</a> <a href="/source/plugins/lines/README.md" title="👨‍💻 Lines of code changed">👨‍💻</a> <a href="/source/plugins/music/README.md" title="🎼 Music activity and suggestions">🎼</a> <a href="/source/plugins/notable/README.md" title="🎩 Notable contributions">🎩</a> <a href="/source/plugins/pagespeed/README.md" title="⏱️ Google PageSpeed">⏱️</a> <a href="/source/plugins/people/README.md" title="🧑‍🤝‍🧑 People">🧑‍🤝‍🧑</a> <a href="/source/plugins/posts/README.md" title="✒️ Recent posts">✒️</a> <a href="/source/plugins/projects/README.md" title="🗂️ GitHub projects">🗂️</a> <a href="/source/plugins/reactions/README.md" title="🎭 Comment reactions">🎭</a> <a href="/source/plugins/repositories/README.md" title="📓 Featured repositories">📓</a> <a href="/source/plugins/rss/README.md" title="🗼 Rss feed">🗼</a> <a href="/source/plugins/skyline/README.md" title="🌇 GitHub Skyline">🌇</a> <a href="/source/plugins/sponsors/README.md" title="💕 GitHub Sponsors">💕</a> <a href="/source/plugins/stackoverflow/README.md" title="🗨️ Stack Overflow">🗨️</a> <a href="/source/plugins/stargazers/README.md" title="✨ Stargazers">✨</a> <a href="/source/plugins/starlists/README.md" title="💫 Star lists">💫</a> <a href="/source/plugins/stars/README.md" title="🌟 Recently starred repositories">🌟</a> <a href="/source/plugins/support/README.md" title="💭 GitHub Community Support">💭</a> <a href="/source/plugins/topics/README.md" title="📌 Starred topics">📌</a> <a href="/source/plugins/traffic/README.md" title="🧮 Repositories traffic">🧮</a> <a href="/source/plugins/tweets/README.md" title="🐤 Latest tweets">🐤</a> <a href="/source/plugins/wakatime/README.md" title="⏰ WakaTime">⏰</a></td>
  </tr>
  <tr>
    <td><code>👤 Users</code> <code>👥 Organizations</code></td>
  </tr>
  <tr>
    <td><code>*️⃣ SVG</code> <code>*️⃣ PNG</code> <code>*️⃣ JPEG</code> <code>#️⃣ JSON</code></td>
  </tr>
  <tr>
    <td colspan="2" align="center">
      <img src="https://github.com/lowlighter/metrics/blob/examples/metrics.classic.svg" alt=""></img>
      <img width="900" height="1" alt="">
    </td>
  </tr>
</table>
<!--/header-->

## ℹ️ Examples workflows

<!--examples-->
```yaml
name: Example
uses: lowlighter/metrics@latest
with:
  filename: metrics.classic.svg
  token: ${{ secrets.METRICS_TOKEN }}
  base: header, repositories
  plugin_lines: yes

```
<!--/examples-->