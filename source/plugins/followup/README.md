### 🎟️ Follow-up of issues and pull requests

The *followup* plugin displays the ratio of open/closed issues and the ratio of open/merged pull requests across all your repositories, which shows if they're well-maintained or not.

<table>
  <td align="center">
    <details open><summary>Indepth analysis</summary>
      <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.followup.indepth.svg">
    </details>
    <details><summary>Created on an user's repositories</summary>
      <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.followup.svg">
    </details>
    <details><summary>Created by an user</summary>
      <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.followup.user.svg">
    </details>
    <img width="900" height="1" alt="">
  </td>
</table>

#### ➡️ Available options

<!--options-->
| Option | Type *(format)* **[default]** *{allowed values}* | Description |
| ------ | -------------------------------- | ----------- |
| `plugin_followup` | `boolean` **[no]** | Display follow-up of repositories issues and pull requests |
| `plugin_followup_sections` | `array` *(comma-separated)* **[repositories]** *{"repositories", "user"}* | Sections to display |
| `plugin_followup_indepth` <sup>🧰</sup> | `boolean` **[no]** | Indepth follow-up processing |


Legend for option icons:
* 🧰 Must be enabled in `settings.json` (for web instances)
<!--/options-->

*[→ Full specification](metadata.yml)*

#### ℹ️ Examples workflows

<!--examples-->
```yaml
name: Opened on user's repositories
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.followup.svg
  token: ${{ secrets.METRICS_TOKEN }}
  base: ''
  plugin_followup: 'yes'

```
```yaml
name: Opened by user
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.followup.user.svg
  token: ${{ secrets.METRICS_TOKEN }}
  base: ''
  plugin_followup: 'yes'
  plugin_followup_sections: user

```
```yaml
name: Indepth analysis
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.followup.indepth.svg
  token: ${{ secrets.METRICS_TOKEN }}
  base: ''
  plugin_followup: 'yes'
  plugin_followup_indepth: 'yes'

```
<!--/examples-->