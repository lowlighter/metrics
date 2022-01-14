### 🌟 Recently starred repositories

The *stars* plugin displays your recently starred repositories.

<table>
  <td align="center">
    <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.stars.svg">
    <img width="900" height="1" alt="">
  </td>
</table>

#### ➡️ Available options

<!--options-->
| Option | Type *(format)* **[default]** *{allowed values}* | Description |
| ------ | -------------------------------- | ----------- |
| `plugin_stars` | `boolean` **[no]** | Display recently starred repositories |
| `plugin_stars_limit` | `number` **[4]** *{1 ≤ 𝑥 ≤ 100}* | Maximum number of stars to display |


Legend for option icons:
* 🔐 Value should be stored in repository secrets
* ✨ New feature currently in testing on `master`/`main`
<!--/options-->

*[→ Full specification](metadata.yml)*

#### ℹ️ Examples workflows

<!--examples-->
```yaml
name: Recently starred
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.stars.svg
  token: ${{ secrets.METRICS_TOKEN }}
  base: ''
  plugin_stars: 'yes'
  plugin_stars_limit: 3

```
<!--/examples-->