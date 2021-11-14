### 📌 Starred topics

The *topics* plugin displays your [starred topics](https://github.com/stars?filter=topics).
Check out [GitHub topics](https://github.com/topics) to search interesting topics.

<table>
  <td align="center">
    <details open><summary>With icons</summary>
      <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.topics.icons.svg">
    </details>
    <details open><summary>With labels</summary>
      <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.topics.svg">
    </details>
    <img width="900" height="1" alt="">
  </td>
</table>

This uses puppeteer to navigate through your starred topics page.

#### ℹ️ Examples workflows

[➡️ Available options for this plugin](metadata.yml)

```yaml
- uses: lowlighter/metrics@latest
  with:
    # ... other options
    plugin_topics: yes
    plugin_topics_sort: stars    # Sort by most starred topics
    plugin_topics_mode: icons    # Display icons instead of labels
    plugin_topics_limit: 0       # Disable limitations
```
