<!--header-->
<table>
  <tr><td colspan="2"><a href="/README.md#-plugins">← Back to plugins index</a></td></tr>
  <tr><th colspan="2"><h3>🎟️ Follow-up of issues and pull requests</h3></th></tr>
  <tr><td colspan="2" align="center"><p>This plugin displays the ratio of open/closed issues and the ratio of open/merged pull requests across repositories.</p>
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
      <details open><summary>Indepth analysis</summary><img src="https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.followup.indepth.svg" alt=""></img></details>
      <details><summary>Created on a user's repositories</summary><img src="https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.followup.svg" alt=""></img></details>
      <details><summary>Created by a user</summary><img src="https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.followup.user.svg" alt=""></img></details>
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
    <td nowrap="nowrap"><h4><code>plugin_followup</code></h4></td>
    <td rowspan="2"><p>Enable followup plugin</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_followup_sections</code></h4></td>
    <td rowspan="2"><p>Displayed sections</p>
<ul>
<li><code>repositories</code>: overall status of issues and pull requests on your repositories</li>
<li><code>user</code>: overall status of issues and pull requests you have created on GitHub</li>
</ul>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>array</code>
<i>(comma-separated)</i>
<br>
<b>default:</b> repositories<br>
<b>allowed values:</b><ul><li>repositories</li><li>user</li></ul></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_followup_indepth</code></h4></td>
    <td rowspan="2"><p>Indepth analysis</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">🌐 Web instances must configure <code>settings.json</code>:
<ul>
<li><i>metrics.api.github.overuse</i></li>
</ul>
<b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_followup_archived</code></h4></td>
    <td rowspan="2"><p>Include archived repositories</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> yes<br></td>
  </tr>
</table>
<!--/options-->

## 🔎 `indepth` mode

The `plugin_followup_indepth` option collects additional stats to differentiate issues and pull requests opened by maintainers and users.

It helps knowing whether repositories are also maintained by other users and give an overall health status of repositories.

> ⚠️ This mode will try to list users with push access to know who are the maintainers in order to place issues in the correct category, which requires a `repo` scope. If not available, it will consider that only the owner is a maintainer.

## ℹ️ Examples workflows

<!--examples-->
```yaml
name: Opened on user's repositories
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.followup.svg
  token: ${{ secrets.METRICS_TOKEN }}
  base: ""
  plugin_followup: yes

```
```yaml
name: Opened by user
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.followup.user.svg
  token: ${{ secrets.METRICS_TOKEN }}
  base: ""
  plugin_followup: yes
  plugin_followup_sections: user

```
```yaml
name: Indepth analysis
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.followup.indepth.svg
  token: ${{ secrets.METRICS_TOKEN }}
  base: ""
  plugin_followup: yes
  plugin_followup_indepth: yes

```
```yaml
name: Exclude Archived
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.followup.archived.svg
  token: ${{ secrets.METRICS_TOKEN }}
  base: ""
  plugin_followup: yes
  plugin_followup_archived: no

```
<!--/examples-->
