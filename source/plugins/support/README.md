### 💭 GitHub Community Support

The *support* plugin lets you display your statistics from [GitHub Support Community](https://github.community/).

<table>
  <td align="center">
    <img src="https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.support.svg">
    <img width="900" height="1" alt="">
  </td>
</table>

An account on [GitHub Support Community](https://github.community/) is required to use this plugin.

#### ➡️ Available options

<!--options-->
<table>
  <tr>
    <td align="center" nowrap="nowrap">Type</i></td><td align="center" nowrap="nowrap">Description</td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_support</code></td>
    <td rowspan="2">GitHub Community Support metrics<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
</table>
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