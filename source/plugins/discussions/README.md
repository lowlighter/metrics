### 💬 Discussions

The *discussions* plugin displays your GitHub discussions metrics.

<table>
  <td align="center">
    <img src="https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.discussions.svg">
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
    <td nowrap="nowrap"><code>plugin_discussions</code></td>
    <td rowspan="2"><p>GitHub discussions metrics</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_discussions_categories</code></td>
    <td rowspan="2"><p>Display discussion categories</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">✨ On <code>master</code>/<code>main</code><br>
<b>type:</b> <code>boolean</code>
<br>
<b>default:</b> yes<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_discussions_categories_limit</code></td>
    <td rowspan="2"><p>Number of discussion categories to display</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">✨ On <code>master</code>/<code>main</code><br>
<b>type:</b> <code>number</code>
<br>
<b>default:</b> 0<br></td>
  </tr>
</table>
<!--/options-->

*[→ Full specification](metadata.yml)*

#### ℹ️ Examples workflows

<!--examples-->
```yaml
name: GitHub Discussions
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.discussions.svg
  token: ${{ secrets.METRICS_TOKEN }}
  base: ''
  plugin_discussions: 'yes'
  plugin_discussions_categories_limit: 8

```
<!--/examples-->