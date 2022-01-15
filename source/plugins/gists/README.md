### 🎫 Gists

The *gists* plugin displays your [gists](https://gist.github.com) metrics.

<table>
  <td align="center">
    <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.gists.svg">
    <img width="900" height="1" alt="">
  </td>
</table>

#### ➡️ Available options

<!--options-->
<table>
  <tr>
    <td align="center" nowrap="nowrap">Type</i></td><td align="center" nowrap="nowrap">Description</td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_gists</code></td>
    <td rowspan="2">Display gists metrics<img width="900" height="1" alt=""></td>
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
name: Gists
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.gists.svg
  token: ${{ secrets.METRICS_TOKEN }}
  base: ''
  plugin_gists: 'yes'

```
<!--/examples-->