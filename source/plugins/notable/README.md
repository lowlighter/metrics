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

#### ℹ️ Examples workflows

[➡️ Available options for this plugin](metadata.yml)

```yaml
- uses: lowlighter/metrics@latest
  with:
    # ... other options
    plugin_notable: yes
    plugin_notable_filter: stars:>500 # Only display repositories with 500 stars or more (syntax based on GitHub search query)
    plugin_notable_from: organization # Only display contributions within organization repositories
    plugin_notable_repositories: yes  # Display repositories name instead of only organization name
    plugin_notable_indepth: yes       # Gather additional informations about contributions
```