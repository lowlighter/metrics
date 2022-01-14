### 💡 Coding habits

The coding *habits* plugin display metrics based on your recent activity, such as active hours or languages recently used.

<table>
  <td align="center">
    <details open><summary>Recent activity charts</summary>
      <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.habits.charts.svg">
    </details>
    <details open><summary>Midly interesting facts</summary>
      <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.habits.facts.svg">
    </details>
    <img width="900" height="1" alt="">
  </td>
</table>

Using more events will improve accuracy of these metrics, although it'll increase the number of GitHub requests used.

Active hours and days are computed through your commit history, while indent style is deduced from your recent diffs.
Recent languages activity is also computed from your recent diffs, using [github/linguist](https://github.com/github/linguist).

Use a full `repo` scope token to access **private** events.

By default, dates use Greenwich meridian (GMT/UTC). Be sure to set your timezone (see [here](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) for a list of supported timezones) for accurate metrics.

> 🔣 On web instances, *recent languages activity* is an extra feature and must be enabled globally in `settings.json`

#### ➡️ Available options

<!--options-->
| Option | Type *(format)* **[default]** *{allowed values}* | Description |
| ------ | -------------------------------- | ----------- |
| `plugin_habits` | `boolean` **[no]** | Display coding habits metrics |
| `plugin_habits_from` | `number` **[200]** *{1 ≤ 𝑥 ≤ 1000}* | Number of events to use |
| `plugin_habits_days` | `number` **[14]** *{1 ≤ 𝑥 ≤ 30}* | Maximum event age |
| `plugin_habits_facts` | `boolean` **[yes]** | Display coding habits collected facts based on recent activity |
| `plugin_habits_charts` | `boolean` **[no]** | Display coding habits charts based on recent activity |
| `plugin_habits_trim` | `boolean` **[no]** | Trim unused hours on daily chart |


Legend for option icons:
* 🔐 Value should be stored in repository secrets
* ✨ New feature currently in testing on `master`/`main`
<!--/options-->

*[→ Full specification](metadata.yml)*

#### ℹ️ Examples workflows

<!--examples-->
```yaml
name: Midly interesting facts
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.habits.facts.svg
  token: ${{ secrets.METRICS_TOKEN }}
  base: ''
  plugin_habits: 'yes'
  plugin_habits_facts: 'yes'
  plugin_habits_charts: 'no'
  config_timezone: Europe/Paris

```
```yaml
name: Recent activity charts
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.habits.charts.svg
  token: ${{ secrets.METRICS_TOKEN }}
  base: ''
  plugin_habits: 'yes'
  plugin_habits_facts: 'no'
  plugin_habits_charts: 'yes'
  config_timezone: Europe/Paris

```
<!--/examples-->
