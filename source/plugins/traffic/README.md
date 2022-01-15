### 🧮 Repositories traffic

> ⚠️ This plugin requires a personal token with repo scope.

The repositories *traffic* plugin displays the number of page views across your repositories.

<table>
  <td align="center">
    <img src="https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.traffic.svg">
  </td>
</table>

Because of GitHub REST API limitation, provided token requires full `repo` scope to access traffic informations.

![Token with repo scope](/.github/readme/imgs/setup_token_repo_scope.png)

#### ➡️ Available options

<!--options-->
<table>
  <tr>
    <td align="center" nowrap="nowrap">Type</i></td><td align="center" nowrap="nowrap">Description</td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_traffic</code></td>
    <td rowspan="2"><p>Display repositories traffic metrics</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_traffic_skipped</code></td>
    <td rowspan="2"><p>Repositories to skip</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">⏩ Inherits <code>repositories_skipped</code><br>
<b>type:</b> <code>array</code>
<i>(comma-separated)</i>
<br></td>
  </tr>
</table>
<!--/options-->

*[→ Full specification](metadata.yml)*

#### ℹ️ Examples workflows

<!--examples-->
```yaml
name: Repositories traffic
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.traffic.svg
  token: ${{ secrets.METRICS_TOKEN }}
  base: repositories
  plugin_traffic: 'yes'

```
<!--/examples-->