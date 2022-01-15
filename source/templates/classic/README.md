<!--header-->
<table>
  <tr><th colspan="2"><h3>📗 Classic template</h3></th></tr>
  <tr><td colspan="2" align="center"><p>A template mimicking GitHub visual identity.
This is also the default template.</p>
</td></tr>
  <tr>
    <th rowspan="3">Supported features<br><sub><a href="metadata.yml">→ Full specification</a></sub></th>
    <td><a href="/source/plugins/achievements" title="🏆 Achievements">🏆</a> <a href="/source/plugins/activity" title="📰 Recent activity">📰</a> <a href="/source/plugins/anilist" title="🌸 Anilist watch list and reading list">🌸</a> <a href="/source/plugins/code" title="♐ Code snippet of the day">♐</a> <a href="/source/plugins/discussions" title="💬 Discussions">💬</a> <a href="/source/plugins/followup" title="🎟️ Follow-up of issues and pull requests">🎟️</a> <a href="/source/plugins/gists" title="🎫 Gists">🎫</a> <a href="/source/plugins/habits" title="💡 Coding habits">💡</a> <a href="/source/plugins/introduction" title="🙋 Introduction">🙋</a> <a href="/source/plugins/isocalendar" title="📅 Isometric commit calendar">📅</a> <a href="/source/plugins/languages" title="🈷️ Most used languages">🈷️</a> <a href="/source/plugins/lines" title="👨‍💻 Lines of code changed">👨‍💻</a> <a href="/source/plugins/music" title="🎼 Music plugin">🎼</a> <a href="/source/plugins/nightscout" title="💉 Nightscout">💉</a> <a href="/source/plugins/notable" title="🎩 Notable contributions">🎩</a> <a href="/source/plugins/pagespeed" title="⏱️ Website performances">⏱️</a> <a href="/source/plugins/people" title="🧑‍🤝‍🧑 People plugin">🧑‍🤝‍🧑</a> <a href="/source/plugins/poopmap" title="💩 PoopMap plugin">💩</a> <a href="/source/plugins/posts" title="✒️ Recent posts">✒️</a> <a href="/source/plugins/projects" title="🗂️ Active projects">🗂️</a> <a href="/source/plugins/reactions" title="🎭 Comment reactions">🎭</a> <a href="/source/plugins/repositories" title="📓 Repositories">📓</a> <a href="/source/plugins/rss" title="🗼 Rss feed">🗼</a> <a href="/source/plugins/screenshot" title="📸 Website screenshot">📸</a> <a href="/source/plugins/skyline" title="🌇 GitHub Skyline 3D calendar">🌇</a> <a href="/source/plugins/sponsors" title="💕 GitHub Sponsors">💕</a> <a href="/source/plugins/stackoverflow" title="🗨️ Stackoverflow plugin">🗨️</a> <a href="/source/plugins/stargazers" title="✨ Stargazers over last weeks">✨</a> <a href="/source/plugins/starlists" title="💫 Starlists">💫</a> <a href="/source/plugins/stars" title="🌟 Recently starred repositories">🌟</a> <a href="/source/plugins/stock" title="💹 Stock prices">💹</a> <a href="/source/plugins/support" title="💭 GitHub Community Support">💭</a> <a href="/source/plugins/topics" title="📌 Starred topics">📌</a> <a href="/source/plugins/traffic" title="🧮 Repositories traffic">🧮</a> <a href="/source/plugins/tweets" title="🐤 Latest tweets">🐤</a> <a href="/source/plugins/wakatime" title="⏰ WakaTime plugin">⏰</a></td>
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
  plugin_lines: 'yes'

```
<!--/examples-->