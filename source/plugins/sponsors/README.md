### 💕 GitHub Sponsors

The *sponsors* plugin lets you display your sponsors and introduction text from [GitHub sponsors](https://github.com/sponsors/).

<table>
  <td align="center">
    <details open><summary>GitHub sponsors card</summary>
      <img src="https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.sponsors.svg">
    </details>
    <details><summary>GitHub sponsors full introduction</summary>
      <img src="https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.sponsors.full.svg">
    </details>
    <img width="900" height="1" alt="">
  </td>
</table>

#### ➡️ Available options

<!--options-->
<table>
  <tr>
    <td align="center" nowrap="nowrap">Type</i></td><td align="center" nowrap="nowrap">Description</td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_sponsors</code></td>
    <td rowspan="2"><p>Display GitHub sponsors</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_sponsors_sections</code></td>
    <td rowspan="2"><p>Sections to display</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>array</code>
<i>(comma-separated)</i>
<br>
<b>default:</b> goal, about<br>
<b>allowed values:</b><ul><li>goal</li><li>about</li></ul></td>
  </tr>
</table>
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