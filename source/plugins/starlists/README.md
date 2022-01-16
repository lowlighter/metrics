<!--header-->
<table>
  <tr><th colspan="2"><h3>💫 Starlists</h3></th></tr>
  <tr><td colspan="2" align="center"><p>This plugin displays your star lists.</p>
</td></tr>
  <tr>
    <th rowspan="3">Supported features<br><sub><a href="metadata.yml">→ Full specification</a></sub></th>
    <td><a href="/source/templates/classic"><code>📗 Classic template</code></a></td>
  </tr>
  <tr>
    <td><code>👤 Users</code></td>
  </tr>
  <tr>
    <td><i>No tokens are required for this plugin</i></td>
  </tr>
  <tr>
    <td colspan="2" align="center">
      <img src="https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.starlists.svg" alt=""></img>
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
    <td nowrap="nowrap"><code>plugin_starlists</code></td>
    <td rowspan="2"><p>Enable starlists plugin</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">✨ On <code>master</code>/<code>main</code><br>
<b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_starlists_limit</code></td>
    <td rowspan="2"><p>Display limit (star lists)</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">✨ On <code>master</code>/<code>main</code><br>
<b>type:</b> <code>number</code>
<i>(1 ≤
𝑥
≤ 100)</i>
<br>
<b>default:</b> 2<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_starlists_limit_repositories</code></td>
    <td rowspan="2"><p>Display limit (repositories per star list)</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">✨ On <code>master</code>/<code>main</code><br>
<b>type:</b> <code>number</code>
<i>(0 ≤
𝑥
≤ 100)</i>
<br>
<b>default:</b> 2<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_starlists_shuffle_repositories</code></td>
    <td rowspan="2"><p>Shuffle data for varied outputs</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">✨ On <code>master</code>/<code>main</code><br>
<b>type:</b> <code>boolean</code>
<br>
<b>default:</b> yes<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_starlists_ignored</code></td>
    <td rowspan="2"><p>Skipped star lists (case insensitive)</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">✨ On <code>master</code>/<code>main</code><br>
<b>type:</b> <code>array</code>
<i>(comma-separated)</i>
<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_starlists_only</code></td>
    <td rowspan="2"><p>Restrict display to specified star lists (case insensitive)</p>
<p>This option is equivalent to <code>plugin_starlists_ignored</code> with all star lists but the ones listed in this option</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">✨ On <code>master</code>/<code>main</code><br>
<b>type:</b> <code>array</code>
<i>(comma-separated)</i>
<br></td>
  </tr>
</table>
<!--/options-->

## ℹ️ Examples workflows

<!--examples-->
```yaml
name: Featured star list
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.starlists.svg
  token: ${{ secrets.METRICS_TOKEN }}
  base: ""
  plugin_starlists: yes
  plugin_starlists_limit_repositories: 2
  plugin_starlists_only: 🤘 TC39

```
<!--/examples-->
