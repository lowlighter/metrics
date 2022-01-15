### 📸 Website screenshot

The *screenshot* plugin lets you take a screenshot from any website.
It can be restricted with a [CSS selector](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors) or you can take a full page.

<table>
  <td align="center">
    <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.screenshot.svg">
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
    <td nowrap="nowrap"><code>plugin_screenshot</code></td>
    <td rowspan="2">Display a screenshot of any website<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_screenshot_title</code></td>
    <td rowspan="2">Screenshot title caption<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>string</code>
<br>
<b>default:</b> Screenshot<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_screenshot_url</code></td>
    <td rowspan="2">Website to take screenshot<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>string</code>
<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_screenshot_selector</code></td>
    <td rowspan="2">Selector to take in screenshot<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>string</code>
<br>
<b>default:</b> body<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_screenshot_background</code></td>
    <td rowspan="2">Display or remove default page background<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> yes<br></td>
  </tr>
</table>
<!--/options-->

*[→ Full specification](metadata.yml)*

#### ℹ️ Examples workflows

<!--examples-->
```yaml
name: XKCD of the day
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.screenshot.svg
  token: ${{ secrets.METRICS_TOKEN }}
  base: ''
  plugin_screenshot: 'yes'
  plugin_screenshot_title: XKCD of the day
  plugin_screenshot_url: https://xkcd.com
  plugin_screenshot_selector: '#comic img'

```
<!--/examples-->