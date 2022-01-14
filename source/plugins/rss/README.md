### 🗼 Rss feed

The *rss* plugin displays items from a specified RSS feed.

<table>
  <td align="center">
    <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.rss.svg">
    <img width="900" height="1" alt="">
  </td>
</table>

#### ➡️ Available options

<!--options-->
| Option | Type *(format)* **[default]** *{allowed values}* | Description |
| ------ | -------------------------------- | ----------- |
| `plugin_rss` | `boolean` **[no]** | Display RSS feed |
| `plugin_rss_source` | `string` **[]** | RSS feed source |
| `plugin_rss_limit` | `number` **[4]** *{0 ≤ 𝑥 ≤ 30}* | Maximum number of items to display |


Legend for option icons:
* 🔐 Value should be stored in repository secrets
* ✨ New feature currently in testing on `master`/`main`
<!--/options-->

*[→ Full specification](metadata.yml)*

#### ℹ️ Examples workflows

<!--examples-->
```yaml
name: News from hackernews
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.rss.svg
  token: NOT_NEEDED
  base: ''
  plugin_rss: 'yes'
  plugin_rss_source: https://news.ycombinator.com/rss
  plugin_rss_limit: 4

```
<!--/examples-->