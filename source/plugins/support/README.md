### 💭 GitHub Community Support

The *support* plugin lets you display your statistics from [GitHub Support Community](https://github.community/).

<table>
  <td align="center">
    <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.support.svg">
    <img width="900" height="1" alt="">
  </td>
</table>

An account on [GitHub Support Community](https://github.community/) is required to use this plugin.

#### ➡️ Available options

<!--options-->
| Option | Type *(format)* **[default]** *{allowed values}* | Description |
| ------ | -------------------------------- | ----------- |
| `plugin_support` | `boolean` **[no]** | GitHub Community Support metrics |


<!--/options-->

*[→ Full specification](metadata.yml)*

#### ℹ️ Examples workflows

<!--examples-->
```yaml
name: GitHub Community Support
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.support.svg
  token: NOT_NEEDED
  base: ''
  plugin_support: 'yes'

```
<!--/examples-->