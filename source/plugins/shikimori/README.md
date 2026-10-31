<!--header-->
<table>
  <tr><td colspan="2"><a href="/README.md#-plugins">← Back to plugins index</a></td></tr>
  <tr><th colspan="2"><h3>🎴 Shikimori watch list and reading list</h3></th></tr>
  <tr><td colspan="2" align="center"><p>This plugin displays favorites animes, mangas, characters and lists from a <a href="https://shikimori.io">Shikimori</a> account.</p>
</td></tr>
  <tr><th>⚠️ Disclaimer</th><td><p>This plugin is not affiliated, associated, authorized, endorsed by, or in any way officially connected with <a href="https://shikimori.io">Shikimori</a>.
All product and company names are trademarks™ or registered® trademarks of their respective holders.</p>
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
      <details open><summary>Favorites and watching</summary><img src="https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.shikimori.svg" alt=""></img></details>
      <details><summary>Favorites manga and ranobe</summary><img src="https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.shikimori.manga.svg" alt=""></img></details>
      <details open><summary>Achievements and stats</summary><img src="https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.shikimori.achievements.svg" alt=""></img></details>
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
    <td nowrap="nowrap"><h4><code>plugin_shikimori</code></h4></td>
    <td rowspan="2"><p>Enable Shikimori plugin</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">✨ On <code>master</code>/<code>main</code><br>
🌐 Web instances must configure <code>settings.json</code>:
<ul>
<li><i>metrics.run.puppeteer.scrapping</i></li>
</ul>
<b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_shikimori_user</code></h4></td>
    <td rowspan="2"><p>Shikimori login</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">⏯️ Cannot be preset<br>
✨ On <code>master</code>/<code>main</code><br>
<b>type:</b> <code>string</code>
<br>
<b>default:</b> <code>→ User login</code><br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_shikimori_medias</code></h4></td>
    <td rowspan="2"><p>Medias types</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">✨ On <code>master</code>/<code>main</code><br>
<b>type:</b> <code>array</code>
<i>(comma-separated)</i>
<br>
<b>default:</b> anime, manga<br>
<b>allowed values:</b><ul><li>anime</li><li>manga</li><li>ranobe</li></ul></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_shikimori_sections</code></h4></td>
    <td rowspan="2"><p>Displayed sections</p>
<ul>
<li><code>favorites</code> will display favorites from <code>plugin_shikimori_medias</code></li>
<li><code>characters</code> will display liked characters</li>
<li><code>people</code> will display liked people (see <code>plugin_shikimori_people</code>)</li>
<li><code>lists</code> will display medias lists (see <code>plugin_shikimori_statuses</code>)</li>
<li><code>stats</code> will display statistics about watched/read medias</li>
<li><code>achievements</code> will display earned achievements</li>
<li><code>genres</code> will display most enjoyed genres</li>
</ul>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">✨ On <code>master</code>/<code>main</code><br>
<b>type:</b> <code>array</code>
<i>(comma-separated)</i>
<br>
<b>default:</b> favorites<br>
<b>allowed values:</b><ul><li>favorites</li><li>characters</li><li>people</li><li>lists</li><li>stats</li><li>achievements</li><li>genres</li></ul></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_shikimori_statuses</code></h4></td>
    <td rowspan="2"><p>Medias lists statuses to display (requires <code>lists</code> section)</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">✨ On <code>master</code>/<code>main</code><br>
<b>type:</b> <code>array</code>
<i>(comma-separated)</i>
<br>
<b>default:</b> watching<br>
<b>allowed values:</b><ul><li>planned</li><li>watching</li><li>rewatching</li><li>completed</li><li>on_hold</li><li>dropped</li></ul></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_shikimori_people</code></h4></td>
    <td rowspan="2"><p>Liked people strips to display (requires <code>people</code> section)</p>
<p>Display order follows the order of this input</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">✨ On <code>master</code>/<code>main</code><br>
<b>type:</b> <code>array</code>
<i>(comma-separated)</i>
<br>
<b>default:</b> people, seyu<br>
<b>allowed values:</b><ul><li>people</li><li>seyu</li><li>mangakas</li><li>producers</li></ul></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_shikimori_achievements_filter</code></h4></td>
    <td rowspan="2"><p>Achievements filter (requires <code>achievements</code> section)</p>
