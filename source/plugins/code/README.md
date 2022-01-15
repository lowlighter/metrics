### ♐ Code snippet of the day

> ⚠️ When improperly configured, this plugin could display private code. If you work with sensitive data or company code, it is advised to keep this plugin disabled. *Metrics* and its authors cannot be held responsible for any resulting code leaks, use at your own risk.

Display a random code snippet from your recent activity history.

<table>
  <td align="center">
    <img src="https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.code.svg">
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
    <td nowrap="nowrap"><code>plugin_code</code></td>
    <td rowspan="2">Display a random code snippet from recent activity<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_code_lines</code></td>
    <td rowspan="2">Maximum number of line that a code snippet can contain<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>number</code>
<br>
<b>default:</b> 12<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_code_load</code></td>
    <td rowspan="2">Number of events to load<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>number</code>
<i>(100 ≤
𝑥
≤ 1000)</i>
<br>
<b>default:</b> 100<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_code_visibility</code></td>
    <td rowspan="2">Set events visibility<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>string</code>
<br>
<b>default:</b> public<br>
<b>allowed values:</b><ul><li>public</li><li>all</li></ul></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_code_skipped</code></td>
    <td rowspan="2">Repositories to skip<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">⏩ Inherits <code>repositories_skipped</code><br>
<b>type:</b> <code>array</code>
<i>(comma-separated)</i>
<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_code_languages</code></td>
    <td rowspan="2">Restrict code snippet languages<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>array</code>
<i>(comma-separated)</i>
<br></td>
  </tr>
</table>
<!--/options-->

*[→ Full specification](metadata.yml)*

#### ℹ️ Examples workflows

<!--examples-->
```yaml
name: JavaScript or TypeScript snippet of the day
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.code.svg
  token: ${{ secrets.METRICS_TOKEN }}
  base: ''
  plugin_code: 'yes'
  plugin_code_languages: javascript, typescript
  plugin_code_load: 400

```
<!--/examples-->