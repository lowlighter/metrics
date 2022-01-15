### 📓 Repositories

The *repositories* plugin can display a list of chosen featured repositories.

<table>
  <td align="center">
    <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.repositories.svg">
    <img width="900" height="1" alt="">
  </td>
</table>

It is mostly intended for external usage as [pinned repositories](https://www.google.com/search?client=firefox-b-d&q=github+pinned+repositories) is probably a better alternative if you want to embed them on your profile.

Because of limitations of using SVG inside of `<img>` tags, people won't be able to click on it.

#### ➡️ Available options

<!--options-->
<table>
  <tr>
    <td align="center" nowrap="nowrap">Type</i></td><td align="center" nowrap="nowrap">Description</td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_repositories</code></td>
    <td rowspan="2">Display chosen featured repositories<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_repositories_featured</code></td>
    <td rowspan="2">List of repositories to display<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>array</code>
<i>(comma-separated)</i>
<br></td>
  </tr>
</table>
<!--/options-->

*[→ Full specification](metadata.yml)*

#### ℹ️ Examples workflows

<!--examples-->
```yaml
name: Featured repositories
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.repositories.svg
  token: ${{ secrets.METRICS_TOKEN }}
  base: ''
  plugin_repositories: 'yes'
  plugin_repositories_featured: lowlighter/metrics

```
<!--/examples-->