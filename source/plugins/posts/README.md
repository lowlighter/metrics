### ✒️ Recent posts

The recent *posts* plugin displays recent articles you wrote on an external source, like [dev.to](https://dev.to).

<table>
  <td align="center">
    <details open><summary>Latest posts</summary>
      <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.posts.svg">
    </details>
    <details><summary>Latest posts width description and cover image</summary>
      <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.posts.full.svg">
    </details>
    <img width="900" height="1" alt="">
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
    plugin_posts_limit: 4            # Limit to 4 posts
    plugin_posts_descriptions: yes   # Display article short description (when supported)
    plugin_posts_covers: yes         # Display article thumbnail (when supported)
```
