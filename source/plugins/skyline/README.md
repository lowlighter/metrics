### 🌇 GitHub Skyline 3D calendar

    ⚠️ This plugin significantly increase file size, prefer using it as standalone.

The *skyline* plugin lets you display your 3D commits calendar from [skyline.github.com](https://skyline.github.com/).

<table>
  <td align="center">
    <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.skyline.svg">
    <img width="900" height="1" alt="">
  </td>
</table>

This uses puppeteer to generate collect image frames, and use CSS animations to create an animated rendering (GIF images are not animated in GitHub flavored markdown rendering which is why this design choice was made).

#### ℹ️ Examples workflows

[➡️ Available options for this plugin](metadata.yml)

```yaml
- uses: lowlighter/metrics@latest
  with:
    # ... other options
    plugin_skyline: yes
    plugin_skyline_year: 0            # Set to 0 to display current year
    plugin_skyline_frames: 60         # Use 60 frames (half-loop)
    plugin_skyline_quality: 0.5       # Set image quality
    plugin_skyline_compatibility: yes # Support additional browsers (⚠️ increases file size and reduce optimization)
```