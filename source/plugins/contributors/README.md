### 🏅 Repository contributors

The *contributors* plugin lets you display repositories contributors from a commit range, that can be specified through either sha, tags, branch, etc.

It's especially useful to acknowledge contributors on release notes.

<table>
  <td align="center">
    <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.contributors.categories.svg">
    <details><summary>Raw list with names</summary>
      <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.contributors.svg">
    </details>
    <details><summary>With number of contributions</summary>
      <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.contributors.contributions.svg">
    </details>
    <img width="900" height="1" alt="">
  </td>
</table>

**Displaying contributors per categories**

> 🔣 On web instances, sorting contributors per categories is an extra feature and must be enabled globally in `settings.json`

To configure contributions categories, pass a JSON object to `plugin_contributors_categories` (use `|` multiline operator for better readability) with categories names as keys and an array of file glob as values:

```yaml
plugin_contributors_categories: |
  {
    "📚 Documentation": ["README.md", "docs/**"],
    "💻 Code": ["source/**", "src/**"],
    "#️⃣ Others": ["*"]
  }
```

Each time a file modified by a contributor match a fileglob, they will be added in said category.
Matching is performed in keys order.

#### ℹ️ Examples workflows

[➡️ Available options for this plugin](metadata.yml)

```yaml
- uses: lowlighter/metrics@latest
  with:
    # ... other options
    plugin_contributors: yes
    plugin_contributors_base: ""               # Base reference (commit, tag, branch, etc.)
    plugin_contributors_head: main             # Head reference (commit, tag, branch, etc.)
    plugin_contributors_ignored: bot           # Ignore "bot" user
    plugin_contributors_contributions: yes     # Display number of contributions for each contributor
    plugin_contributors_sections: contributors # Display contributors sections
```