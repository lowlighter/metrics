<!--header-->
<table>
  <tr><td colspan="2"><a href="/README.md#-plugins">← Back to plugins index</a></td></tr>
  <tr><th colspan="2"><h3>🈷️ Most used languages</h3></th></tr>
  <tr><td colspan="2" align="center"><p>This plugin can display which languages you use across all repositories you contributed to.</p>
</td></tr>
  <tr>
    <th rowspan="3">Supported features<br><sub><a href="metadata.yml">→ Full specification</a></sub></th>
    <td><a href="/source/templates/classic/README.md"><code>📗 Classic template</code></a> <a href="/source/templates/repository/README.md"><code>📘 Repository template</code></a> <a href="/source/templates/terminal/README.md"><code>📙 Terminal template</code></a></td>
  </tr>
  <tr>
    <td><code>👤 Users</code> <code>👥 Organizations</code> <code>📓 Repositories</code></td>
  </tr>
  <tr>
    <td><code>🔑 (scopeless)</code> <code>read:org (optional)</code> <code>read:user (optional)</code> <code>read:packages (optional)</code> <code>repo (optional)</code></td>
  </tr>
  <tr>
    <td colspan="2" align="center">
      <details open><summary>Indepth analysis (clone and analyze repositories)</summary><img src="https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.languages.indepth.svg" alt=""></img></details>
      <details open><summary>Recently used (analyze recent activity events)</summary><img src="https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.languages.recent.svg" alt=""></img></details>
      <details><summary>Default algorithm</summary><img src="https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.languages.svg" alt=""></img></details>
      <details><summary>Default algorithm (with details)</summary><img src="https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.languages.details.svg" alt=""></img></details>
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
    <td nowrap="nowrap"><h4><code>plugin_languages</code></h4></td>
    <td rowspan="2"><p>Enable languages plugin</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_languages_ignored</code></h4></td>
    <td rowspan="2"><p>Ignored languages</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>array</code>
<i>(comma-separated)</i>
<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_languages_skipped</code></h4></td>
    <td rowspan="2"><p>Skipped repositories</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">⏩ Inherits <code>repositories_skipped</code><br>
<b>type:</b> <code>array</code>
<i>(comma-separated)</i>
<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_languages_limit</code></h4></td>
    <td rowspan="2"><p>Display limit</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>number</code>
<i>(0 ≤
𝑥
≤ 8)</i>
<br>
<b>zero behaviour:</b> disable</br>
<b>default:</b> 8<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_languages_threshold</code></h4></td>
    <td rowspan="2"><p>Display threshold (percentage)</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>string</code>
<br>
<b>default:</b> 0%<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_languages_other</code></h4></td>
    <td rowspan="2"><p>Group unknown, ignored and over-limit languages into a single &quot;Other&quot; category</p>
<p>If this option is enabled, &quot;Other&quot; category will not be subject to <code>plugin_languages_threshold</code>.
It will be automatically hidden if empty.</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_languages_colors</code></h4></td>
    <td rowspan="2"><p>Custom languages colors</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>array</code>
<i>(comma-separated)</i>
<br>
<b>default:</b> github<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_languages_aliases</code></h4></td>
    <td rowspan="2"><p>Custom languages names</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>string</code>
<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_languages_sections</code></h4></td>
    <td rowspan="2"><p>Displayed sections</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">🌐 Web instances must configure <code>settings.json</code><br>
<b>type:</b> <code>array</code>
<i>(comma-separated)</i>
<br>
<b>default:</b> most-used<br>
<b>allowed values:</b><ul><li>most-used</li><li>recently-used</li></ul></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_languages_details</code></h4></td>
    <td rowspan="2"><p>Additional details</p>
<p>Note that <code>lines</code> is only available when <code>plugin_languages_indepth</code> is enabled</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">🌐 Web instances must configure <code>settings.json</code><br>
<b>type:</b> <code>array</code>
<i>(comma-separated)</i>
<br>
<b>allowed values:</b><ul><li>bytes-size</li><li>percentage</li><li>lines</li></ul></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_languages_indepth</code></h4></td>
    <td rowspan="2"><p>Indepth mode (⚠️ read documentation first)</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">🌐 Web instances must configure <code>settings.json</code><br>
<b>type:</b> <code>boolean</code>
<br>
<b>default:</b> false<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_languages_analysis_timeout</code></h4></td>
    <td rowspan="2"><p>Indepth mode - Analysis timeout</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">🌐 Web instances must configure <code>settings.json</code><br>
