<!--header-->
<table>
  <tr><td colspan="2"><a href="/README.md#-plugins">← Back to plugins index</a></td></tr>
  <tr><th colspan="2"><h3>💕 GitHub Sponsors</h3></th></tr>
  <tr><td colspan="2" align="center"><p>This plugin displays sponsors and introduction text from <a href="https://github.com/sponsors/">GitHub sponsors</a>.</p>
</td></tr>
  <tr><th>⚠️ Disclaimer</th><td><p>This plugin is not affiliated, associated, authorized, endorsed by, or in any way officially connected with <a href="https://github.com">GitHub</a>.
All product and company names are trademarks™ or registered® trademarks of their respective holders.</p>
</td></tr>
  <tr>
    <th rowspan="3">Supported features<br><sub><a href="metadata.yml">→ Full specification</a></sub></th>
    <td><a href="/source/templates/classic/README.md"><code>📗 Classic template</code></a> <a href="/source/templates/repository/README.md"><code>📘 Repository template</code></a></td>
  </tr>
  <tr>
    <td><code>👤 Users</code> <code>👥 Organizations</code> <code>📓 Repositories</code></td>
  </tr>
  <tr>
    <td><code>🔑 read:user</code> <code>🔑 read:org</code> <code>read:packages (optional)</code> <code>repo (optional)</code></td>
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
    <td align="center" nowrap="nowrap">Option</i></td><td align="center" nowrap="nowrap">Description</td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_sponsors</code></h4></td>
    <td rowspan="2"><p>Enable sponsors plugin</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_sponsors_sections</code></h4></td>
    <td rowspan="2"><p>Displayed sections</p>
<ul>
<li><code>goal</code>: display GitHub active goal</li>
<li><code>about</code>: display GitHub sponsors introduction</li>
<li><code>list</code>: display GitHub sponsors list</li>
</ul>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>array</code>
<i>(comma-separated)</i>
<br>
<b>default:</b> goal, list, about<br>
<b>allowed values:</b><ul><li>goal</li><li>about</li><li>list</li></ul></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_sponsors_past</code></h4></td>
    <td rowspan="2"><p>Past sponsorships</p>
<p>A <a href="/source/plugins/core/README.md#token"><code>token</code></a> from target <a href="/source/plugins/core/README.md#user"><code>user</code></a> must be specified to use this feature, as past sponsorships are gathered from sponsors activity which is private data.</p>
<blockquote>
<p>⚠️ Past sponsorships does not respect sponsors privacy because of current GitHub API limitations. This may be fixed in a future release.</p>
</blockquote>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_sponsors_size</code></h4></td>
    <td rowspan="2"><p>Profile picture display size</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>number</code>
<i>(8 ≤
𝑥
≤ 64)</i>
<br>
<b>default:</b> 24<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_sponsors_title</code></h4></td>
    <td rowspan="2"><p>Title caption</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>string</code>
<br>
<b>default:</b> Sponsor Me!<br></td>
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
  token: ${{ secrets.METRICS_TOKEN_PERSONAL }}
  base: ""
  plugin_sponsors: yes
  plugin_sponsors_sections: goal, list
  plugin_sponsors_past: yes

```
```yaml
name: Sponsors introduction
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.sponsors.full.svg
  token: ${{ secrets.METRICS_TOKEN_WITH_SCOPES }}
  base: ""
  plugin_sponsors: yes

```
<!--/examples-->
