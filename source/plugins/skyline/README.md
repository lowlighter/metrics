### 🌇 GitHub Skyline 3D calendar

> ⚠️ This plugin significantly increase file size, prefer using it as standalone.

The *skyline* plugin lets you display your 3D commits calendar from [skyline.github.com](https://skyline.github.com/).

<table>
  <td align="center">
    <img src="https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.skyline.svg">
    <img width="900" height="1" alt="">
  </td>
</table>

This uses puppeteer to generate collect image frames, and use CSS animations to create an animated rendering (GIF images are not animated in GitHub flavored markdown rendering which is why this design choice was made).

#### ➡️ Available options

<!--options-->
<table>
  <tr>
    <td align="center" nowrap="nowrap">Type</i></td><td align="center" nowrap="nowrap">Description</td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_skyline</code></td>
    <td rowspan="2"><p>Display GitHub Skyline 3D calendar</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_skyline_year</code></td>
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
    <td nowrap="nowrap"><code>plugin_skyline_frames</code></td>
    <td rowspan="2"><p>Number of frames</p>
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
    <td nowrap="nowrap"><code>plugin_skyline_quality</code></td>
    <td rowspan="2"><p>Image quality</p>
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
    <td nowrap="nowrap"><code>plugin_skyline_compatibility</code></td>
    <td rowspan="2"><p>Compatibility mode</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
</table>
<!--/options-->

*[→ Full specification](metadata.yml)*

#### ℹ️ Examples workflows

<!--examples-->
```yaml
name: GitHub Skyline
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.skyline.svg
  token: NOT_NEEDED
  base: ''
  plugin_skyline: 'yes'
  plugin_skyline_year: 2020
  plugin_skyline_frames: 6
  plugin_skyline_quality: 1

```
<!--/examples-->