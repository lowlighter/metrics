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

#### ➡️ Available options

<!--options-->
| Option | Type *(format)* **[default]** *{allowed values}* | Description |
| ------ | -------------------------------- | ----------- |
| `plugin_posts` | `boolean` **[no]** | Display recent posts |
| `plugin_posts_source` | `string` **[]** *{"dev.to", "hashnode"}* | Posts external source |
| `plugin_posts_descriptions` | `boolean` **[no]** | Display posts descriptions |
| `plugin_posts_covers` | `boolean` **[no]** | Display posts cover images |
| `plugin_posts_limit` | `number` **[4]** *{1 ≤ 𝑥 ≤ 30}* | Maximum number of posts to display |
| `plugin_posts_user` | `string` **[.user.login]** | Posts external source username |


Legend for option icons:
* 🔐 Value should be stored in repository secrets
* ✨ New feature currently in testing on `master`/`main`
<!--/options-->

*[→ Full specification](metadata.yml)*

#### ℹ️ Examples workflows

<!--examples-->
```yaml
name: Recent posts
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.posts.svg
  token: ${{ secrets.METRICS_TOKEN }}
  base: ''
  plugin_posts: 'yes'
  plugin_posts_source: dev.to

```
```yaml
name: Recent posts with descriptions and cover images
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.posts.full.svg
  token: ${{ secrets.METRICS_TOKEN }}
  base: ''
  plugin_posts: 'yes'
  plugin_posts_source: dev.to
  plugin_posts_descriptions: 'yes'
  plugin_posts_covers: 'yes'

```
<!--/examples-->