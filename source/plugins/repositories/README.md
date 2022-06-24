<!--header-->
<table>
  <tr><td colspan="2"><a href="/README.md#-plugins">← Back to plugins index</a></td></tr>
  <tr><th colspan="2"><h3>📓 Repositories</h3></th></tr>
  <tr><td colspan="2" align="center"><p>This plugin displays a list of chosen featured repositories.</p>
<p>It is mostly intended for images that will be used outside of GitHub, since it is already possible to <a href="https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-github-profile/customizing-your-profile/pinning-items-to-your-profile">pin repositories</a> on GitHub.</p>
<blockquote>
<p>⚠️ People will not be able to click on it due to limitations of using SVG inside <code>&lt;img&gt;</code> tags.</p>
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
    <td><code>🔑 (scopeless)</code> <code>read:org (optional)</code> <code>read:user (optional)</code> <code>read:packages (optional)</code> <code>repo (optional)</code></td>
  </tr>
  <tr>
    <td colspan="2" align="center">
      <details open><summary>Featured</summary><img src="https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.repositories.svg" alt=""></img></details>
      <details><summary>Pinned</summary><img src="https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.repositories.pinned.svg" alt=""></img></details>
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
    <td nowrap="nowrap"><h4><code>plugin_repositories</code></h4></td>
    <td rowspan="2"><p>Enable repositories plugin</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_repositories_featured</code></h4></td>
    <td rowspan="2"><p>List of featured repositories</p>
<p>If no owner is specified, it will implicitly use the current account login</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">⏯️ Cannot be preset<br>
<b>type:</b> <code>array</code>
<i>(comma-separated)</i>
<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_repositories_pinned</code></h4></td>
    <td rowspan="2"><p>Display pinned repositories</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">✨ On <code>master</code>/<code>main</code><br>
<b>type:</b> <code>number</code>
<i>(0 ≤
𝑥
≤ 6)</i>
<br>
<b>default:</b> 0<br></td>
  </tr>
</table>
<!--/options-->

## ℹ️ Examples workflows

<!--examples-->
```yaml
name: Featured repositories
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.repositories.svg
  token: ${{ secrets.METRICS_TOKEN }}
  base: ""
  plugin_repositories: yes
  plugin_repositories_featured: lowlighter/metrics

```
```yaml
name: Pinned repositories
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.repositories.pinned.svg
  token: ${{ secrets.METRICS_TOKEN }}
  base: ""
  plugin_repositories: yes
  plugin_repositories_pinned: 2

```
<!--/examples-->