<b>type:</b> <code>number</code>
<i>(1 ≤
𝑥
≤ 30)</i>
<br>
<b>default:</b> 15<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_languages_categories</code></h4></td>
    <td rowspan="2"><p>Indepth mode - Displayed categories (most-used section)</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">🌐 Web instances must configure <code>settings.json</code><br>
<b>type:</b> <code>array</code>
<i>(comma-separated)</i>
<br>
<b>default:</b> markup, programming<br>
<b>allowed values:</b><ul><li>data</li><li>markup</li><li>programming</li><li>prose</li></ul></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_languages_recent_categories</code></h4></td>
    <td rowspan="2"><p>Indepth mode - Displayed categories (recently-used section)</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">🌐 Web instances must configure <code>settings.json</code><br>
<b>type:</b> <code>array</code>
<i>(comma-separated)</i>
<br>
<b>default:</b> markup, programming<br>
<b>allowed values:</b><ul><li>data</li><li>markup</li><li>programming</li><li>prose</li></ul></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_languages_recent_load</code></h4></td>
    <td rowspan="2"><p>Events to load (recently-used section)</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">🌐 Web instances must configure <code>settings.json</code><br>
<b>type:</b> <code>number</code>
<i>(100 ≤
𝑥
≤ 1000)</i>
<br>
<b>default:</b> 300<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_languages_recent_days</code></h4></td>
    <td rowspan="2"><p>Events maximum age (day, recently-used section)</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">🌐 Web instances must configure <code>settings.json</code><br>
<b>type:</b> <code>number</code>
<i>(0 ≤
𝑥
≤ 365)</i>
<br>
<b>zero behaviour:</b> disable</br>
<b>default:</b> 14<br></td>
  </tr>
</table>
<!--/options-->

## 🔎 `indepth` mode

The default algorithm use the top languages provided of each repository you contributed to.
When working in collaborative projects with a lot of people, these numbers may be less representative of your actual work.

