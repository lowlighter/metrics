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
| Option | Type *(format)* **[default]** *{allowed values}* | Description |
| ------ | -------------------------------- | ----------- |
| `plugin_screenshot` | `boolean` **[no]** | Display a screenshot of any website |
| `plugin_screenshot_title` | `string` **[Screenshot]** | Screenshot title caption |
| `plugin_screenshot_url` | `string` **[]** | Website to take screenshot |
| `plugin_screenshot_selector` | `string` **[body]** | Selector to take in screenshot |
| `plugin_screenshot_background` | `boolean` **[yes]** | Display or remove default page background |


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