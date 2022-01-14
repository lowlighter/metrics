### ✨ Stargazers over last weeks

The *stargazers* plugin displays your stargazers evolution across all of your repositories over the last two weeks.

<table>
  <td align="center">
    <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.stargazers.svg">
    <img width="900" height="1" alt="">
  </td>
</table>

#### ➡️ Available options

<!--options-->
| Option | Type *(format)* **[default]** *{allowed values}* | Description |
| ------ | -------------------------------- | ----------- |
| `plugin_stargazers` | `boolean` **[no]** | Display stargazers metrics |


Legend for option icons:
* 🔐 Value should be stored in repository secrets
* ✨ New feature currently in testing on `master`/`main`
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