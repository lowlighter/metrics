### 🏅 Repository contributors

The *contributors* plugin lets you display repositories contributors from a commit range, that can be specified through either sha, tags, branch, etc.

It's especially useful to acknowledge contributors on release notes.

<table>
  <td align="center">
    <details open><summary>By contribution types</summary>
      <img src="https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.contributors.categories.svg">
    </details>
    <details><summary>By number of contributions</summary>
      <img src="https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.contributors.contributions.svg">
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
<table>
  <tr>
    <td align="center" nowrap="nowrap">Type</i></td><td align="center" nowrap="nowrap">Description</td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_contributors</code></td>
    <td rowspan="2">Display repository contributors<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_contributors_base</code></td>
    <td rowspan="2">Base reference<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>string</code>
<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_contributors_head</code></td>
    <td rowspan="2">Head reference<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>string</code>
<br>
<b>default:</b> master<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_contributors_ignored</code></td>
    <td rowspan="2">Contributors to ignore<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">⏩ Inherits <code>users_ignored</code><br>
<b>type:</b> <code>array</code>
<i>(comma-separated)</i>
<br>
<b>default:</b> github-actions[bot], dependabot[bot], dependabot-preview[bot]<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_contributors_contributions</code></td>
    <td rowspan="2">Display contributions<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_contributors_sections</code></td>
    <td rowspan="2">Sections to display<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>array</code>
<i>(comma-separated)</i>
<br>
<b>default:</b> contributors<br>
<b>allowed values:</b><ul><li>contributors</li><li>categories</li></ul></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_contributors_categories</code></td>
    <td rowspan="2">Contributions categories<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">🌐 Web instances must configure <code>settings.json</code><br>
<b>type:</b> <code>json</code>
<br>
<b>default:</b> {
  "📚 Documentation": ["README.md", "docs/**"],
  "💻 Code": ["source/**", "src/**"],
  "#️⃣ Others": ["*"]
}
<br></td>
  </tr>
</table>
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