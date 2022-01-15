### 👨‍💻 Lines of code changed

The *lines* of code plugin displays the number of lines of code you have added and removed across all of your repositories.

<table>
  <td align="center">
    <img src="https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.lines.svg">
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
    <td nowrap="nowrap"><code>plugin_lines</code></td>
    <td rowspan="2"><p>Display lines of code metrics</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_lines_skipped</code></td>
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
name: Lines of code changed
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.lines.svg
  token: ${{ secrets.METRICS_TOKEN }}
  base: repositories
  plugin_lines: 'yes'

```
<!--/examples-->
