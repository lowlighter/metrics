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
<table>
  <tr>
    <td align="center" nowrap="nowrap">Type</i></td><td align="center" nowrap="nowrap">Description</td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_habits</code></td>
    <td rowspan="2">Display coding habits metrics<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_habits_from</code></td>
    <td rowspan="2">Number of events to use<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>number</code>
<br>
<i>(1 ≤
𝑥
≤ 1000)</i>
<b>default:</b> 200<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_habits_days</code></td>
    <td rowspan="2">Maximum event age<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>number</code>
<br>
<i>(1 ≤
𝑥
≤ 30)</i>
<b>default:</b> 14<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_habits_facts</code></td>
    <td rowspan="2">Display coding habits collected facts based on recent activity<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> yes<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_habits_charts</code></td>
    <td rowspan="2">Display coding habits charts based on recent activity<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">🌐 Web instances must configure <code>settings.json</code><br>
<b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_habits_trim</code></td>
    <td rowspan="2">Trim unused hours on daily chart<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
</table>
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
