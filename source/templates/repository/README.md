<!--header-->
<table>
  <tr><td colspan="2"><a href="/README.md#%EF%B8%8F-templates">← Back to templates index</a></td></tr>
  <tr><th colspan="2"><h3>📘 Repository template</h3></th></tr>
  <tr><td colspan="2" align="center"><p>A template mimicking GitHub visual identity and specially crafted for repositories.</p>
</td></tr>
  <tr>
    <th rowspan="3">Supported features<br><sub><a href="metadata.yml">→ Full specification</a></sub></th>
    <td><a href="/source/plugins/activity/README.md" title="📰 Recent activity">📰</a> <a href="/source/plugins/screenshot/README.md" title="📸 Website screenshot">📸</a> <a href="/source/plugins/stock/README.md" title="💹 Stock prices">💹</a> <a href="/source/plugins/contributors/README.md" title="🏅 Repository contributors">🏅</a> <a href="/source/plugins/followup/README.md" title="🎟️ Follow-up of issues and pull requests">🎟️</a> <a href="/source/plugins/introduction/README.md" title="🙋 Introduction">🙋</a> <a href="/source/plugins/languages/README.md" title="🈷️ Languages activity">🈷️</a> <a href="/source/plugins/licenses/README.md" title="📜 Repository licenses">📜</a> <a href="/source/plugins/lines/README.md" title="👨‍💻 Lines of code changed">👨‍💻</a> <a href="/source/plugins/pagespeed/README.md" title="⏱️ Google PageSpeed">⏱️</a> <a href="/source/plugins/people/README.md" title="🧑‍🤝‍🧑 People">🧑‍🤝‍🧑</a> <a href="/source/plugins/posts/README.md" title="✒️ Recent posts">✒️</a> <a href="/source/plugins/projects/README.md" title="🗂️ GitHub projects">🗂️</a> <a href="/source/plugins/rss/README.md" title="🗼 Rss feed">🗼</a> <a href="/source/plugins/sponsors/README.md" title="💕 GitHub Sponsors">💕</a> <a href="/source/plugins/stargazers/README.md" title="✨ Stargazers">✨</a> <a href="/source/plugins/traffic/README.md" title="🧮 Repositories traffic">🧮</a></td>
  </tr>
  <tr>
    <td><code>📓 Repositories</code></td>
  </tr>
  <tr>
    <td><code>*️⃣ SVG</code> <code>*️⃣ PNG</code> <code>*️⃣ JPEG</code> <code>#️⃣ JSON</code></td>
  </tr>
  <tr>
    <td colspan="2" align="center">
      <img src="https://github.com/lowlighter/metrics/blob/examples/metrics.repository.svg" alt=""></img>
      <img width="900" height="1" alt="">
    </td>
  </tr>
</table>
<!--/header-->

## 🎎 Using a repository template

To use a repository template, a `repo` handle must be provided.

If the token owner is not the repository owner, then the `user` option must be set to the repository owner (whether it is an user or organization account).

*Example: render `lowlighter/metrics` repository*
```yml
- uses: lowlighter/metrics@latest
  with:
    template: repository
    user: lowlighter
    repo: metrics
```

## ℹ️ Examples workflows

<!--examples-->
```yaml
name: Example
uses: lowlighter/metrics@latest
with:
  template: repository
  filename: metrics.repository.svg
  token: ${{ secrets.METRICS_TOKEN_WITH_SCOPES }}
  user: lowlighter
  repo: metrics
  plugin_lines: yes
  plugin_followup: yes
  plugin_projects: yes
  plugin_projects_repositories: lowlighter/metrics/projects/1

```
<!--/examples-->