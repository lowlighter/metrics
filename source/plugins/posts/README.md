### ✒️ Recent posts

The recent *posts* plugin displays recent articles you wrote on an external source, like [dev.to](https://dev.to).

<table>
  <td>
    <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.posst.svg">
  </td>
</table>

#### ℹ️ Examples workflows

[➡️ Available options for this plugin](metadata.yml)

```yaml
- uses: lowlighter/metrics@latest
  with:
    # ... other options
    plugin_posts: yes
    plugin_posts_source: dev.to      # External source
    plugin_people_user: .github.user # Use same username as GitHub login
```
