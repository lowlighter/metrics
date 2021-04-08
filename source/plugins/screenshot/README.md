### 📸 Website screenshot

The *screenshot* plugin lets you take a screenshot from any website.
It can be restricted with a [CSS selector](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors) or you can take a full page.

<table>
  <td align="center">
    <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.screenshot.svg">
    <img width="900" height="1" alt="">
  </td>
</table>

#### ℹ️ Examples workflows

[➡️ Available options for this plugin](metadata.yml)

```yaml
- uses: lowlighter/metrics@latest
  with:
    # ... other options
    plugin_screenshot: yes
    plugin_screenshot_title: XKCD of the day  # Section title
    plugin_screenshot_url: https://xkcd.com   # Website url
    plugin_screenshot_selector: "#comic img"  # CSS selector to take into screenshot
    plugin_screenshot_background: no          # Remove page background
```