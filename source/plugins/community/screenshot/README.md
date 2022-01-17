<!--header-->
<table>
  <tr><th colspan="2"><h3>📸 Website screenshot</h3></th></tr>
  <tr><td colspan="2" align="center"><p>This plugin display a screenshot from any website.
It can either the full page or a portion restricted by a <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors">CSS selector</a>.</p>
</td></tr>
<tr><th>Authors</th><td><a href="https://github.com/lowlighter">@lowlighter</a></td></tr>
  <tr>
    <th rowspan="3">Supported features<br><sub><a href="metadata.yml">→ Full specification</a></sub></th>
    <td><a href="/source/templates/classic"><code>📗 Classic template</code></a> <a href="/source/templates/repository"><code>📘 Repository template</code></a> <a href="/source/templates/terminal"><code>📙 Terminal template</code></a></td>
  </tr>
  <tr>
    <td><code>👤 Users</code> <code>👥 Organizations</code> <code>📓 Repositories</code></td>
  </tr>
  <tr>
    <td><i>No tokens are required for this plugin</i></td>
  </tr>
  <tr>
    <td colspan="2" align="center">
      <img src="https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.screenshot.svg" alt=""></img>
      <img width="900" height="1" alt="">
    </td>
  </tr>
</table>
<!--/header-->

## ➡️ Available options

<!--options-->
<table>
  <tr>
    <td align="center" nowrap="nowrap">Type</i></td><td align="center" nowrap="nowrap">Description</td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_screenshot</code></td>
    <td rowspan="2"><p>Enable screenshot plugin</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_screenshot_title</code></td>
    <td rowspan="2"><p>Title caption</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>string</code>
<br>
<b>default:</b> Screenshot<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_screenshot_url</code></td>
    <td rowspan="2"><p>Website url</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>string</code>
<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_screenshot_selector</code></td>
    <td rowspan="2"><p>CSS Selector</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>string</code>
<br>
<b>default:</b> body<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_screenshot_background</code></td>
    <td rowspan="2"><p>Display background</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> yes<br></td>
  </tr>
</table>
<!--/options-->

## ℹ️ Examples workflows

<!--examples-->
```yaml
name: XKCD of the day
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.screenshot.svg
  token: ${{ secrets.METRICS_TOKEN }}
  base: ""
  plugin_screenshot: yes
  plugin_screenshot_title: XKCD of the day
  plugin_screenshot_url: https://xkcd.com
  plugin_screenshot_selector: "#comic img"

```
<!--/examples-->
