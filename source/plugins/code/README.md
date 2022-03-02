<!--header-->
<table>
  <tr><th colspan="2"><h3>♐ Code snippet of the day</h3></th></tr>
  <tr><td colspan="2" align="center"><p>This plugin displays a random code snippet from your recent activity history.</p>
<blockquote>
<p>⚠️ When improperly configured, this plugin could display private code.
If you work with sensitive data or company code, it is advised to keep this plugin disabled.
Use at your own risk, <em>metrics</em> and its authors cannot be held responsible for any resulting code leaks.</p>
</blockquote>
</td></tr>
  <tr>
    <th rowspan="3">Supported features<br><sub><a href="metadata.yml">→ Full specification</a></sub></th>
    <td><a href="/source/templates/classic/README.md"><code>📗 Classic template</code></a></td>
  </tr>
  <tr>
    <td><code>👤 Users</code> <code>👥 Organizations</code></td>
  </tr>
  <tr>
    <td><code>🔑 (scopeless)</code> <code>read:org (optional)</code> <code>read:user (optional)</code> <code>repo (optional)</code></td>
  </tr>
  <tr>
    <td colspan="2" align="center">
      <img src="https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.code.svg" alt=""></img>
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
    <td nowrap="nowrap"><h4><code>plugin_code</code></h4></td>
    <td rowspan="2"><p>Enable code plugin</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_code_lines</code></h4></td>
    <td rowspan="2"><p>Display limit for code snippets</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>number</code>
<br>
<b>default:</b> 12<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_code_load</code></h4></td>
    <td rowspan="2"><p>Events to load</p>
<img width="900" height="1" alt=""></td>
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
    <td nowrap="nowrap"><h4><code>plugin_code_days</code></h4></td>
    <td rowspan="2"><p>Events maximum age</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>number</code>
<i>(0 ≤
𝑥
≤ 365)</i>
<br>
<b>zero behaviour:</b> disable</br>
<b>default:</b> 3<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_code_visibility</code></h4></td>
    <td rowspan="2"><p>Events visibility</p>
<p>Lets you hide private activity when using a <code>repo</code> scope token</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>string</code>
<br>
<b>default:</b> public<br>
<b>allowed values:</b><ul><li>public</li><li>all</li></ul></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_code_skipped</code></h4></td>
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
    <td nowrap="nowrap"><h4><code>plugin_code_languages</code></h4></td>
    <td rowspan="2"><p>Restrict display to specific languages</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>array</code>
<i>(comma-separated)</i>
<br></td>
  </tr>
</table>
<!--/options-->

## ℹ️ Examples workflows

<!--examples-->
```yaml
name: JavaScript or TypeScript snippet of the day
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.code.svg
  token: ${{ secrets.METRICS_TOKEN }}
  base: ""
  plugin_code: yes
  plugin_code_languages: javascript, typescript
  plugin_code_load: 400

```
<!--/examples-->
