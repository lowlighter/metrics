### 🌇 GitHub Skyline 3D calendar

> ⚠️ This plugin significantly increase file size, prefer using it as standalone.

The *skyline* plugin lets you display your 3D commits calendar from [skyline.github.com](https://skyline.github.com/).

<table>
  <td align="center">
    <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.skyline.svg">
    <img width="900" height="1" alt="">
  </td>
</table>

This uses puppeteer to generate collect image frames, and use CSS animations to create an animated rendering (GIF images are not animated in GitHub flavored markdown rendering which is why this design choice was made).

#### ➡️ Available options

<!--options-->
| Option | Type *(format)* **[default]** *{allowed values}* | Description |
| ------ | -------------------------------- | ----------- |
| `plugin_skyline` | `boolean` **[no]** | Display GitHub Skyline 3D calendar |
| `plugin_skyline_year` | `number` **[current-year]** *{2008 ≤ 𝑥}* | Displayed year |
| `plugin_skyline_frames` | `number` **[60]** *{1 ≤ 𝑥 ≤ 120}* | Number of frames |
| `plugin_skyline_quality` | `number` **[0.5]** *{0.1 ≤ 𝑥 ≤ 1}* | Image quality |
| `plugin_skyline_compatibility` | `boolean` **[no]** | Compatibility mode |


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
  plugin_skyline: 'yes'
  plugin_skyline_year: 2020
  plugin_skyline_frames: 6
  plugin_skyline_quality: 1

```
<!--/examples-->