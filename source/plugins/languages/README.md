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
```
