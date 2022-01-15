### 🗨️ Stackoverflow plugin

The *stackoverflow* plugin lets you display your metrics, questions and answer from [stackoverflow](https://stackoverflow.com/).

<table>
  <td align="center">
    <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.stackoverflow.svg">
    <img width="900" height="1" alt="">
  </td>
</table>

<details>
<summary>💬 Get your user id</summary>

Go to [stackoverflow.com](https://stackoverflow.com/) and click on your account profile.

Your user id will be in both url and search bar.

![User id](/.github/readme/imgs/plugin_stackoverflow_user_id.png)

</details>

#### ➡️ Available options

<!--options-->
<table>
  <tr>
    <td align="center" nowrap="nowrap">Type</i></td><td align="center" nowrap="nowrap">Description</td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_stackoverflow</code></td>
    <td rowspan="2">Stackoverflow metrics<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_stackoverflow_user</code></td>
    <td rowspan="2">Stackoverflow user id<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>number</code>
<br>
<b>default:</b> 0<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_stackoverflow_sections</code></td>
    <td rowspan="2">Sections to display<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>array</code>
<i>(comma-separated)</i>
<br>
<b>default:</b> answers-top, questions-recent<br>
<b>allowed values:</b><ul><li>answers-top</li><li>answers-recent</li><li>questions-top</li><li>questions-recent</li></ul></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_stackoverflow_limit</code></td>
    <td rowspan="2">Maximum number of entries to display per section<img width="900" height="1" alt=""></td>
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
    <td nowrap="nowrap"><code>plugin_stackoverflow_lines</code></td>
    <td rowspan="2">Maximum number of lines to display per question or answer<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>number</code>
<i>(0 ≤
𝑥)</i>
<br>
<b>default:</b> 4<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_stackoverflow_lines_snippet</code></td>
    <td rowspan="2">Maximum number of lines to display per code snippet<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>number</code>
<i>(0 ≤
𝑥)</i>
<br>
<b>default:</b> 2<br></td>
  </tr>
</table>
<!--/options-->

*[→ Full specification](metadata.yml)*

#### ℹ️ Examples workflows

<!--examples-->
```yaml
name: Top answers from stackoverflow
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.stackoverflow.svg
  token: ${{ secrets.METRICS_TOKEN }}
  base: ''
  plugin_stackoverflow: 'yes'
  plugin_stackoverflow_user: 1
  plugin_stackoverflow_sections: answers-top
  plugin_stackoverflow_limit: 2

```
<!--/examples-->