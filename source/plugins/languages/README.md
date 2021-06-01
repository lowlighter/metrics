### 🈷️ Most used languages

The *languages* plugin displays which programming languages you use the most across all your repositories.

<table>
  <td align="center">
    <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.languages.svg">
    <details open><summary>With both total bytes size and percentage version</summary>
      <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.languages.details.svg">
    </details>
    <details open><summary>Recently used version (based on recent activity)</summary>
      <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.languages.recent.svg">
    </details>
    <details><summary>Indepth analysis (clone, analyze and extract commits)</summary>
      <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.languages.indepth.svg">
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

The `plugin_languages_indepth` option lets you get more accurate metrics by cloning each repository you contributed to, running [github/linguist](https://github.com/github/linguist) on it and then iterating over patches matching your username from `git log`. This method is slower than the first one.

> ⚠️ Although *metrics* does not send any code to external sources, you must understand that when using this option repositories are cloned locally temporarly on the GitHub Action runner. If you work with sensitive data or company code, it is advised to keep this option disabled. *Metrics* cannot be held responsible for any eventual code leaks, use at your own risk.
> Source code is available for auditing at [analyzers.mjs](/source/plugins/languages/analyzers.mjs)

#### `commits_authoring` option

Since Git lets you use any email and name for commits, metrics may not be able to detect whether you own a commit or not. By default, it'll check whether it matches your GitHub login.

For better results, it's advised to add either your surnames and eventually no-reply email addresses.

#### ℹ️ Examples workflows

[➡️ Available options for this plugin](metadata.yml)

```yaml
- uses: lowlighter/metrics@latest
  with:
    # ... other options
    plugin_languages: yes
    plugin_languages_ignored: html, css                          # List of languages to ignore
    plugin_languages_skipped: my-test-repo                       # List of repositories to skip
    plugin_languages_colors: "0:orange, javascript:#ff0000, ..." # Make most used languages orange and JavaScript red
    plugin_languages_details: bytes-size, percentage             # Additionally display total bytes size and percentage
    plugin_languages_threshold: 2%                               # Hides all languages less than 2%
    plugin_languages_limit: 8                                    # Display up to 8 languages
    plugin_languages_sections: most-used, recently-used          # Display most used and recently used languages stats
    plugin_languages_indepth: no                                 # Get indepth stats (see documentation before enabling)
    plugin_languages_recent_load: 500                            # Load up to 500 events to compute recently used stats
    plugin_languages_recent_days: 7                              # Limit recently used stats to last week
    commits_authoring: lowlighter@users.noreply.github.com       # Surnames or email addresses used to identify your commits
```
