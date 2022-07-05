<!--header-->
<table>
  <tr><td colspan="2"><a href="/README.md#%EF%B8%8F-templates">← Back to templates index</a></td></tr>
  <tr><th colspan="2"><h3>📙 Terminal template</h3></th></tr>
  <tr><td colspan="2" align="center"><p>A template mimicking a SSH session.</p>
</td></tr>
  <tr>
    <th rowspan="3">Supported features<br><sub><a href="metadata.yml">→ Full specification</a></sub></th>
    <td><a href="/source/plugins/screenshot/README.md" title="📸 Website screenshot">📸</a> <a href="/source/plugins/gists/README.md" title="🎫 Gists">🎫</a> <a href="/source/plugins/isocalendar/README.md" title="📅 Isometric commit calendar">📅</a> <a href="/source/plugins/languages/README.md" title="🈷️ Languages activity">🈷️</a> <a href="/source/plugins/lines/README.md" title="👨‍💻 Lines of code changed">👨‍💻</a> <a href="/source/plugins/pagespeed/README.md" title="⏱️ Google PageSpeed">⏱️</a> <a href="/source/plugins/traffic/README.md" title="🧮 Repositories traffic">🧮</a></td>
  </tr>
  <tr>
    <td><code>👤 Users</code> <code>👥 Organizations</code></td>
  </tr>
  <tr>
    <td><code>*️⃣ SVG</code> <code>*️⃣ PNG</code> <code>*️⃣ JPEG</code> <code>#️⃣ JSON</code></td>
  </tr>
  <tr>
    <td colspan="2" align="center">
      <img src="https://github.com/lowlighter/metrics/blob/examples/metrics.terminal.svg" alt=""></img>
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
  template: terminal
  filename: metrics.terminal.svg
  token: ${{ secrets.METRICS_TOKEN }}
  base: header, metadata

```
<!--/examples-->