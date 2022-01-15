<!--header-->
<table>
  <tr><th colspan="2"><h3>📙 Terminal template</h3></th></tr>
  <tr><td colspan="2" align="center">A template mimicking a SSH session.</td></tr>
  <tr>
    <th rowspan="3">Supported features<br><sub><a href="metadata.yml">→ Full specification</a></sub></th>
    <td><a href="/source/plugins/gists" title="🎫 Gists">🎫</a> <a href="/source/plugins/isocalendar" title="📅 Isometric commit calendar">📅</a> <a href="/source/plugins/languages" title="🈷️ Most used languages">🈷️</a> <a href="/source/plugins/lines" title="👨‍💻 Lines of code changed">👨‍💻</a> <a href="/source/plugins/pagespeed" title="⏱️ Website performances">⏱️</a> <a href="/source/plugins/screenshot" title="📸 Website screenshot">📸</a> <a href="/source/plugins/traffic" title="🧮 Repositories traffic">🧮</a></td>
  </tr>
  <tr>
    <td>👤 Users, 👥 Organizations</td>
  </tr>
  <tr>
    <td>*️⃣ SVG, *️⃣ PNG, *️⃣ JPEG, #️⃣ JSON</td>
  </tr>
  <tr>
    <td  colspan="2" align="center">
      <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.terminal.svg" alt=""></img>
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