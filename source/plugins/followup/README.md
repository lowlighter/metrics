### 🎟️ Follow-up of issues and pull requests

The *followup* plugin displays the ratio of open/closed issues and the ratio of open/merged pull requests across all your repositories, which shows if they're well-maintained or not.

<table>
  <td align="center">
    <details open><summary>Indepth analysis</summary>
      <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.followup.indepth.svg">
    </details>
    <details><summary>Created on an user's repositories</summary>
      <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.followup.svg">
    </details>
    <details><summary>Created by an user</summary>
      <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.followup.user.svg">
    </details>
    <img width="900" height="1" alt="">
  </td>
</table>

#### ➡️ Available options

<!--options-->
<table>
  <tr>
    <td align="center" nowrap="nowrap">Type</i></td><td align="center" nowrap="nowrap">Description</td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_followup</code></td>
    <td rowspan="2">Display follow-up of repositories issues and pull requests<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_followup_sections</code></td>
    <td rowspan="2">Sections to display<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>array</code>
<i>(comma-separated)</i>
<br>
<b>default:</b> repositories<br>
<b>allowed values:</b><ul><li>repositories</li><li>user</li></ul></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_followup_indepth</code></td>
    <td rowspan="2">Indepth follow-up processing<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">🌐 Web instances must configure <code>settings.json</code><br>
<b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
</table>
<!--/options-->

*[→ Full specification](metadata.yml)*

#### ℹ️ Examples workflows

<!--examples-->
```yaml
name: Opened on user's repositories
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.followup.svg
  token: ${{ secrets.METRICS_TOKEN }}
  base: ''
  plugin_followup: 'yes'

```
```yaml
name: Opened by user
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.followup.user.svg
  token: ${{ secrets.METRICS_TOKEN }}
  base: ''
  plugin_followup: 'yes'
  plugin_followup_sections: user

```
```yaml
name: Indepth analysis
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.followup.indepth.svg
  token: ${{ secrets.METRICS_TOKEN }}
  base: ''
  plugin_followup: 'yes'
  plugin_followup_indepth: 'yes'

```
<!--/examples-->