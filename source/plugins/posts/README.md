<!--header-->
<table>
  <tr><td colspan="2"><a href="/README.md#-plugins">← Back to plugins index</a></td></tr>
  <tr><th colspan="2"><h3>✒️ Recent posts</h3></th></tr>
  <tr><td colspan="2" align="center"><p>This plugin displays recent articles from a specified external source.</p>
</td></tr>
  <tr>
    <th rowspan="3">Supported features<br><sub><a href="metadata.yml">→ Full specification</a></sub></th>
    <td><a href="/source/templates/classic/README.md"><code>📗 Classic template</code></a> <a href="/source/templates/markdown/README.md"><code>📒 Markdown template</code></a> <a href="/source/templates/repository/README.md"><code>📘 Repository template</code></a></td>
  </tr>
  <tr>
    <td><code>👤 Users</code> <code>👥 Organizations</code> <code>📓 Repositories</code></td>
  </tr>
  <tr>
    <td><i>No tokens are required for this plugin</i></td>
  </tr>
  <tr>
    <td colspan="2" align="center">
      <details open><summary>Latest posts width description and cover image</summary><img src="https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.posts.full.svg" alt=""></img></details>
      <details><summary>Latest posts</summary><img src="https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.posts.svg" alt=""></img></details>
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
    <td nowrap="nowrap"><h4><code>plugin_posts</code></h4></td>
    <td rowspan="2"><p>Enable posts plugin</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_posts_source</code></h4></td>
    <td rowspan="2"><p>External source</p>
<ul>
<li><code>dev.to</code>: <a href="https://dev.to">dev.to</a></li>
<li><code>hashnode</code>: <a href="https://hashnode.com">hashnode.com</a></li>
</ul>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>string</code>
<br>
<b>allowed values:</b><ul><li>dev.to</li><li>hashnode</li></ul></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_posts_descriptions</code></h4></td>
    <td rowspan="2"><p>Toggle posts descriptions display</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_posts_covers</code></h4></td>
    <td rowspan="2"><p>Toggle posts cover images display</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_posts_limit</code></h4></td>
    <td rowspan="2"><p>Display limit</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>number</code>
<i>(1 ≤
𝑥
≤ 30)</i>
<br>
<b>default:</b> 4<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_posts_user</code></h4></td>
    <td rowspan="2"><p>External source username</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">⏯️ Cannot be preset<br>
<b>type:</b> <code>string</code>
<br>
<b>default:</b> <code>→ User login</code><br></td>
  </tr>
</table>
<!--/options-->

## ℹ️ Examples workflows

<!--examples-->
```yaml
name: Recent posts
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.posts.svg
  token: NOT_NEEDED
  base: ""
  plugin_posts: yes
  plugin_posts_source: dev.to

```
```yaml
name: Recent posts with descriptions and cover images
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.posts.full.svg
  token: NOT_NEEDED
  base: ""
  plugin_posts: yes
  plugin_posts_source: dev.to
  plugin_posts_limit: 2
  plugin_posts_descriptions: yes
  plugin_posts_covers: yes

```
<!--/examples-->
