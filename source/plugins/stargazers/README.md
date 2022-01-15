### ✨ Stargazers over last weeks

The *stargazers* plugin displays your stargazers evolution across all of your repositories over the last two weeks.

<table>
  <td align="center">
    <img src="https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.stargazers.svg">
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
    <td nowrap="nowrap"><code>plugin_stargazers</code></td>
    <td rowspan="2">Display stargazers metrics<img width="900" height="1" alt=""></td>
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
name: Last weeks stargazers
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.stargazers.svg
  token: ${{ secrets.METRICS_TOKEN }}
  base: ''
  plugin_stargazers: 'yes'

```
<!--/examples-->