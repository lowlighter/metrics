### ✒️ Recent posts

The recent *posts* plugin displays recent articles you wrote on an external source, like [dev.to](https://dev.to).

<table>
  <td align="center">
    <details open><summary>Latest posts</summary>
      <img src="https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.posts.svg">
    </details>
    <details><summary>Latest posts width description and cover image</summary>
      <img src="https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.posts.full.svg">
    </details>
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
    <td nowrap="nowrap"><code>plugin_posts</code></td>
    <td rowspan="2">Display recent posts<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_posts_source</code></td>
    <td rowspan="2">Posts external source<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>string</code>
<br>
<b>allowed values:</b><ul><li>dev.to</li><li>hashnode</li></ul></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_posts_descriptions</code></td>
    <td rowspan="2">Display posts descriptions<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_posts_covers</code></td>
    <td rowspan="2">Display posts cover images<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_posts_limit</code></td>
    <td rowspan="2">Maximum number of posts to display<img width="900" height="1" alt=""></td>
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
    <td nowrap="nowrap"><code>plugin_posts_user</code></td>
    <td rowspan="2">Posts external source username<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>string</code>
<br>
<b>default:</b> <code>→ User login</code><br></td>
  </tr>
</table>
<!--/options-->

*[→ Full specification](metadata.yml)*

#### ℹ️ Examples workflows

<!--examples-->
```yaml
name: Recent posts
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.posts.svg
  token: ${{ secrets.METRICS_TOKEN }}
  base: ''
  plugin_posts: 'yes'
  plugin_posts_source: dev.to

```
```yaml
name: Recent posts with descriptions and cover images
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.posts.full.svg
  token: ${{ secrets.METRICS_TOKEN }}
  base: ''
  plugin_posts: 'yes'
  plugin_posts_source: dev.to
  plugin_posts_descriptions: 'yes'
  plugin_posts_covers: 'yes'

```
<!--/examples-->