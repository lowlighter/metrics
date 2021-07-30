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

#### ℹ️ Examples workflows

[➡️ Available options for this plugin](metadata.yml)

```yaml
- uses: lowlighter/metrics@latest
  with:
    # ... other options
    plugin_repositories: yes
    plugin_repositories_list: lowlighter/metrics, denoland/deno  # List of repositories you want to feature
```