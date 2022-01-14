### ♐ Code snippet of the day

> ⚠️ When improperly configured, this plugin could display private code. If you work with sensitive data or company code, it is advised to keep this plugin disabled. *Metrics* and its authors cannot be held responsible for any resulting code leaks, use at your own risk.

Display a random code snippet from your recent activity history.

<table>
  <td align="center">
    <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.code.svg">
    <img width="900" height="1" alt="">
  </td>
</table>

#### ➡️ Available options

<!--options-->
| Option | Type *(format)* **[default]** *{allowed values}* | Description |
| ------ | -------------------------------- | ----------- |
| `plugin_code` | `boolean` **[no]** | Display a random code snippet from recent activity |
| `plugin_code_lines` | `number` **[12]** | Maximum number of line that a code snippet can contain |
| `plugin_code_load` | `number` **[100]** *{100 ≤ 𝑥 ≤ 1000}* | Number of events to load |
| `plugin_code_visibility` | `string` **[public]** *{"public", "all"}* | Set events visibility |
| `plugin_code_skipped` <sup>⏩</sup> | `array` *(comma-separated)* **[]** | Repositories to skip |
| `plugin_code_languages` | `array` *(comma-separated)* **[]** | Restrict code snippet languages |


Legend for option icons:
* ⏩ Value inherits from its related global-level option
<!--/options-->

*[→ Full specification](metadata.yml)*

#### ℹ️ Examples workflows

<!--examples-->
```yaml
name: JavaScript or TypeScript snippet of the day
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.code.svg
  token: ${{ secrets.METRICS_TOKEN }}
  base: ''
  plugin_code: 'yes'
  plugin_code_languages: javascript, typescript
  plugin_code_load: 400

```
<!--/examples-->