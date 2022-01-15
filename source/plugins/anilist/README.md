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
<table>
  <tr>
    <td align="center" nowrap="nowrap">Type</i></td><td align="center" nowrap="nowrap">Description</td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_anilist</code></td>
    <td rowspan="2">Display data from your AniList account<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_anilist_medias</code></td>
    <td rowspan="2">Medias types to display<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>array</code>
<i>(comma-separated)</i>
<br>
<b>default:</b> anime, manga<br>
<b>allowed values:</b><ul><li>anime</li><li>manga</li></ul></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_anilist_sections</code></td>
    <td rowspan="2">Sections to display<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>array</code>
<i>(comma-separated)</i>
<br>
<b>default:</b> favorites<br>
<b>allowed values:</b><ul><li>favorites</li><li>watching</li><li>reading</li><li>characters</li></ul></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_anilist_limit</code></td>
    <td rowspan="2">Maximum number of entries to display per section<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>number</code>
<i>(0 ≤
𝑥)</i>
<br>
<b>default:</b> 2<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_anilist_limit_characters</code></td>
    <td rowspan="2">Maximum number of entries to display in characters section<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>number</code>
<i>(0 ≤
𝑥)</i>
<br>
<b>default:</b> 22<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_anilist_shuffle</code></td>
    <td rowspan="2">Shuffle AniList data<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> yes<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_anilist_user</code></td>
    <td rowspan="2">AniList login<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>string</code>
<br>
<b>default:</b> <code>→ User login</code><br></td>
  </tr>
</table>
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