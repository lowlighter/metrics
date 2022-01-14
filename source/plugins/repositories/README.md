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
| Option | Type *(format)* **[default]** *{allowed values}* | Description |
| ------ | -------------------------------- | ----------- |
| `plugin_repositories` | `boolean` **[no]** | Display chosen featured repositories |
| `plugin_repositories_featured` | `array` *(comma-separated)* **[]** | List of repositories to display |


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