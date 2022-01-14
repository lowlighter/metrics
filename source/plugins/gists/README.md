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
| Option | Type *(format)* **[default]** *{allowed values}* | Description |
| ------ | -------------------------------- | ----------- |
| `plugin_gists` | `boolean` **[no]** | Display gists metrics |


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