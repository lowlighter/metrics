### 🗼 Rss feed

The *rss* plugin displays items from a specified RSS feed.

<table>
  <td align="center">
    <img src="https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.rss.svg">
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
    <td nowrap="nowrap"><code>plugin_rss</code></td>
    <td rowspan="2"><p>Display RSS feed</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_rss_source</code></td>
    <td rowspan="2"><p>RSS feed source</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>string</code>
<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_rss_limit</code></td>
    <td rowspan="2"><p>Maximum number of items to display</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>number</code>
<i>(0 ≤
𝑥
≤ 30)</i>
<br>
<b>default:</b> 4<br></td>
  </tr>
</table>
<!--/options-->

*[→ Full specification](metadata.yml)*

#### ℹ️ Examples workflows

<!--examples-->
```yaml
name: News from hackernews
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.rss.svg
  token: NOT_NEEDED
  base: ''
  plugin_rss: 'yes'
  plugin_rss_source: https://news.ycombinator.com/rss
  plugin_rss_limit: 4

```
<!--/examples-->