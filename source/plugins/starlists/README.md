<!--header-->
<table>
  <tr><td colspan="2"><a href="/README.md#-plugins">← Back to plugins index</a></td></tr>
  <tr><th colspan="2"><h3>💫 Star lists</h3></th></tr>
  <tr><td colspan="2" align="center"><p>This plugin displays star lists.</p>
</td></tr>
  <tr>
    <th rowspan="3">Supported features<br><sub><a href="metadata.yml">→ Full specification</a></sub></th>
    <td><a href="/source/templates/classic/README.md"><code>📗 Classic template</code></a></td>
  </tr>
  <tr>
    <td><code>👤 Users</code></td>
  </tr>
  <tr>
    <td><i>No tokens are required for this plugin</i></td>
  </tr>
  <tr>
    <td colspan="2" align="center">
      <details open><summary>Repositories from star lists</summary><img src="https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.starlists.svg" alt=""></img></details>
      <details open><summary>Languages from star lists</summary><img src="https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.starlists.languages.svg" alt=""></img></details>
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
    <td nowrap="nowrap"><h4><code>plugin_starlists</code></h4></td>
    <td rowspan="2"><p>Enable starlists plugin</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">🌐 Web instances must configure <code>settings.json</code>:
<ul>
<li><i>metrics.run.puppeteer.scrapping</i></li>
</ul>
<b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_starlists_limit</code></h4></td>
    <td rowspan="2"><p>Display limit (star lists)</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>number</code>
<i>(1 ≤
𝑥
≤ 100)</i>
<br>
<b>default:</b> 2<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_starlists_limit_repositories</code></h4></td>
    <td rowspan="2"><p>Display limit (repositories per star list)</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>number</code>
<i>(0 ≤
𝑥
≤ 100)</i>
<br>
<b>default:</b> 2<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_starlists_languages</code></h4></td>
    <td rowspan="2"><p>Star lists languages statistics</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_starlists_limit_languages</code></h4></td>
    <td rowspan="2"><p>Display limit (languages per star list)</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>number</code>
<i>(0 ≤
𝑥)</i>
<br>
<b>zero behaviour:</b> disable</br>
<b>default:</b> 8<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_starlists_shuffle_repositories</code></h4></td>
    <td rowspan="2"><p>Shuffle data</p>
<p>Can be used to create varied outputs</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> yes<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_starlists_ignored</code></h4></td>
    <td rowspan="2"><p>Skipped star lists</p>
<p>Case and emojis insensitive</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>array</code>
<i>(comma-separated)</i>
<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_starlists_only</code></h4></td>
    <td rowspan="2"><p>Showcased star lists</p>
<p>Case and emojis insensitive.</p>
<p>Equivalent to <a href="/source/plugins/starlists/README.md#plugin_starlists_ignored"><code>plugin_starlists_ignored</code></a> with all star lists except the ones listed in this option</p>
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
name: Featured star list
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.starlists.svg
  token: NOT_NEEDED
  base: ""
  plugin_starlists: yes
  plugin_starlists_limit_repositories: 2
  plugin_starlists_only: TC39

```
```yaml
name: Featured star list languages
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.starlists.languages.svg
  token: NOT_NEEDED
  base: ""
  plugin_starlists: yes
  plugin_starlists_languages: yes
  plugin_starlists_limit_languages: 8
  plugin_starlists_limit_repositories: 0
  plugin_starlists_only: Awesome

```
<!--/examples-->
