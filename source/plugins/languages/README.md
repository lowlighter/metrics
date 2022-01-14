### 🈷️ Most used languages

The *languages* plugin displays which programming languages you use the most across all your repositories.

<table>
  <td align="center">
    <details open><summary>Indepth analysis (clone and analyze repositories)</summary>
      <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.languages.indepth.svg">
    </details>
    <details open><summary>Recently used (analyze recent activity events)</summary>
      <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.languages.recent.svg">
    </details>
    <details><summary>Default algorithm</summary>
      <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.languages.svg">
    </details>
    <details><summary>Default algorithm (with details)</summary>
      <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.languages.details.svg">
    </details>
    <img width="900" height="1" alt="">
  </td>
</table>

It is possible to use custom colors for languages instead of those provided by GitHub by using `plugin_languages_colors` option.
You can specify either an index with a color, or a language name (case insensitive) with a color.
Colors can be either in hexadecimal format or a [named color](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value).
It is also possible to use a predefined set of colors from [colorsets.json](colorsets.json)

#### Using `indepth` statistics

Languages statistics are computed using the top languages provided by GitHub of each repository you contributed to.
If you work a lot with other people, these numbers may be less representative of your actual work.

The `plugin_languages_indepth` option lets you get more accurate metrics by cloning each repository you contributed to, running [linguist-js](https://github.com/Nixinova/Linguist) and then iterating over patches matching your username from `git log`. This method is slower than the first one.

> ⚠️ Although *metrics* does not send any code to external sources, you must understand that when using this option repositories are cloned locally temporarly on the GitHub Action runner. If you work with sensitive data or company code, it is advised to keep this option disabled. *Metrics* and its authors cannot be held responsible for any resulting code leaks, use at your own risk.
> Source code is available for auditing at [analyzers.mjs](/source/plugins/languages/analyzers.mjs)

> 🔣 On web instances, `indepth` is an extra feature and must be enabled globally in `settings.json`

#### `commits_authoring` option

Since Git lets you use any email and name for commits, metrics may not be able to detect whether you own a commit or not. By default, it'll check whether it matches your GitHub login.

For better results, it's advised to add either your surnames and eventually no-reply email addresses.

#### ➡️ Available options

<!--options-->
<!--/options-->

*[→ Full specification](metadata.yml)*

#### ℹ️ Examples workflows

<!--examples-->
<!--/examples-->
