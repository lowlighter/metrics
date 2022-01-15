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
<table>
  <tr>
    <td align="center" nowrap="nowrap">Type</i></td><td align="center" nowrap="nowrap">Description</td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_notable</code></td>
    <td rowspan="2">Display notable contributions in organizations<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_notable_filter</code></td>
    <td rowspan="2">Query filter<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>string</code>
<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_notable_from</code></td>
    <td rowspan="2">Filter by repository host account type<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>string</code>
<br>
<b>default:</b> organization<br>
<b>allowed values:</b><ul><li>all</li><li>organization</li><li>user</li></ul></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_notable_repositories</code></td>
    <td rowspan="2">Also display repository name<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_notable_indepth</code></td>
    <td rowspan="2">Indepth notable contributions processing<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">🌐 Web instances must configure <code>settings.json</code><br>
<b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
</table>
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
