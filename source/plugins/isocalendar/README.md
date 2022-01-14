### 📅 Isometric commit calendar

The *isocalendar* plugin displays an isometric view of your commits calendar, along with a few additional stats like current streak and commit average per day.

<table>
  <td align="center">
    <details open><summary>Full year isometric calendar</summary>
      <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.isocalendar.fullyear.svg">
    </details>
    <details><summary>Half year isometric calendar</summary>
      <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.isocalendar.svg">
    </details>
    <img width="900" height="1" alt="">
  </td>
</table>

#### ➡️ Available options

<!--options-->
| Option | Type *(format)* **[default]** *{allowed values}* | Description |
| ------ | -------------------------------- | ----------- |
| `plugin_isocalendar` | `boolean` **[no]** | Display an isometric view of your commits calendar |
| `plugin_isocalendar_duration` | `string` **[half-year]** *{"half-year", "full-year"}* | Set time window shown by isometric calendar |


<!--/options-->

*[→ Full specification](metadata.yml)*

#### ℹ️ Examples workflows

<!--examples-->
```yaml
name: Half-year calendar
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.isocalendar.svg
  token: ${{ secrets.METRICS_TOKEN }}
  base: ''
  plugin_isocalendar: 'yes'

```
```yaml
name: Full-year calendar
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.isocalendar.fullyear.svg
  token: ${{ secrets.METRICS_TOKEN }}
  base: ''
  plugin_isocalendar: 'yes'
  plugin_isocalendar_duration: full-year

```
<!--/examples-->
