<!--header-->
<table>
  <tr><td colspan="2"><a href="/README.md#-plugins">← Back to plugins index</a></td></tr>
  <tr><th colspan="2"><h3>👨‍💻 Lines of code changed</h3></th></tr>
  <tr><td colspan="2" align="center"><p>This plugin displays the number of lines of code added and removed across repositories.</p>
</td></tr>
  <tr><th>⚠️ Disclaimer</th><td><p>This plugin is not affiliated, associated, authorized, endorsed by, or in any way officially connected with <a href="https://github.com">GitHub</a>.
All product and company names are trademarks™ or registered® trademarks of their respective holders.</p>
</td></tr>
  <tr>
    <th rowspan="3">Supported features<br><sub><a href="metadata.yml">→ Full specification</a></sub></th>
    <td><a href="/source/templates/classic/README.md"><code>📗 Classic template</code></a> <a href="/source/templates/repository/README.md"><code>📘 Repository template</code></a> <a href="/source/templates/terminal/README.md"><code>📙 Terminal template</code></a></td>
  </tr>
  <tr>
    <td><code>👤 Users</code> <code>👥 Organizations</code> <code>📓 Repositories</code></td>
  </tr>
  <tr>
    <td><code>🔑 (scopeless)</code> <code>read:org (optional)</code> <code>read:user (optional)</code> <code>read:packages (optional)</code> <code>repo (optional)</code></td>
  </tr>
  <tr>
    <td colspan="2" align="center">
      <details open><summary>Repositories and diff history</summary><img src="https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.lines.history.svg" alt=""></img></details>
      <details><summary>Compact display in base plugin</summary><img src="https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.lines.svg" alt=""></img></details>
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
    <td nowrap="nowrap"><h4><code>plugin_lines</code></h4></td>
    <td rowspan="2"><p>Enable lines plugin</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_lines_skipped</code></h4></td>
    <td rowspan="2"><p>Skipped repositories</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">⏩ Inherits <code>repositories_skipped</code><br>
<b>type:</b> <code>array</code>
<i>(comma-separated)</i>
<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_lines_sections</code></h4></td>
    <td rowspan="2"><p>Displayed sections</p>
<ul>
<li><code>base</code> will display the total lines added and removed in <code>base.repositories</code> section</li>
<li><code>repositories</code> will display repositories with the most lines added and removed</li>
<li><code>history</code> will display a graph displaying lines added and removed over time</li>
</ul>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">✨ On <code>master</code>/<code>main</code><br>
<b>type:</b> <code>array</code>
<i>(comma-separated)</i>
<br>
<b>default:</b> base<br>
<b>allowed values:</b><ul><li>base</li><li>repositories</li><li>history</li></ul></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_lines_repositories_limit</code></h4></td>
    <td rowspan="2"><p>Display limit</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">✨ On <code>master</code>/<code>main</code><br>
<b>type:</b> <code>number</code>
<i>(0 ≤
𝑥)</i>
<br>
<b>default:</b> 4<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_lines_history_limit</code></h4></td>
    <td rowspan="2"><p>Years to display</p>
<p>Will display the last <code>n</code> years, relative to current year</p>
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
name: Compact display in base plugin
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.lines.svg
  token: ${{ secrets.METRICS_TOKEN }}
  base: repositories
  plugin_lines: yes

```
```yaml
name: Repositories and diff history
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.lines.history.svg
  token: ${{ secrets.METRICS_TOKEN }}
  base: ""
  plugin_lines: yes
  plugin_lines_sections: repositories, history
  plugin_lines_repositories_limit: 2
  plugin_lines_history_limit: 1

```
<!--/examples-->
