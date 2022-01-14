### 💫 Starlists

The *starlists* plugin displays your recently star lists.

<table>
  <td align="center">
    <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.starlists.svg">
    <img width="900" height="1" alt="">
  </td>
</table>

#### ➡️ Available options

<!--options-->
| Option | Type *(format)* **[default]** *{allowed values}* | Description |
| ------ | -------------------------------- | ----------- |
| `plugin_starlists` <sup>✨</sup> | `boolean` **[no]** | Display star lists |
| `plugin_starlists_limit` <sup>✨</sup> | `number` **[2]** *{1 ≤ 𝑥 ≤ 100}* | Number of star lists to display |
| `plugin_starlists_limit_repositories` <sup>✨</sup> | `number` **[2]** *{0 ≤ 𝑥 ≤ 100}* | Number of repositories to display per star lists |
| `plugin_starlists_shuffle_repositories` <sup>✨</sup> | `boolean` **[yes]** | Shuffle displayed repositories |
| `plugin_starlists_ignored` <sup>✨</sup> | `array` *(comma-separated)* **[]** | Star lists to skip |
| `plugin_starlists_only` <sup>✨</sup> | `array` *(comma-separated)* **[]** | Star lists to display |


Legend for option icons:
* ✨ Currently in beta-testing on `master`/`main`
<!--/options-->

*[→ Full specification](metadata.yml)*

#### ℹ️ Examples workflows

<!--examples-->
```yaml
name: Featured star list
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.starlists.svg
  token: ${{ secrets.METRICS_TOKEN }}
  base: ''
  plugin_starlists: 'yes'
  plugin_starlists_limit_repositories: 2
  plugin_starlists_only: 🤘 TC39

```
<!--/examples-->