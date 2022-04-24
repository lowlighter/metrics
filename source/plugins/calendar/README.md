<!--header-->
<table>
  <tr><th colspan="2"><h3>📆 Calendar</h3></th></tr>
  <tr><td colspan="2" align="center"><p>This plugin displays your commit calendar across several years</p>
</td></tr>
  <tr>
    <th rowspan="3">Supported features<br><sub><a href="metadata.yml">→ Full specification</a></sub></th>
    <td><a href="/source/templates/classic/README.md"><code>📗 Classic template</code></a></td>
  </tr>
  <tr>
    <td><code>👤 Users</code></td>
  </tr>
  <tr>
    <td><code>🔑 (scopeless)</code> <code>read:org (optional)</code> <code>read:user (optional)</code> <code>read:packages (optional)</code> <code>repo (optional)</code></td>
  </tr>
  <tr>
    <td colspan="2" align="center">
      <details open><summary>Current year</summary><img src="https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.calendar.svg" alt=""></img></details>
      <details><summary>Full history</summary><img src="https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.calendar.full.svg" alt=""></img></details>
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
    <td nowrap="nowrap"><h4><code>plugin_calendar</code></h4></td>
    <td rowspan="2"><p>Enable calendar plugin</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">✨ On <code>master</code>/<code>main</code><br>
<b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_calendar_limit</code></h4></td>
    <td rowspan="2"><p>Years to display</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">✨ On <code>master</code>/<code>main</code><br>
<b>type:</b> <code>number</code>
<br>
<b>zero behaviour:</b> disable</br>
<b>default:</b> 1<br></td>
  </tr>
</table>
<!--/options-->

## ℹ️ Examples workflows

<!--examples-->
```yaml
name: Current year calendar
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.calendar.svg
  token: ${{ secrets.METRICS_TOKEN }}
  base: ""
  plugin_calendar: yes

```
```yaml
name: Full history calendar
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.calendar.full.svg
  token: ${{ secrets.METRICS_TOKEN }}
  base: ""
  plugin_calendar: yes
  plugin_calendar_limit: 0

```
<!--/examples-->
