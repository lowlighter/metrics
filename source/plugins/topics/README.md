<!--header-->
<table>
  <tr><td colspan="2"><a href="/README.md#-plugins">← Back to plugins index</a></td></tr>
  <tr><th colspan="2"><h3>📌 Starred topics</h3></th></tr>
  <tr><td colspan="2" align="center"><p>This plugin displays <a href="https://github.com/stars?filter=topics">starred topics</a>.
Check out <a href="https://github.com/topics">GitHub topics</a> to search interesting topics.</p>
</td></tr>
  <tr>
    <th rowspan="3">Supported features<br><sub><a href="metadata.yml">→ Full specification</a></sub></th>
    <td><a href="/source/templates/classic/README.md"><code>📗 Classic template</code></a> <a href="/source/templates/markdown/README.md"><code>📒 Markdown template</code></a></td>
  </tr>
  <tr>
    <td><code>👤 Users</code></td>
  </tr>
  <tr>
    <td><i>No tokens are required for this plugin</i></td>
  </tr>
  <tr>
    <td colspan="2" align="center">
      <details open><summary>With icons</summary><img src="https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.topics.icons.svg" alt=""></img></details>
      <details open><summary>With labels</summary><img src="https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.topics.svg" alt=""></img></details>
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
    <td nowrap="nowrap"><h4><code>plugin_topics</code></h4></td>
    <td rowspan="2"><p>Enable topics plugin</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_topics_mode</code></h4></td>
    <td rowspan="2"><p>Display mode:</p>
<ul>
<li><code>labels</code>: display labels</li>
<li><code>icons</code>: display icons <em>(topics without icons will be ignored)</em></li>
<li><code>starred</code>: alias for <code>labels</code></li>
<li><code>mastered</code>: alias for <code>icons</code></li>
</ul>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>string</code>
<br>
<b>default:</b> starred<br>
<b>allowed values:</b><ul><li>labels</li><li>icons</li><li>starred</li><li>mastered</li></ul></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_topics_sort</code></h4></td>
    <td rowspan="2"><p>Sorting method:</p>
<ul>
<li><code>stars</code>: sort by most stars</li>
<li><code>activity</code>: sort by recent activity</li>
<li><code>starred</code>: sort by the date you starred them</li>
<li><code>random</code>: sort topics randomly</li>
</ul>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>string</code>
<br>
<b>default:</b> stars<br>
<b>allowed values:</b><ul><li>stars</li><li>activity</li><li>starred</li><li>random</li></ul></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_topics_limit</code></h4></td>
    <td rowspan="2"><p>Display limit</p>
<p>When using <code>plugin_topics_mode: labels</code>, an ellipsis will be displayed</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>number</code>
<i>(0 ≤
𝑥
≤ 20)</i>
<br>
<b>zero behaviour:</b> disable</br>
<b>default:</b> 15<br></td>
  </tr>
</table>
<!--/options-->

## ℹ️ Examples workflows

<!--examples-->
```yaml
name: Labels
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.topics.svg
  token: NOT_NEEDED
  base: ""
  plugin_topics: yes
  plugin_topics_limit: 12

```
```yaml
name: Icons
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.topics.icons.svg
  token: NOT_NEEDED
  base: ""
  plugin_topics: yes
  plugin_topics_limit: 0
  plugin_topics_mode: icons

```
<!--/examples-->