<ul>
<li><code>earned</code> will only display earned achievements</li>
<li><code>all</code> will display all achievements, including unearned ones</li>
</ul>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">✨ On <code>master</code>/<code>main</code><br>
<b>type:</b> <code>string</code>
<br>
<b>default:</b> earned<br>
<b>allowed values:</b><ul><li>earned</li><li>all</li></ul></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_shikimori_sort</code></h4></td>
    <td rowspan="2"><p>Sorting method for medias and favorites</p>
<ul>
<li><code>site</code> will use Shikimori website ordering</li>
<li><code>score</code> will sort by score</li>
<li><code>release</code> will sort by release year</li>
<li><code>updated</code> will sort by last update (favorites fall back to website ordering)</li>
</ul>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">✨ On <code>master</code>/<code>main</code><br>
<b>type:</b> <code>string</code>
<br>
<b>default:</b> site<br>
<b>allowed values:</b><ul><li>site</li><li>score</li><li>release</li><li>updated</li></ul></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_shikimori_title_language</code></h4></td>
    <td rowspan="2"><p>Title language used for medias and achievement names</p>
<ul>
<li><code>english</code></li>
<li><code>russian</code></li>
<li><code>japanese</code></li>
</ul>
<p>Falls back to the default name when no title is available in the selected language
Achievements use English titles unless Russian is selected, falling back to their identifier</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">✨ On <code>master</code>/<code>main</code><br>
<b>type:</b> <code>string</code>
<br>
<b>default:</b> english<br>
<b>allowed values:</b><ul><li>english</li><li>russian</li><li>japanese</li></ul></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_shikimori_score</code></h4></td>
    <td rowspan="2"><p>Displayed scores on medias cards</p>
<ul>
<li><code>community</code> will display Shikimori community score</li>
<li><code>user</code> will display user score (only available in lists)</li>
<li><code>both</code> will display both scores</li>
<li><code>off</code> will hide scores</li>
</ul>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">✨ On <code>master</code>/<code>main</code><br>
<b>type:</b> <code>string</code>
<br>
<b>default:</b> community<br>
<b>allowed values:</b><ul><li>community</li><li>user</li><li>both</li><li>off</li></ul></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_shikimori_limit</code></h4></td>
    <td rowspan="2"><p>Display limit (medias)</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">✨ On <code>master</code>/<code>main</code><br>
<b>type:</b> <code>number</code>
<i>(0 ≤
𝑥)</i>
<br>
<b>zero behaviour:</b> disable</br>
<b>default:</b> 2<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_shikimori_limit_characters</code></h4></td>
    <td rowspan="2"><p>Display limit (characters)</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">✨ On <code>master</code>/<code>main</code><br>
<b>type:</b> <code>number</code>
<i>(0 ≤
𝑥)</i>
<br>
<b>zero behaviour:</b> disable</br>
<b>default:</b> 22<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_shikimori_limit_people</code></h4></td>
    <td rowspan="2"><p>Display limit (people, per strip)</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">✨ On <code>master</code>/<code>main</code><br>
<b>type:</b> <code>number</code>
<i>(0 ≤
𝑥)</i>
<br>
<b>zero behaviour:</b> disable</br>
<b>default:</b> 22<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_shikimori_limit_achievements</code></h4></td>
    <td rowspan="2"><p>Display limit (achievements)</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">✨ On <code>master</code>/<code>main</code><br>
<b>type:</b> <code>number</code>
<i>(0 ≤
𝑥)</i>
<br>
<b>zero behaviour:</b> disable</br>
<b>default:</b> 22<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_shikimori_shuffle</code></h4></td>
    <td rowspan="2"><p>Shuffle data</p>
