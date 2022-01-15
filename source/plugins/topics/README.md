### 📌 Starred topics

The *topics* plugin displays your [starred topics](https://github.com/stars?filter=topics).
Check out [GitHub topics](https://github.com/topics) to search interesting topics.

<table>
  <td align="center">
    <details open><summary>With icons</summary>
      <img src="https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.topics.icons.svg">
    </details>
    <details open><summary>With labels</summary>
      <img src="https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.topics.svg">
    </details>
    <img width="900" height="1" alt="">
  </td>
</table>

This uses puppeteer to navigate through your starred topics page.

#### ➡️ Available options

<!--options-->
<table>
  <tr>
    <td align="center" nowrap="nowrap">Type</i></td><td align="center" nowrap="nowrap">Description</td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_topics</code></td>
    <td rowspan="2">Display starred topics<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_topics_mode</code></td>
    <td rowspan="2">Plugin mode<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>string</code>
<br>
<b>default:</b> starred<br>
<b>allowed values:</b><ul><li>starred</li><li>icons</li><li>mastered</li></ul></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_topics_sort</code></td>
    <td rowspan="2">Sorting method of starred topics<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>string</code>
<br>
<b>default:</b> stars<br>
<b>allowed values:</b><ul><li>stars</li><li>activity</li><li>starred</li><li>random</li></ul></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_topics_limit</code></td>
    <td rowspan="2">Maximum number of topics to display<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>number</code>
<i>(0 ≤
𝑥
≤ 20)</i>
<br>
<b>default:</b> 15<br></td>
  </tr>
</table>
<!--/options-->

*[→ Full specification](metadata.yml)*

#### ℹ️ Examples workflows

<!--examples-->
```yaml
name: Labels
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.topics.svg
  token: ${{ secrets.METRICS_TOKEN }}
  base: ''
  plugin_topics: 'yes'
  plugin_topics_limit: 12

```
```yaml
name: Icons
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.topics.icons.svg
  token: ${{ secrets.METRICS_TOKEN }}
  base: ''
  plugin_topics: 'yes'
  plugin_topics_limit: 0
  plugin_topics_mode: icons

```
<!--/examples-->