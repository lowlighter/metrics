<!--header-->
<table>
  <tr><td colspan="2"><a href="/README.md#-plugins">← Back to plugins index</a></td></tr>
  <tr><th colspan="2"><h3>✨ Stargazers over last weeks</h3></th></tr>
  <tr><td colspan="2" align="center"><p>This plugin displays your stargazers evolution across all of your repositories over the last two weeks.</p>
</td></tr>
  <tr>
    <th rowspan="3">Supported features<br><sub><a href="metadata.yml">→ Full specification</a></sub></th>
    <td><a href="/source/templates/classic/README.md"><code>📗 Classic template</code></a> <a href="/source/templates/repository/README.md"><code>📘 Repository template</code></a></td>
  </tr>
  <tr>
    <td><code>👤 Users</code> <code>👥 Organizations</code> <code>📓 Repositories</code></td>
  </tr>
  <tr>
    <td><code>🔑 (scopeless)</code> <code>read:org (optional)</code> <code>read:user (optional)</code> <code>read:packages (optional)</code> <code>repo (optional)</code></td>
  </tr>
  <tr>
    <td colspan="2" align="center">
      <details open><summary>Classic charts</summary><img src="https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.stargazers.svg" alt=""></img></details>
      <details><summary>Chartist charts</summary><img src="https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.stargazers.chartist.svg" alt=""></img></details>
      <img width="900" height="1" alt="">
    </td>
  </tr>
</table>
<!--/header-->

## ➡️ Available options

<!--options-->
<table>
  <tr>
    <td align="center" nowrap="nowrap">Option</i></td><td align="center" nowrap="nowrap">Description</td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_stargazers</code></h4></td>
    <td rowspan="2"><p>Enable stargazers plugin</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_stargazers_charts_type</code></h4></td>
    <td rowspan="2"><p>Charts display type</p>
<ul>
<li><code>classic</code>: <code>&lt;div&gt;</code> based charts, simple and lightweight</li>
<li><code>chartist</code>: <code>&lt;svg&gt;</code> based charts, smooth</li>
</ul>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>string</code>
<br>
<b>default:</b> classic<br>
<b>allowed values:</b><ul><li>classic</li><li>chartist</li></ul></td>
  </tr>
</table>
<!--/options-->

## ℹ️ Examples workflows

<!--examples-->
```yaml
name: Using classic charts
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.stargazers.svg
  token: ${{ secrets.METRICS_TOKEN }}
  base: ""
  plugin_stargazers: yes

```
```yaml
name: Using chartist charts
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.stargazers.chartist.svg
  token: ${{ secrets.METRICS_TOKEN }}
  base: ""
  plugin_stargazers: yes
  plugin_stargazers_charts_type: chartist

```
<!--/examples-->
