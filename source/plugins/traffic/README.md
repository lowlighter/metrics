### 🧮 Repositories traffic

> ⚠️ This plugin requires a personal token with repo scope.

The repositories *traffic* plugin displays the number of page views across your repositories.

<table>
  <td align="center">
    <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.traffic.svg">
  </td>
</table>

Because of GitHub REST API limitation, provided token requires full `repo` scope to access traffic informations.

![Token with repo scope](/.github/readme/imgs/setup_token_repo_scope.png)

#### ➡️ Available options

<!--options-->
| Option | Type *(format)* **[default]** *{allowed values}* | Description |
| ------ | -------------------------------- | ----------- |
| `plugin_traffic` | `boolean` **[no]** | Display repositories traffic metrics |
| `plugin_traffic_skipped` | `array` *(comma-separated)* **[]** | Repositories to skip |


Legend for option icons:
* 🔐 Value should be stored in repository secrets
* ✨ New feature currently in testing on `master`/`main`
<!--/options-->

*[→ Full specification](metadata.yml)*

#### ℹ️ Examples workflows

<!--examples-->
```yaml
name: Repositories traffic
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.traffic.svg
  token: ${{ secrets.METRICS_TOKEN }}
  base: repositories
  plugin_traffic: 'yes'

```
<!--/examples-->