<p>Can be used to create varied outputs</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">✨ On <code>master</code>/<code>main</code><br>
<b>type:</b> <code>boolean</code>
<br>
<b>default:</b> yes<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_shikimori_display_characters</code></h4></td>
    <td rowspan="2"><p>Displayed fields on characters strip (requires <code>characters</code> section)</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">✨ On <code>master</code>/<code>main</code><br>
<b>type:</b> <code>array</code>
<i>(comma-separated)</i>
<br>
<b>default:</b> name, artwork<br>
<b>allowed values:</b><ul><li>name</li><li>artwork</li></ul></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_shikimori_display_people</code></h4></td>
    <td rowspan="2"><p>Displayed fields on people strips (requires <code>people</code> section)</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">✨ On <code>master</code>/<code>main</code><br>
<b>type:</b> <code>array</code>
<i>(comma-separated)</i>
<br>
<b>default:</b> name, artwork<br>
<b>allowed values:</b><ul><li>name</li><li>artwork</li></ul></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_shikimori_display_favorites</code></h4></td>
    <td rowspan="2"><p>Displayed fields on favorites medias cards</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">✨ On <code>master</code>/<code>main</code><br>
<b>type:</b> <code>array</code>
<i>(comma-separated)</i>
<br>
<b>default:</b> cover, title, description, score, year, status, genres, type<br>
<b>allowed values:</b><ul><li>cover</li><li>title</li><li>description</li><li>score</li><li>progress</li><li>user_score</li><li>year</li><li>status</li><li>genres</li><li>studio</li><li>type</li></ul></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_shikimori_display_lists</code></h4></td>
    <td rowspan="2"><p>Displayed fields on lists medias cards</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">✨ On <code>master</code>/<code>main</code><br>
<b>type:</b> <code>array</code>
<i>(comma-separated)</i>
<br>
<b>default:</b> cover, title, description, score, user_score, progress, year, status, genres, type<br>
<b>allowed values:</b><ul><li>cover</li><li>title</li><li>description</li><li>score</li><li>progress</li><li>user_score</li><li>year</li><li>status</li><li>genres</li><li>studio</li><li>type</li></ul></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_shikimori_display_stats</code></h4></td>
    <td rowspan="2"><p>Displayed fields on statistics block (requires <code>stats</code> section)</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">✨ On <code>master</code>/<code>main</code><br>
<b>type:</b> <code>array</code>
<i>(comma-separated)</i>
<br>
<b>default:</b> summary, statuses, distribution, activity<br>
<b>allowed values:</b><ul><li>summary</li><li>statuses</li><li>distribution</li><li>activity</li></ul></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_shikimori_display_achievements</code></h4></td>
    <td rowspan="2"><p>Displayed fields on achievements block (requires <code>achievements</code> section)</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">✨ On <code>master</code>/<code>main</code><br>
<b>type:</b> <code>array</code>
<i>(comma-separated)</i>
<br>
<b>default:</b> icons, chips<br>
<b>allowed values:</b><ul><li>icons</li><li>chips</li></ul></td>
  </tr>
</table>
<!--/options-->

## 🖼️ Example usage

<!--examples-->
```yaml
name: Favorites anime and currently watching
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.shikimori.svg
  token: NOT_NEEDED
  base: ""
  plugin_shikimori: yes
  plugin_shikimori_user: whynothacked
  plugin_shikimori_medias: anime
  plugin_shikimori_sections: favorites, lists
  plugin_shikimori_statuses: watching
  plugin_shikimori_limit: 2

```
```yaml
name: Favorites manga and ranobe
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.shikimori.manga.svg
  token: NOT_NEEDED
  base: ""
  plugin_shikimori: yes
  plugin_shikimori_user: whynothacked
  plugin_shikimori_medias: manga, ranobe
  plugin_shikimori_sections: favorites
  plugin_shikimori_limit: 2

```
```yaml
name: Achievements and stats
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.shikimori.achievements.svg
  token: NOT_NEEDED
  base: ""
  plugin_shikimori: yes
  plugin_shikimori_user: whynothacked
  plugin_shikimori_sections: achievements, stats
  plugin_shikimori_limit_achievements: 16

```
<!--/examples-->
