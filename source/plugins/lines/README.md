### 👨‍💻 Lines of code changed

The *lines* of code plugin displays the number of lines of code you have added and removed across all of your repositories.

<table>
  <td align="center">
    <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.lines.svg">
    <img width="900" height="1" alt="">
  </td>
</table>

#### ℹ️ Examples workflows

[➡️ Available options for this plugin](metadata.yml)

```yaml
- uses: lowlighter/metrics@latest
  with:
    # ... other options
    plugin_lines: yes
    plugin_lines_skipped: repo # List of skipped repositories
```
