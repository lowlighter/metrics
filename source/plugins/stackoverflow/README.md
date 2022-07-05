<!--header-->
<table>
  <tr><td colspan="2"><a href="/README.md#-plugins">← Back to plugins index</a></td></tr>
  <tr><th colspan="2"><h3>🗨️ Stack Overflow</h3></th></tr>
  <tr><td colspan="2" align="center"><p>This plugin displays stats, questions and answer from <a href="https://stackoverflow.com/">Stack Overflow</a>.</p>
</td></tr>
  <tr>
    <th rowspan="3">Supported features<br><sub><a href="metadata.yml">→ Full specification</a></sub></th>
    <td><a href="/source/templates/classic/README.md"><code>📗 Classic template</code></a></td>
  </tr>
  <tr>
    <td><code>👤 Users</code> <code>👥 Organizations</code></td>
  </tr>
  <tr>
    <td><i>No tokens are required for this plugin</i></td>
  </tr>
  <tr>
    <td colspan="2" align="center">
      <img src="https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.stackoverflow.svg" alt=""></img>
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
    <td nowrap="nowrap"><h4><code>plugin_stackoverflow</code></h4></td>
    <td rowspan="2"><p>Enable stackoverflow plugin</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_stackoverflow_user</code></h4></td>
    <td rowspan="2"><p>Stackoverflow user id</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">⏯️ Cannot be preset<br>
<b>type:</b> <code>number</code>
<br>
<b>default:</b> 0<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_stackoverflow_sections</code></h4></td>
    <td rowspan="2"><p>Displayed sections</p>
<ul>
<li><code>answers-top</code>: display most popular answers</li>
<li><code>answers-recent</code>: display recent answers</li>
<li><code>questions-top</code>: display most popular questions</li>
<li><code>questions-recent</code>: display recent questions</li>
</ul>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>array</code>
<i>(comma-separated)</i>
<br>
<b>default:</b> answers-top, questions-recent<br>
<b>allowed values:</b><ul><li>answers-top</li><li>answers-recent</li><li>questions-top</li><li>questions-recent</li></ul></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_stackoverflow_limit</code></h4></td>
    <td rowspan="2"><p>Display limit (entries per section)</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>number</code>
<i>(1 ≤
𝑥
≤ 30)</i>
<br>
<b>default:</b> 2<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_stackoverflow_lines</code></h4></td>
    <td rowspan="2"><p>Display limit (lines per questions and answers)</p>
<p>Code snippets count as a single line and must be configured with <a href="/source/plugins/stackoverflow/README.md#plugin_stackoverflow_lines_snippet"><code>plugin_stackoverflow_lines_snippet</code></a> instead</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>number</code>
<i>(0 ≤
𝑥)</i>
<br>
<b>zero behaviour:</b> disable</br>
<b>default:</b> 4<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_stackoverflow_lines_snippet</code></h4></td>
    <td rowspan="2"><p>Display limit (lines per code snippets)</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>number</code>
<i>(0 ≤
𝑥)</i>
<br>
<b>zero behaviour:</b> disable</br>
<b>default:</b> 2<br></td>
  </tr>
</table>
<!--/options-->

## ℹ️ Examples workflows

<!--examples-->
```yaml
name: Top answers from stackoverflow
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.stackoverflow.svg
  token: NOT_NEEDED
  base: ""
  plugin_stackoverflow: yes
  plugin_stackoverflow_user: 1
  plugin_stackoverflow_sections: answers-top
  plugin_stackoverflow_limit: 2

```
<!--/examples-->
