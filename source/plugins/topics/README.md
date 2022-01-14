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

#### ➡️ Available options

<!--options-->
| Option | Type *(format)* **[default]** *{allowed values}* | Description |
| ------ | -------------------------------- | ----------- |
| `plugin_topics` | `boolean` **[no]** | Display starred topics |
| `plugin_topics_mode` | `string` **[starred]** *{"starred", "icons", "mastered"}* | Plugin mode |
| `plugin_topics_sort` | `string` **[stars]** *{"stars", "activity", "starred", "random"}* | Sorting method of starred topics |
| `plugin_topics_limit` | `number` **[15]** *{0 ≤ 𝑥 ≤ 20}* | Maximum number of topics to display |


<!--/options-->

*[→ Full specification](metadata.yml)*

#### ℹ️ Examples workflows

<!--examples-->
```yaml
name: Labels
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.topics.svg
  token: ${{ secrets.METRICS_TOKEN }}
  base: ''
  plugin_topics: 'yes'
  plugin_topics_limit: 12

```
```yaml
name: Icons
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.topics.icons.svg
  token: ${{ secrets.METRICS_TOKEN }}
  base: ''
  plugin_topics: 'yes'
  plugin_topics_limit: 0
  plugin_topics_mode: icons

```
<!--/examples-->