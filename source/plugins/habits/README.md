<!--header-->
<table>
  <tr><td colspan="2"><a href="/README.md#-plugins">← Back to plugins index</a></td></tr>
  <tr><th colspan="2"><h3>💡 Coding habits and activity</h3></th></tr>
  <tr><td colspan="2" align="center"><p>This plugin displays coding habits based on recent activity, such as active hours and languages recently used.</p>
</td></tr>
  <tr><th>⚠️ Disclaimer</th><td><p>This plugin is not affiliated, associated, authorized, endorsed by, or in any way officially connected with <a href="https://github.com">GitHub</a>.
All product and company names are trademarks™ or registered® trademarks of their respective holders.</p>
</td></tr>
  <tr>
    <th rowspan="3">Supported features<br><sub><a href="metadata.yml">→ Full specification</a></sub></th>
    <td><a href="/source/templates/classic/README.md"><code>📗 Classic template</code></a></td>
  </tr>
  <tr>
    <td><code>👤 Users</code> <code>👥 Organizations</code></td>
  </tr>
  <tr>
    <td><code>🔑 (scopeless)</code> <code>read:org (optional)</code> <code>read:user (optional)</code> <code>read:packages (optional)</code> <code>repo (optional)</code></td>
  </tr>
  <tr>
    <td colspan="2" align="center">
      <details open><summary>Recent activity charts</summary><img src="https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.habits.charts.svg" alt=""></img></details>
      <details open><summary>Mildly interesting facts</summary><img src="https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.habits.facts.svg" alt=""></img></details>
      <img width="900" height="1" alt="">
    </td>
  </tr>
</table>
<!--/header-->

## ➡️ Available options

<!--options-->
<table>
  <tr>
    <td align="center" nowrap="nowrap">Option</i></td><td align="center" nowrap="nowrap">Description</td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_habits</code></h4></td>
    <td rowspan="2"><p>Enable habits plugin</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_habits_from</code></h4></td>
    <td rowspan="2"><p>Events to use</p>
<p>A higher number will increase stats accuracy</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>number</code>
<i>(1 ≤
𝑥
≤ 1000)</i>
<br>
<b>default:</b> 200<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_habits_days</code></h4></td>
    <td rowspan="2"><p>Event maximum age</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>number</code>
<i>(1 ≤
𝑥
≤ 30)</i>
<br>
<b>default:</b> 14<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_habits_facts</code></h4></td>
    <td rowspan="2"><p>Mildly interesting facts</p>
<p>It includes indentation type, average number of characters per line of code, and most active time and day</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> yes<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_habits_charts</code></h4></td>
    <td rowspan="2"><p>Charts</p>
<p>It includes commit activity per hour of day and commit activity per day of week
Recent language activity may also displayed (it requires extras features to be enabled for web instances) for historical reasons</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">🌐 Web instances must configure <code>settings.json</code>:
<ul>
<li><i>metrics.api.github.overuse</i></li>
<li><i>metrics.run.tempdir</i></li>
<li><i>metrics.run.git</i></li>
</ul>
<b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_habits_charts_type</code></h4></td>
    <td rowspan="2"><p>Charts display type</p>
<ul>
<li><code>classic</code>: <code>&lt;div&gt;</code> based charts, simple and lightweight</li>
<li><code>chartist</code>: <code>&lt;svg&gt;</code> based charts, smooth</li>
</ul>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">🌐 Web instances must configure <code>settings.json</code>:
<ul>
<li><i>metrics.npm.optional.chartist</i></li>
</ul>
<b>type:</b> <code>string</code>
<br>
<b>default:</b> classic<br>
<b>allowed values:</b><ul><li>classic</li><li>chartist</li></ul></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_habits_trim</code></h4></td>
    <td rowspan="2"><p>Trim unused hours on charts</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_habits_languages_limit</code></h4></td>
    <td rowspan="2"><p>Display limit (languages)</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>number</code>
<i>(0 ≤
𝑥
≤ 8)</i>
<br>
<b>zero behaviour:</b> disable</br>
<b>default:</b> 8<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_habits_languages_threshold</code></h4></td>
    <td rowspan="2"><p>Display threshold (percentage)</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>string</code>
<br>
<b>default:</b> 0%<br></td>
  </tr>
</table>
<!--/options-->

## 🌐 Configure used timezone

By default, dates use Greenwich meridian (GMT/UTC).

Configure `config_timezone` (see [supported timezone](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)) to avoid time offsets.

*Example: configuring timezone*
```yaml
- uses: lowlighter/metrics@latest
  with:
    config_timezone: Europe/Paris
```

## ℹ️ Examples workflows

<!--examples-->
```yaml
name: Mildly interesting facts
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.habits.facts.svg
  token: ${{ secrets.METRICS_TOKEN }}
  base: ""
  plugin_habits: yes
  plugin_habits_facts: yes
  plugin_habits_charts: no
  config_timezone: Europe/Paris

```
```yaml
name: Recent activity charts
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.habits.charts.svg
  token: ${{ secrets.METRICS_TOKEN }}
  base: ""
  plugin_habits: yes
  plugin_habits_facts: no
  plugin_habits_charts: yes
  config_timezone: Europe/Paris

```
<!--/examples-->


