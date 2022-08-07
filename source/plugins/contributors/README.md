<!--header-->
<table>
  <tr><td colspan="2"><a href="/README.md#-plugins">← Back to plugins index</a></td></tr>
  <tr><th colspan="2"><h3>🏅 Repository contributors</h3></th></tr>
  <tr><td colspan="2" align="center"><p>This plugin display repositories contributors from a commit range along with additional stats.</p>
</td></tr>
  <tr><th>⚠️ Disclaimer</th><td><p>This plugin is not affiliated, associated, authorized, endorsed by, or in any way officially connected with <a href="https://github.com">GitHub</a>.
All product and company names are trademarks™ or registered® trademarks of their respective holders.</p>
</td></tr>
  <tr>
    <th rowspan="3">Supported features<br><sub><a href="metadata.yml">→ Full specification</a></sub></th>
    <td><a href="/source/templates/repository/README.md"><code>📘 Repository template</code></a></td>
  </tr>
  <tr>
    <td><code>📓 Repositories</code></td>
  </tr>
  <tr>
    <td><code>🔑 (scopeless)</code> <code>read:org (optional)</code> <code>read:user (optional)</code> <code>read:packages (optional)</code> <code>repo (optional)</code></td>
  </tr>
  <tr>
    <td colspan="2" align="center">
      <details open><summary>By contribution types</summary><img src="https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.contributors.categories.svg" alt=""></img></details>
      <details><summary>By number of contributions</summary><img src="https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.contributors.contributions.svg" alt=""></img></details>
      <img width="900" height="1" alt="">
    </td>
  </tr>
</table>
<!--/header-->

## ➡️ Available options

<!--options-->
<table>
  <tr>
    <td align="center" nowrap="nowrap">Option</i></td><td align="center" nowrap="nowrap">Description</td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_contributors</code></h4></td>
    <td rowspan="2"><p>Enable contributors plugin</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_contributors_base</code></h4></td>
    <td rowspan="2"><p>Base reference</p>
<p>Can be a commit, tag, branch, etc.</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>string</code>
<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_contributors_head</code></h4></td>
    <td rowspan="2"><p>Head reference</p>
<p>Can be a commit, tag, branch, etc.</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>string</code>
<br>
<b>default:</b> master<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_contributors_ignored</code></h4></td>
    <td rowspan="2"><p>Ignored users</p>
<p>Can be used to ignore bots activity</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">⏩ Inherits <code>users_ignored</code><br>
<b>type:</b> <code>array</code>
<i>(comma-separated)</i>
<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_contributors_contributions</code></h4></td>
    <td rowspan="2"><p>Contributions count</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_contributors_sections</code></h4></td>
    <td rowspan="2"><p>Displayed sections</p>
<ul>
<li><code>contributors</code>: all contributors</li>
<li><code>categories</code>: contributors sorted by contributions categories (must be configured with <code>plugin_contributors_categories</code>)</li>
</ul>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>array</code>
<i>(comma-separated)</i>
<br>
<b>default:</b> contributors<br>
<b>allowed values:</b><ul><li>contributors</li><li>categories</li></ul></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_contributors_categories</code></h4></td>
    <td rowspan="2"><p>Contribution categories</p>
<p>This option requires <a href="/source/plugins/contributors/README.md#plugin_contributors_sections"><code>plugin_contributors_sections</code></a> to have <code>categories</code> in it to be effective.
Pass a JSON object mapping category with file globs</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">🌐 Web instances must configure <code>settings.json</code>:
<ul>
<li><i>metrics.run.tempdir</i></li>
<li><i>metrics.run.git</i></li>
</ul>
<b>type:</b> <code>json</code>
<br>
<b>default:</b> <details><summary>→ Click to expand</summary><pre language="json"><code>{
  "📚 Documentation": ["README.md", "docs/**"],
  "💻 Code": ["source/**", "src/**"],
  "#️⃣ Others": ["*"]
}
</code></pre></details><br></td>
  </tr>
</table>
<!--/options-->

## 🗂️ Setting up contribution categories

Pass a JSON object to `plugin_contributors_categories` with categories names as keys and arrays of file globs as values to configure contributions categories.

Each modified file by a contributor matching a file glob will add them in said category.

> 💡 File matching respect keys order

> 💡 Use `|` YAML multiline operator for better readability

*Example: *
```yaml
- uses: lowlighter/metrics@latest
  with:
    plugin_contributors: yes
    plugin_contributors_categories: |
      {
        "📚 Documentation": ["README.md", "docs/**"],
        "💻 Code": ["source/**", "src/**"],
        "#️⃣ Others": ["*"]
      }
```

## ℹ️ Examples workflows

<!--examples-->
```yaml
name: Contributors with contributions count
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.contributors.contributions.svg
  token: ${{ secrets.METRICS_TOKEN }}
  base: ""
  template: repository
  repo: metrics
  plugin_contributors: yes
  plugin_contributors_contributions: yes

```
```yaml
name: Contributors by categories
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.contributors.categories.svg
  token: ${{ secrets.METRICS_TOKEN }}
  base: ""
  template: repository
  repo: metrics
  plugin_contributors: yes
  plugin_contributors_sections: categories
  plugin_contributors_categories: |
    {
      "🧩 Plugins / 🖼️ templates":["source/plugins/**", "source/templates/**"],
      "📚 Documentation":["README.md", "**/README.md", "**/metadata.yml"],
      "💻 Code (other)":["source/**", "Dockerfile"]
    }

```
<!--/examples-->
