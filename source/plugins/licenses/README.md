### 📜 Repository licenses

> ⚠️ This is **NOT** legal advice, use at your own risk

> 🔣 On web instances, this plugin is an extra feature and must be enabled globally in `settings.json`
> 💣 Note that this plugin allows raw commands injection and is **NOT** advised to be enabled on them
> This could result in compromised server!

The *licenses* plugin lets you display license informations like permissions, limitations and conditions along with additional metrics about dependencies.

<table>
  <td align="center">
    <details open><summary>Permissions, limitations and conditions</summary>
      <img src="https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.licenses.svg">
    </details>
    <details open><summary>Licenses overview</summary>
      <img src="https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.licenses.ratio.svg">
    </details>
    <img width="900" height="1" alt="">
  </td>
</table>

Project must be setup with dependencies using `plugin_licenses_setup` option (for example, `npm ci` for a NodeJS project).

Dependencies will be analyzed with [github/licensed](https://github.com/github/licensed) and compared against GitHub known licenses.

#### ➡️ Available options

<!--options-->
<table>
  <tr>
    <td align="center" nowrap="nowrap">Type</i></td><td align="center" nowrap="nowrap">Description</td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_licenses</code></td>
    <td rowspan="2">Display licenses informations<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">🌐 Web instances must configure <code>settings.json</code><br>
<b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_licenses_setup</code></td>
    <td rowspan="2">Command to setup target repository<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>string</code>
<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_licenses_ratio</code></td>
    <td rowspan="2">Display used licenses ratio<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_licenses_legal</code></td>
    <td rowspan="2">Display legal informations about used licenses<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> yes<br></td>
  </tr>
</table>
<!--/options-->

*[→ Full specification](metadata.yml)*

#### ℹ️ Examples workflows

<!--examples-->
```yaml
name: Licenses and permissions
with:
  filename: metrics.plugin.licenses.svg
  token: ${{ secrets.METRICS_TOKEN }}
  base: ''
  template: repository
  repo: metrics
  plugin_licenses: 'yes'
  plugin_licenses_setup: npm ci

```
```yaml
name: Licenses with open-source ratio graphs
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.licenses.ratio.svg
  token: ${{ secrets.METRICS_TOKEN }}
  base: ''
  template: repository
  repo: metrics
  plugin_licenses: 'yes'
  plugin_licenses_setup: npm ci
  plugin_licenses_legal: 'no'
  plugin_licenses_ratio: 'yes'

```
<!--/examples-->
