<!--header-->
<table>
  <tr><td colspan="2"><a href="/README.md#-plugins">← Back to plugins index</a></td></tr>
  <tr><th colspan="2"><h3>🕹️ Steam</h3></th></tr>
  <tr><td colspan="2" align="center"><p>This plugin can display your player profile and played games from your Steam account.</p>
</td></tr>
  <tr><th>⚠️ Disclaimer</th><td><p>This plugin is not affiliated, associated, authorized, endorsed by, or in any way officially connected with <a href="https://store.steampowered.com">Steam</a>.
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
    <td><code>🗝️ plugin_steam_token</code></td>
  </tr>
  <tr>
    <td colspan="2" align="center">
      <details open><summary>Recently played games</summary><img src="https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.steam.svg" alt=""></img></details>
      <details><summary>Profile and detailed game history</summary><img src="https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.steam.full.svg" alt=""></img></details>
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
    <td nowrap="nowrap"><h4><code>plugin_steam</code></h4></td>
    <td rowspan="2"><p>Enable steam plugin</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_steam_token</code></h4></td>
    <td rowspan="2"><p>Steam token</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">🔐 Token<br>
🌐 Web instances must configure <code>settings.json</code>:
<ul>
<li><i>metrics.api.steam</i></li>
</ul>
<b>type:</b> <code>token</code>
<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_steam_sections</code></h4></td>
    <td rowspan="2"><p>Displayed sections</p>
<ul>
<li><code>player</code>: display profile</li>
<li><code>most-played</code>: display most played games</li>
<li><code>recently-played</code>: display recently played games</li>
</ul>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>array</code>
<i>(comma-separated)</i>
<br>
<b>default:</b> player, most-played, recently-played<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_steam_user</code></h4></td>
    <td rowspan="2"><p>Steam user id</p>
<p>This can be found on your Steam user account details</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">⏯️ Cannot be preset<br>
<b>type:</b> <code>string</code>
<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_steam_games_ignored</code></h4></td>
    <td rowspan="2"><p>Ignored games</p>
<p>Use App id as they are referenced in Steam catalog</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>array</code>
<i>(comma-separated)</i>
<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_steam_games_limit</code></h4></td>
    <td rowspan="2"><p>Display limit (Most played games)</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>number</code>
<i>(0 ≤
𝑥)</i>
<br>
<b>zero behaviour:</b> disable</br>
<b>default:</b> 1<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_steam_recent_games_limit</code></h4></td>
    <td rowspan="2"><p>Display limit (Recently played games)</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>number</code>
<i>(0 ≤
𝑥)</i>
<br>
<b>zero behaviour:</b> disable</br>
<b>default:</b> 1<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_steam_achievements_limit</code></h4></td>
    <td rowspan="2"><p>Display limit (Games achievements)</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>number</code>
<i>(0 ≤
𝑥)</i>
<br>
<b>default:</b> 2<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_steam_playtime_threshold</code></h4></td>
    <td rowspan="2"><p>Display threshold (Game playtime in hours)</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>number</code>
<i>(0 ≤
𝑥)</i>
<br>
<b>default:</b> 2<br></td>
  </tr>
</table>
<!--/options-->

## 🗝️ Obtaining a *Steam Web API* token

Go to [steamcommunity.com/dev/apikey](https://steamcommunity.com/dev/apikey) to obtain a Steam Web API token:

![Token](/.github/readme/imgs/plugin_steam_webtoken.png)

To retrieve your Steam ID, access your user account on [store.steampowered.com/account](https://store.steampowered.com/account) and copy the identifier located behind the header:

![User ID](/.github/readme/imgs/plugin_steam_userid.png)

## ℹ️ Examples workflows

<!--examples-->
```yaml
name: Recently played games
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.steam.svg
  token: NOT_NEEDED
  base: ""
  plugin_steam_token: ${{ secrets.STEAM_TOKEN }}
  plugin_steam: yes
  plugin_steam_user: "0"
  plugin_steam_sections: recently-played
  plugin_steam_achievements_limit: 0

```
```yaml
name: Profile and detailed game history
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.steam.full.svg
  token: NOT_NEEDED
  base: ""
  plugin_steam_token: ${{ secrets.STEAM_TOKEN }}
  plugin_steam: yes
  plugin_steam_user: "0"

```
<!--/examples-->
