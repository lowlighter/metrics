### 📜 Repository licenses

> ⚠️ This is **NOT** legal advice, use at your own risk
>
> 💣 Do **NOT** enable this plugin on public web instances (plugin allows raw commands injection)

The *licenses* plugin lets you display license informations like permissions, limitations and conditions along with additional metrics about dependencies.

<table>
  <td align="center">
    <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.licenses.svg">
    <details><summary>With licenses ratio</summary>
      <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.licenses.ratio.svg">
    </details>
    <img width="900" height="1" alt="">
  </td>
</table>

Project must be setup with dependencies using `plugin_licenses_setup` option (for example, `npm ci` for a NodeJS project).

Dependencies will be analyzed with [github/licensed](https://github.com/github/licensed) and compared against GitHub known licenses.

#### ℹ️ Examples workflows

[➡️ Available options for this plugin](metadata.yml)

```yaml
- uses: lowlighter/metrics@latest
  with:
    # ... other options
    template: repository
    user: repository-owner
    repo: repository-name
    plugin_licenses: yes
    plugin_licenses_setup: npm ci       # Command to setup target repository
    plugin_licenses_ratio: yes          # Display used licenses ratio
    plugin_licenses_legal: yes          # Display permissions, limitations and conditions
```