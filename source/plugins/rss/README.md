### 🗼 Rss feed

The *rss* plugin displays items from a specified RSS feed.

<table>
  <td align="center">
    <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.rss.svg">
    <img width="900" height="1" alt="">
  </td>
</table>

#### ℹ️ Examples workflows

[➡️ Available options for this plugin](metadata.yml)

```yaml
- uses: lowlighter/metrics@latest
  with:
    # ... other options
    plugin_rss: yes
    plugin_rss_source: https://news.ycombinator.com/rss  # RSS feed
    plugin_rss_limit: 6                                  # Limit to 6 items
```