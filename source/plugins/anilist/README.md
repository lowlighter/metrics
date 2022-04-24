<!--header-->
<table>
  <tr><td colspan="2"><a href="/README.md#-plugins">← Back to plugins index</a></td></tr>
  <tr><th colspan="2"><h3>🌸 Anilist watch list and reading list</h3></th></tr>
  <tr><td colspan="2" align="center"><p>This plugin displays your favorites animes, mangas and characters from your <a href="https://anilist.co">AniList</a> account.</p>
</td></tr>
  <tr>
    <th rowspan="3">Supported features<br><sub><a href="metadata.yml">→ Full specification</a></sub></th>
    <td><a href="/source/templates/classic/README.md"><code>📗 Classic template</code></a></td>
  </tr>
  <tr>
    <td><code>👤 Users</code> <code>👥 Organizations</code></td>
  </tr>
  <tr>
    <td><i>No tokens are required for this plugin</i></td>
  </tr>
  <tr>
    <td colspan="2" align="center">
      <details open><summary>For anime watchers</summary><img src="https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.anilist.svg" alt=""></img></details>
      <details><summary>For manga readers</summary><img src="https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.anilist.manga.svg" alt=""></img></details>
      <details open><summary>For waifus simp</summary><img src="https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.anilist.characters.svg" alt=""></img></details>
      <img width="900" height="1" alt="">
    </td>
  </tr>
</table>
<!--/header-->

## ➡️ Available options

<!--options-->
<table>
  <tr>
    <td align="center" nowrap="nowrap">Option</i></td><td align="center" nowrap="nowrap">Description</td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_anilist</code></h4></td>
    <td rowspan="2"><p>Enable aniList plugin</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_anilist_medias</code></h4></td>
    <td rowspan="2"><p>Display medias types</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>array</code>
<i>(comma-separated)</i>
<br>
<b>default:</b> anime, manga<br>
<b>allowed values:</b><ul><li>anime</li><li>manga</li></ul></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_anilist_sections</code></h4></td>
    <td rowspan="2"><p>Displayed sections</p>
<ul>
<li><code>favorites</code> will display favorites <code>plugin_anilist_medias</code></li>
<li><code>watching</code> will display animes currently in watching list</li>
<li><code>reading</code> will display manga currently in reading list</li>
<li><code>characters</code> will display liked characters</li>
</ul>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>array</code>
<i>(comma-separated)</i>
<br>
<b>default:</b> favorites<br>
<b>allowed values:</b><ul><li>favorites</li><li>watching</li><li>reading</li><li>characters</li></ul></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_anilist_limit</code></h4></td>
    <td rowspan="2"><p>Display limit (medias)</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>number</code>
<i>(0 ≤
𝑥)</i>
<br>
<b>zero behaviour:</b> disable</br>
<b>default:</b> 2<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_anilist_limit_characters</code></h4></td>
    <td rowspan="2"><p>Display limit (characters)</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>number</code>
<i>(0 ≤
𝑥)</i>
<br>
<b>zero behaviour:</b> disable</br>
<b>default:</b> 22<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_anilist_shuffle</code></h4></td>
    <td rowspan="2"><p>Shuffle data for varied outputs</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> yes<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_anilist_user</code></h4></td>
    <td rowspan="2"><p>AniList login</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">⏯️ Cannot be preset<br>
<b>type:</b> <code>string</code>
<br>
<b>default:</b> <code>→ User login</code><br></td>
  </tr>
</table>
<!--/options-->

## ℹ️ Examples workflows

<!--examples-->
```yaml
name: Favorites anime and currently watching
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.anilist.svg
  token: NOT_NEEDED
  base: ""
  plugin_anilist: yes
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
  base: ""
  plugin_anilist: yes
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
  base: ""
  plugin_anilist: yes
  plugin_anilist_sections: characters
  plugin_anilist_limit_characters: 22

```
<!--/examples-->
