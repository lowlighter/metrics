### 🧮 Repositories traffic

> ⚠️ This plugin requires a personal token with repo scope.

The repositories *traffic* plugin displays the number of page views across your repositories.

<table>
  <td align="center">
    <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.traffic.svg">
  </td>
</table>

Because of GitHub REST API limitation, provided token requires full `repo` scope to access traffic informations.

![Token with repo scope](/.github/readme/imgs/setup_token_repo_scope.png)

#### ℹ️ Examples workflows

[➡️ Available options for this plugin](metadata.yml)

```yaml
- uses: lowlighter/metrics@latest
  with:
    # ... other options
    plugin_traffic: yes
```
