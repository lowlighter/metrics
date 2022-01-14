### 📜 Repository licenses

> ⚠️ This is **NOT** legal advice, use at your own risk

> 🔣 On web instances, this plugin is an extra feature and must be enabled globally in `settings.json`
> 💣 Note that this plugin allows raw commands injection and is **NOT** advised to be enabled on them
> This could result in compromised server!

The *licenses* plugin lets you display license informations like permissions, limitations and conditions along with additional metrics about dependencies.

<table>
  <td align="center">
    <details open><summary>Permissions, limitations and conditions</summary>
      <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.licenses.svg">
    </details>
    <details open><summary>Licenses overview</summary>
      <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.licenses.ratio.svg">
    </details>
    <img width="900" height="1" alt="">
  </td>
</table>

Project must be setup with dependencies using `plugin_licenses_setup` option (for example, `npm ci` for a NodeJS project).

Dependencies will be analyzed with [github/licensed](https://github.com/github/licensed) and compared against GitHub known licenses.

#### ➡️ Available options

<!--options-->
| Option | Type *(format)* **[default]** *{allowed values}* | Description |
| ------ | -------------------------------- | ----------- |
| `plugin_licenses` | `boolean` **[no]** | Display licenses informations |
| `plugin_licenses_setup` | `string` **[]** | Command to setup target repository |
| `plugin_licenses_ratio` | `boolean` **[no]** | Display used licenses ratio |
| `plugin_licenses_legal` | `boolean` **[yes]** | Display legal informations about used licenses |


Legend for option icons:
* 🔐 Value should be stored in repository secrets
* ✨ New feature currently in testing on `master`/`main`
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
