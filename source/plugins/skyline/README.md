<!--header-->
<table>
  <tr><td colspan="2"><a href="/README.md#-plugins">← Back to plugins index</a></td></tr>
  <tr><th colspan="2"><h3>🌇 GitHub Skyline 3D calendar</h3></th></tr>
  <tr><td colspan="2" align="center"><p>This plugins lets you display your 3D commits calendar from <a href="https://skyline.github.com/">skyline.github.com</a>.</p>
<blockquote>
<p>⚠️ This plugin significantly increase file size, consider using it as standalone.</p>
</blockquote>
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
      <img src="https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.skyline.svg" alt=""></img>
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
    <td nowrap="nowrap"><h4><code>plugin_skyline</code></h4></td>
    <td rowspan="2"><p>Enable skyline plugin</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_skyline_year</code></h4></td>
    <td rowspan="2"><p>Displayed year</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>number</code>
<i>(2008 ≤
𝑥)</i>
<br>
<b>default:</b> current-year<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_skyline_frames</code></h4></td>
    <td rowspan="2"><p>Frames count</p>
<p>Use 120 for a full-loop and 60 for a half-loop.
A higher number of frames will increase file size.</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>number</code>
<i>(1 ≤
𝑥
≤ 120)</i>
<br>
<b>default:</b> 60<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_skyline_quality</code></h4></td>
    <td rowspan="2"><p>Image quality</p>
<p>A higher image quality will increase file size.</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>number</code>
<i>(0.1 ≤
𝑥
≤ 1)</i>
<br>
<b>default:</b> 0.5<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_skyline_compatibility</code></h4></td>
    <td rowspan="2"><p>Compatibility mode</p>
<p>This uses CSS animations rather than embedded GIF to support a widerr range of browser, like Firefox and Safari.
Using this mode significantly increase file size as each frame is encoded separately</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
</table>
<!--/options-->

## ℹ️ Examples workflows

<!--examples-->
```yaml
name: GitHub Skyline
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.skyline.svg
  token: NOT_NEEDED
  base: ""
  plugin_skyline: yes
  plugin_skyline_year: 2020
  plugin_skyline_frames: 6
  plugin_skyline_quality: 1

```
<!--/examples-->
