### 💫 Starlists

The *starlists* plugin displays your recently star lists.

<table>
  <td align="center">
    <img src="https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.starlists.svg">
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
    <td nowrap="nowrap"><code>plugin_starlists</code></td>
    <td rowspan="2"><p>Display star lists</p>
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
    <td rowspan="2"><p>Number of star lists to display</p>
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
    <td rowspan="2"><p>Number of repositories to display per star lists</p>
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
    <td rowspan="2"><p>Shuffle displayed repositories</p>
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
    <td rowspan="2"><p>Star lists to skip</p>
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
    <td rowspan="2"><p>Star lists to display</p>
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

*[→ Full specification](metadata.yml)*

#### ℹ️ Examples workflows

<!--examples-->
```yaml
name: Featured star list
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.starlists.svg
  token: ${{ secrets.METRICS_TOKEN }}
  base: ''
  plugin_starlists: 'yes'
  plugin_starlists_limit_repositories: 2
  plugin_starlists_only: 🤘 TC39

```
<!--/examples-->