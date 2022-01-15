### 🌸 Anilist watch list and reading list"

The *anilist* plugin lets you display your favorites animes, mangas and characters from your [AniList](https://anilist.co) account.

<table>
  <td align="center">
    <details open><summary>For anime watchers</summary>
      <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.anilist.svg">
    </details>
    <details><summary>For manga readers</summary>
      <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.anilist.manga.svg">
    </details>
    <details open><summary>Favorites characters</summary>
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

#### ➡️ Available options

<!--options-->
| Option | Type *(format)* **[default]** *{allowed values}* | Description |
| ------ | -------------------------------- | ----------- |
| `plugin_anilist` | `boolean` **[no]** | Display data from your AniList account |
| `plugin_anilist_medias` | `array` *(comma-separated)* **[anime, manga]** *{"anime", "manga"}* | Medias types to display |
| `plugin_anilist_sections` | `array` *(comma-separated)* **[favorites]** *{"favorites", "watching", "reading", "characters"}* | Sections to display |
| `plugin_anilist_limit` | `number` **[2]** *{0 ≤ 𝑥}* | Maximum number of entries to display per section |
| `plugin_anilist_limit_characters` | `number` **[22]** *{0 ≤ 𝑥}* | Maximum number of entries to display in characters section |
| `plugin_anilist_shuffle` | `boolean` **[yes]** | Shuffle AniList data |
| `plugin_anilist_user` | `string` **[*→ User login*]** | AniList login |


<!--/options-->

*[→ Full specification](metadata.yml)*

#### ℹ️ Examples workflows

<!--examples-->
```yaml
name: Favorites anime and currently watching
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.anilist.svg
  token: NOT_NEEDED
  base: ''
  plugin_anilist: 'yes'
  plugin_anilist_medias: anime
  plugin_anilist_sections: favorites, watching
  plugin_anilist_limit: 1

```
```yaml
name: Favorites manga and currently reading
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.anilist.manga.svg
  token: NOT_NEEDED
  base: ''
  plugin_anilist: 'yes'
  plugin_anilist_medias: manga
  plugin_anilist_sections: favorites, reading
  plugin_anilist_limit: 1

```
```yaml
name: Favorites characters
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.anilist.characters.svg
  token: NOT_NEEDED
  base: ''
  plugin_anilist: 'yes'
  plugin_anilist_sections: characters
  plugin_anilist_limit_characters: 22

```
<!--/examples-->