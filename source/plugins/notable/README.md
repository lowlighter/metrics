### 🎩 Notable contributions

The *notable* plugin displays badges of organization where you commited at least once on main branch.

<table>
  <td align="center">
    <details open><summary>Indepth analysis</summary>
      <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.notable.indepth.svg">
    </details>
    <details><summary>Contributions in organizations only</summary>
      <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.notable.svg">
    </details>
    <img width="900" height="1" alt="">
  </td>
</table>

#### Using `indepth` statistics

The `plugin_notable_indepth` option lets you get additional metrics about your contribution, such as:
- Total number of commits within a repository or organization. The badge will have a circular gauge which is proportional to the percentage of total contribution. It will also determine the resulting color of the badge.

> 🔣 On web instances, `indepth` is an extra feature and must be enabled globally in `settings.json`

#### ➡️ Available options

<!--options-->
| Option | Type *(format)* **[default]** *{allowed values}* | Description |
| ------ | -------------------------------- | ----------- |
| `plugin_notable` | `boolean` **[no]** | Display notable contributions in organizations |
| `plugin_notable_filter` | `string` **[]** | Query filter |
| `plugin_notable_from` | `string` **[organization]** *{"all", "organization", "user"}* | Filter by repository host account type |
| `plugin_notable_repositories` | `boolean` **[no]** | Also display repository name |
| `plugin_notable_indepth` | `boolean` **[no]** | Indepth notable contributions processing |


Legend for option icons:
* 🔐 Value should be stored in repository secrets
* ✨ New feature currently in testing on `master`/`main`
<!--/options-->

*[→ Full specification](metadata.yml)*

#### ℹ️ Examples workflows

<!--examples-->
```yaml
name: Contributions
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.notable.svg
  token: ${{ secrets.METRICS_TOKEN }}
  base: ''
  plugin_notable: 'yes'

```
```yaml
name: Indepth analysis
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.notable.indepth.svg
  token: ${{ secrets.METRICS_TOKEN }}
  base: ''
  plugin_notable: 'yes'
  plugin_notable_indepth: 'yes'
  plugin_notable_repositories: 'yes'

```
<!--/examples-->
