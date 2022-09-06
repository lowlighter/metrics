<!--header-->
<table>
  <tr><td colspan="2"><a href="/README.md#-plugins">← Back to plugins index</a></td></tr>
  <tr><th colspan="2"><h3>🗳️ Leetcode</h3></th></tr>
  <tr><td colspan="2" align="center"><p>This plugin displays statistics from a <a href="https://leetcode.com">LeetCode</a> account.</p>
</td></tr>
  <tr><th>⚠️ Disclaimer</th><td><p>This plugin is not affiliated, associated, authorized, endorsed by, or in any way officially connected with <a href="https://leetcode.com">LeetCode</a>.
All product and company names are trademarks™ or registered® trademarks of their respective holders.</p>
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
      <img src="https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.leetcode.svg" alt=""></img>
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
    <td nowrap="nowrap"><h4><code>plugin_leetcode</code></h4></td>
    <td rowspan="2"><p>Enable leetcode plugin</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">✨ On <code>master</code>/<code>main</code><br>
<b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_leetcode_user</code></h4></td>
    <td rowspan="2"><p>LeetCode login</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">⏯️ Cannot be preset<br>
✨ On <code>master</code>/<code>main</code><br>
<b>type:</b> <code>string</code>
<br>
<b>default:</b> <code>→ User login</code><br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_leetcode_sections</code></h4></td>
    <td rowspan="2"><p>Displayed sections</p>
<ul>
<li><code>solved</code> will display solved problems scores</li>
<li><code>skills</code> will display solved problems tagged skills</li>
<li><code>recent</code> will display recent submissions</li>
</ul>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">✨ On <code>master</code>/<code>main</code><br>
<b>type:</b> <code>array</code>
<i>(comma-separated)</i>
<br>
<b>default:</b> solved<br>
<b>allowed values:</b><ul><li>solved</li><li>skills</li><li>recent</li></ul></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_leetcode_limit_skills</code></h4></td>
    <td rowspan="2"><p>Display limit (skills)</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">✨ On <code>master</code>/<code>main</code><br>
<b>type:</b> <code>number</code>
<i>(0 ≤
𝑥)</i>
<br>
<b>zero behaviour:</b> disable</br>
<b>default:</b> 10<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_leetcode_limit_recent</code></h4></td>
    <td rowspan="2"><p>Display limit (recent)</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">✨ On <code>master</code>/<code>main</code><br>
<b>type:</b> <code>number</code>
<i>(1 ≤
𝑥
≤ 15)</i>
<br>
<b>default:</b> 2<br></td>
  </tr>
</table>
<!--/options-->

## ℹ️ Examples workflows

<!--examples-->
```yaml
name: LeetCode
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.leetcode.svg
  token: NOT_NEEDED
  base: ""
  plugin_leetcode: yes
  plugin_leetcode_sections: solved, skills, recent

```
<!--/examples-->
