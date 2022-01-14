### 🏅 Repository contributors

The *contributors* plugin lets you display repositories contributors from a commit range, that can be specified through either sha, tags, branch, etc.

It's especially useful to acknowledge contributors on release notes.

<table>
  <td align="center">
    <details open><summary>By contribution types</summary>
      <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.contributors.categories.svg">
    </details>
    <details><summary>By number of contributions</summary>
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

#### ➡️ Available options

<!--options-->
| Option | Type *(format)* **[default]** *{allowed values}* | Description |
| ------ | -------------------------------- | ----------- |
| `plugin_contributors` | `boolean` **[no]** | Display repository contributors |
| `plugin_contributors_base` | `string` **[]** | Base reference |
| `plugin_contributors_head` | `string` **[master]** | Head reference |
| `plugin_contributors_ignored` | `array` *(comma-separated)* **[github-actions[bot], dependabot[bot], dependabot-preview[bot]]** | Contributors to ignore |
| `plugin_contributors_contributions` | `boolean` **[no]** | Display contributions |
| `plugin_contributors_sections` | `array` *(comma-separated)* **[contributors]** *{"contributors", "categories"}* | Sections to display |
| `plugin_contributors_categories` | `json` **[{
  "📚 Documentation": ["README.md", "docs/**"],
  "💻 Code": ["source/**", "src/**"],
  "#️⃣ Others": ["*"]
}
]** | Contributions categories |


Legend for option icons:
* 🔐 Value should be stored in repository secrets
* ✨ New feature currently in testing on `master`/`main`
<!--/options-->

*[→ Full specification](metadata.yml)*

#### ℹ️ Examples workflows

<!--examples-->
```yaml
name: Contributors with contributions count
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.contributors.contributions.svg
  token: ${{ secrets.METRICS_TOKEN }}
  base: ''
  template: repository
  repo: metrics
  plugin_contributors: 'yes'
  plugin_contributors_contributions: 'yes'

```
```yaml
name: Contributors by categories
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.contributors.categories.svg
  token: ${{ secrets.METRICS_TOKEN }}
  base: ''
  template: repository
  repo: metrics
  plugin_contributors: 'yes'
  plugin_contributors_sections: categories
  plugin_contributors_categories: |
    {
      "🧩 Plugins / 🖼️ templates":["source/plugins/**", "source/templates/**"],
      "📚 Documentation":["README.md", "**/README.md", "**/metadata.yml"],
      "💻 Code (other)":["source/**", "Dockerfile"]
    }

```
<!--/examples-->