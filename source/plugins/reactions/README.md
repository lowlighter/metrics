### 🎭 Comment reactions

The *reactions* plugin displays overall reactions on your recent issues and issue comments.

<table>
  <td align="center">
    <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.reactions.svg">
    <img width="900" height="1" alt="">
  </td>
</table>

#### ➡️ Available options

<!--options-->
| Option | Type *(format)* **[default]** *{allowed values}* | Description |
| ------ | -------------------------------- | ----------- |
| `plugin_reactions` | `boolean` **[no]** | Display average issue comments reactions |
| `plugin_reactions_limit` | `number` **[200]** *{0 ≤ 𝑥 ≤ 1000}* | Maximum number of issue comments to parse |
| `plugin_reactions_limit_issues` | `number` **[100]** *{0 ≤ 𝑥 ≤ 1000}* | Maximum number of issues and pull requests opened to parse |
| `plugin_reactions_limit_discussions` | `number` **[100]** *{0 ≤ 𝑥 ≤ 1000}* | Maximum number of discussions opened to parse |
| `plugin_reactions_limit_discussions_comments` | `number` **[100]** *{0 ≤ 𝑥 ≤ 1000}* | Maximum number of discussions comments opened to parse |
| `plugin_reactions_days` | `number` **[0]** *{0 ≤ 𝑥}* | Maximum comments age |
| `plugin_reactions_display` | `string` **[absolute]** *{"absolute", "relative"}* | Display mode |
| `plugin_reactions_details` | `array` *(comma-separated)* **[]** *{"count", "percentage"}* | Additional details |
| `plugin_reactions_ignored` <sup>⏩</sup> | `array` *(comma-separated)* **[]** | Users to ignore |


Legend for option icons:
* ⏩ Value inherits from its related global-level option
<!--/options-->

*[→ Full specification](metadata.yml)*

#### ℹ️ Examples workflows

<!--examples-->
```yaml
name: Comment reactions
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.reactions.svg
  token: ${{ secrets.METRICS_TOKEN }}
  base: ''
  plugin_reactions: 'yes'
  plugin_reactions_limit: 100
  plugin_reactions_details: percentage

```
<!--/examples-->