The `plugin_languages_indepth` option lets you use a more advanced algorithm for more accurates statistics.
Under the hood, it will clone your repositories, run [linguist-js](https://github.com/Nixinova/Linguist) (a JavaScript port of [GitHub linguist](https://github.com/github/linguist)) and iterate over patches matching your `commits_authoring` setting.

Since git lets you use any email and username for commits, *metrics* may not be able to detect a commit ownership if it isn't the same as your GitHub personal data. By default, it will use your GitHub username, but you can configure additional matching usernames and email addresses using `commits_authoring` option.

*Example: configuring `indepth` mode*
```yml
- uses: lowlighter/metrics@latest
  with:
    plugin_languages: yes
    plugin_languages_indepth: yes
    commits_authoring: firstname lastname, username, username@users.noreply.github.com
```

> 💡 This feature unlocks the `lines` option in `plugin_languages_details`

> ⚠️ This feature significantly increase workflow time

> ⚠️ Since this mode iterates over **each commit of each repository**, it is not suited for large code base, especially those with a large amount of commits and the ones containing binaries. While `plugin_languages_analysis_timeout` can be used to increase the default timeout for analysis, please be responsible and keep this feature disabled if it cannot work on your account to save GitHub resources and our planet 🌏

> ⚠️ Although *metrics* does not send any code to external sources, repositories are temporarily cloned on the GitHub Action runner. It is advised to keep this option disabled when working with sensitive data or company code. Use at your own risk, *metrics* and its authors **cannot** be held responsible for any resulting code leaks. Source code is available for auditing at [analyzers.mjs](/source/plugins/languages/analyzers.mjs).

> 🌐 Web instances must enable this feature in `settings.json`

## 📅 Recently used languages

This feature uses a similar algorithm as `indepth` mode, but uses patches from your events feed instead.
It will fetch a specified amount of recent push events and perform linguistic analysis on it.

> ⚠️ Note that *metrics* won't be able to use more events than GitHub API is able to provide

*Example: display recently used languages from 400 GitHub events from last 2 weeks*
```yml
- uses: lowlighter/metrics@latest
  with:
    plugin_languages: yes
    plugin_languages_sections: recently-used
    plugin_languages_recent_load: 400
    plugin_languages_recent_days: 14
```

> 🌐 Web instances must enable this feature in `settings.json`

## 🥽 Controling which languages are displayed

Several options lets you customize which languages should be displayed.
It is possible to ignore completely languages or those lower than a given threshold, skip repositories, and filter by language categories.

*Example: hide HTML and CSS languages, skip lowlighter/metrics repository*
```yml
- uses: lowlighter/metrics@latest
  with:
    plugin_languages: yes
    plugin_languages_ignored: html, css
    plugin_languages_skipped: lowlighter/metrics
```

*Example: hide languages with less than 2% usage*
```yml
- uses: lowlighter/metrics@latest
  with:
    plugin_languages: yes
    plugin_languages_threshold: 2%
```

> 💡 The threshold feature will automatically scale remaining languages so the total percentage is always 100%. However, other stats like bytes count and lines are not affected.

When using `indepth` mode, it is possible to hide languages per category.
Supported categories are `data`, `markup`, `programming` and `prose`.

*Example: hide data and prose languages from stats*
```yml
- uses: lowlighter/metrics@latest
  with:
    plugin_languages: yes
    plugin_languages_categories: data, prose
    plugin_languages_recent_categories: data, prose
```

## 🎨 Using custom colors

The plugin uses GitHub language colors, but it may be hard to distinguish them depending on which languages you use.
It is possible to use custom colors using `plugin_languages_colors` option.

The following syntaxes are supported:
- A predefined set from [colorsets.json](colorsets.json) *(support limited to 8 languages max)*
- `${language}:${color}` to change the color of a language *(case insensitive)*
- `${n}:${color}` to change the color of the the n-th language

Both hexadecimal and [named color](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value) are supported.

*Example: using a predefined color set*
```yml
- uses: lowlighter/metrics@latest
  with:
    plugin_languages: yes
    plugin_languages_colors: rainbow
    plugin_languages_limit: 8
```

*Example: setting JavaScript to red, the first language to blue and the second one to `#ff00aa`*
```yml
- uses: lowlighter/metrics@latest
  with:
    plugin_languages: yes
    plugin_languages_colors: javascript:red, 0:blue, 1:#ff00aa
```

## ✍️ Using custom languages name

This plugin is limited by [GitHub linguist](https://github.com/github/linguist) capabilities, meaning that some languages may be mislabeled in some cases.

To mitigate this, it is possible to use `plugin_languages_aliases` option and provide a list of overrides using the following syntax: `${language}:${alias}` *(case insensitive)*.

*Example: display JavaScript as JS and TypeScript as TS*
```yml
- uses: lowlighter/metrics@latest
  with:
    plugin_languages: yes
    plugin_languages_aliases: javascript:JS typescript:TS
```

## ℹ️ Examples workflows

<!--examples-->
```yaml
name: Most used
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.languages.svg
  token: ${{ secrets.METRICS_TOKEN }}
  base: ""
  plugin_languages: yes
  plugin_languages_ignored: >-
    html, css, tex, less, dockerfile, makefile, qmake, lex, cmake, shell,
    gnuplot
  plugin_languages_limit: 4

```
```yaml
name: Most used (with details)
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.languages.details.svg
  token: ${{ secrets.METRICS_TOKEN }}
  base: ""
  plugin_languages: yes
  plugin_languages_ignored: >-
    html, css, tex, less, dockerfile, makefile, qmake, lex, cmake, shell,
    gnuplot
  plugin_languages_details: bytes-size, percentage
  plugin_languages_limit: 4

```
```yaml
name: Recently used
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.languages.recent.svg
  token: ${{ secrets.METRICS_TOKEN }}
  base: ""
  plugin_languages: yes
  plugin_languages_ignored: >-
    html, css, tex, less, dockerfile, makefile, qmake, lex, cmake, shell,
    gnuplot
  plugin_languages_sections: recently-used
  plugin_languages_details: bytes-size, percentage
  plugin_languages_limit: 4

```
```yaml
name: Indepth analysis
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.languages.indepth.svg
  token: ${{ secrets.METRICS_TOKEN }}
  base: ""
  plugin_languages: yes
  plugin_languages_ignored: >-
    html, css, tex, less, dockerfile, makefile, qmake, lex, cmake, shell,
    gnuplot
  plugin_languages_indepth: yes
  plugin_languages_details: lines, bytes-size
  plugin_languages_limit: 4
  plugin_languages_analysis_timeout: 15

```
<!--/examples-->
