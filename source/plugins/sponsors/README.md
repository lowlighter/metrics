### 💕 GitHub Sponsors

The *sponsors* plugin lets you display your sponsors and introduction text from [GitHub sponsors](https://github.com/sponsors/).

<table>
  <td align="center">
    <details open><summary>GitHub sponsors card</summary>
      <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.sponsors.svg">
    </details>
    <details><summary>GitHub sponsors full introduction</summary>
      <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.sponsors.full.svg">
    </details>
    <img width="900" height="1" alt="">
  </td>
</table>

#### ➡️ Available options

<!--options-->
| Option | Type *(format)* **[default]** *{allowed values}* | Description |
| ------ | -------------------------------- | ----------- |
| `plugin_sponsors` | `boolean` **[no]** | Display GitHub sponsors |
| `plugin_sponsors_sections` | `array` *(comma-separated)* **[goal, about]** *{"goal", "about"}* | Sections to display |


<!--/options-->

*[→ Full specification](metadata.yml)*

#### ℹ️ Examples workflows

<!--examples-->
```yaml
name: Sponsors goal
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.sponsors.svg
  token: ${{ secrets.METRICS_TOKEN }}
  base: ''
  plugin_sponsors: 'yes'
  plugin_sponsors_sections: goal

```
```yaml
name: Sponsors introduction
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.sponsors.full.svg
  token: ${{ secrets.METRICS_TOKEN }}
  base: ''
  plugin_sponsors: 'yes'

```
<!--/examples-->