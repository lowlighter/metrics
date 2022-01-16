<!--header-->
<table>
  <tr><th colspan="2"><h3>💕 GitHub Sponsors</h3></th></tr>
  <tr><td colspan="2" align="center"><p>This plugin displays sponsors and introduction text from <a href="https://github.com/sponsors/">GitHub sponsors</a>.</p>
</td></tr>
  <tr>
    <th rowspan="3">Supported features<br><sub><a href="metadata.yml">→ Full specification</a></sub></th>
    <td><a href="/source/templates/classic"><code>📗 Classic template</code></a> <a href="/source/templates/repository"><code>📘 Repository template</code></a></td>
  </tr>
  <tr>
    <td><code>👤 Users</code> <code>👥 Organizations</code> <code>📓 Repositories</code></td>
  </tr>
  <tr>
    <td><code>🔑 (scopeless)</code> <code>read:org (optional)</code> <code>read:user (optional)</code> <code>repo (optional)</code></td>
  </tr>
  <tr>
    <td colspan="2" align="center">
      <details open><summary>GitHub sponsors card</summary><img src="https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.sponsors.svg" alt=""></img></details>
      <details><summary>GitHub sponsors full introduction</summary><img src="https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.sponsors.full.svg" alt=""></img></details>
      <img width="900" height="1" alt="">
    </td>
  </tr>
</table>
<!--/header-->

## ➡️ Available options

<!--options-->
<table>
  <tr>
    <td align="center" nowrap="nowrap">Type</i></td><td align="center" nowrap="nowrap">Description</td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_sponsors</code></td>
    <td rowspan="2"><p>Enable sponsors plugin</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_sponsors_sections</code></td>
    <td rowspan="2"><p>Displayed sections</p>
<ul>
<li><code>goal</code>: display GitHub active goal</li>
<li><code>about</code>: display GitHub sponsors introduction</li>
</ul>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>array</code>
<i>(comma-separated)</i>
<br>
<b>default:</b> goal, about<br>
<b>allowed values:</b><ul><li>goal</li><li>about</li></ul></td>
  </tr>
</table>
<!--/options-->

## ℹ️ Examples workflows

<!--examples-->
```yaml
name: Sponsors goal
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.sponsors.svg
  token: ${{ secrets.METRICS_TOKEN }}
  base: ''
  plugin_sponsors: 'yes'
  plugin_sponsors_sections: goal

```
```yaml
name: Sponsors introduction
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.sponsors.full.svg
  token: ${{ secrets.METRICS_TOKEN }}
  base: ''
  plugin_sponsors: 'yes'

```
<!--/examples-->
