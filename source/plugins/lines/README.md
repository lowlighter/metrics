### 👨‍💻 Lines of code changed

The *lines* of code plugin displays the number of lines of code you have added and removed across all of your repositories.

<table>
  <td align="center">
    <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.lines.svg">
    <img width="900" height="1" alt="">
  </td>
</table>

#### ➡️ Available options

<!--options-->
| Option | Type *(format)* **[default]** *{allowed values}* | Description |
| ------ | -------------------------------- | ----------- |
| `plugin_lines` | `boolean` **[no]** | Display lines of code metrics |
| `plugin_lines_skipped` <sup>⏩</sup> | `array` *(comma-separated)* **[]** | Repositories to skip |


Legend for option icons:
* ⏩ Value inherits from its related global-level option
<!--/options-->

*[→ Full specification](metadata.yml)*

#### ℹ️ Examples workflows

<!--examples-->
```yaml
name: Lines of code changed
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.lines.svg
  token: ${{ secrets.METRICS_TOKEN }}
  base: repositories
  plugin_lines: 'yes'

```
<!--/examples-->
