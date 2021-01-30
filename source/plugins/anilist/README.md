### 🌸 Anilist <sup>🚧 pre-release on <code>@master</code></sup>

The *anilist* plugin lets you display your favorites animes, mangas and characters from your [AniList](https://anilist.co) account.

<table>
  <td align="center">
    <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.anilist.svg">
    <details><summary>Manga version</summary>
      <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.anilist.manga.svg">
    </details>
    <details open><summary>Favorites characters version</summary>
      <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.anilist.characters.svg">
    </details>
    <img width="900" height="1" alt="">
  </td>
</table>

This plugin is composed of the following sections, which can be displayed or hidden through `plugin_anilist_sections` option:
- `favorites` will display your favorites mangas and animes
- `watching` will display animes currently in your watching list
- `reading` will display manga currently in your reading list
- `characters` will display characters you liked

These sections can also be filtered by media type, which can be either `anime`, `manga` or both.

#### ℹ️ Examples workflows

[➡️ Available options for this plugin](metadata.yml)

```yaml
- uses: lowlighter/metrics@latest
  with:
    # ... other options
    plugin_anilist: yes
    plugin_anilist_medias: anime, manga             # Display both animes and mangas
    plugin_anilist_sections: favorites, characters  # Display only favorites and characters sections
    plugin_anilist_limit: 2                         # Limit to 2 entry per section (characters section excluded)
    plugin_anilist_shuffle: yes                     # Shuffle data for more varied outputs
    plugin_anilist_user: .user.login                # Use same username as GitHub login
```
