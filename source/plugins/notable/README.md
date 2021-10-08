### 🎩 Notable contributions

The *notable* plugin displays badges of organization where you commited at least once on main branch.

<table>
  <td align="center">
    <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.notable.svg">
    <details open><summary>With repository name</summary>
      <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.notable.repositories.svg">
    </details>
    <img width="900" height="1" alt="">
  </td>
</table>

#### ℹ️ Examples workflows

[➡️ Available options for this plugin](metadata.yml)

```yaml
- uses: lowlighter/metrics@latest
  with:
    # ... other options
    plugin_notable: yes
    plugin_notable_filter: stars:>500    # Only display repositories with 500 stars or more (syntax based on GitHub search query)
    plugin_notable_from: organization    # Only display contributions within organization repositories
    plugin_notable_repositories: yes     # Display repositories name instead of only organization name
```