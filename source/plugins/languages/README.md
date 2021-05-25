### 🈷️ Most used languages

The *languages* plugin displays which programming languages you use the most across all your repositories.

<table>
  <td align="center">
    <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.languages.svg">
    <details open><summary>With both total bytes size and percentage version</summary>
      <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.languages.details.svg">
    </details>
    <img width="900" height="1" alt="">
  </td>
</table>

It is possible to use custom colors for languages instead of those provided by GitHub by using `plugin_languages_colors` option.
You can specify either an index with a color, or a language name (case insensitive) with a color.
Colors can be either in hexadecimal format or a [named color](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value).
It is also possible to use a predefined set of colors from [colorsets.json](colorsets.json)

**Using `indepth` statistics**

Languages statistics are computed using the top languages of each repository you contributed to.
If you work a lot with other people, these numbers may be less representative of your actual work.

The `plugin_languages_indepth` option lets you get more accurate metrics by cloning each repository, running [github/linguist](https://github.com/github/linguist) on it and iterating over patches matching your username from `git log`, but will be **significantly slower**.

> ⚠️ Although *metrics* does not send any code to external sources, you must understand that when using this option repositories are cloned locally temporarly on the GitHub Action runner. If you work with sensitive data or company code, it is advised to keep this option disabled. *Metrics* cannot be held responsible for any eventual code leaks, use at your own risk.
> Source code is available for auditing at [indepth.mjs](/source/plugins/languages/indepth.mjs)

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
    plugin_languages_indepth: no                                 # Get indepth stats (see documentation before enabling)
```
