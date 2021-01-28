### 📌 Starred topics

The *topics* plugin displays your [starred topics](https://github.com/stars?filter=topics).
Check out [GitHub topics](https://github.com/topics) to search interesting topics.

<table>
  <td>
    <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.topics.svg">
    <details open><summary>Mastered and known technologies version</summary>
      <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.topics.mastered.svg">
    </details>
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
    plugin_topics_mode: mastered # Display icons instead of labels
    plugin_topics_limit: 0       # Disable limitations
```
