### 💬 Discussions

The *discussions* plugin displays your GitHub discussions metrics.

<table>
  <td align="center">
    <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.discussions.svg">
    <img width="900" height="1" alt="">
  </td>
</table>

#### ➡️ Available options

<!--options-->
| Option | Type *(format)* **[default]** *{allowed values}* | Description |
| ------ | -------------------------------- | ----------- |
| `plugin_discussions` | `boolean` **[no]** | GitHub discussions metrics |
| `plugin_discussions_categories` <sup>✨</sup> | `boolean` **[yes]** | Display discussion categories |
| `plugin_discussions_categories_limit` <sup>✨</sup> | `number` **[0]** | Number of discussion categories to display |


Legend for option icons:
* ✨ Currently in beta-testing on `master`/`main`
<!--/options-->

*[→ Full specification](metadata.yml)*

#### ℹ️ Examples workflows

<!--examples-->
```yaml
name: GitHub Discussions
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.discussions.svg
  token: ${{ secrets.METRICS_TOKEN }}
  base: ''
  plugin_discussions: 'yes'
  plugin_discussions_categories_limit: 8

```
<!--/examples-->