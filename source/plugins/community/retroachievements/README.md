<!--header-->
<table>
  <tr><td colspan="2"><a href="/README.md#-plugins">← Back to plugins index</a></td></tr>
  <tr><th colspan="2"><h3>🎮 RetroAchievements</h3></th></tr>
  <tr><td colspan="2" align="center"><p>Shows your profile, last played game and achievements from RetroAchievements.</p>
</td></tr>
<tr><th>Authors</th><td><a href="https://github.com/LuanRoger">@LuanRoger</a></td></tr>
  <tr>
    <th rowspan="3">Supported features<br><sub><a href="metadata.yml">→ Full specification</a></sub></th>
    <td><a href="/source/templates/classic/README.md"><code>📗 Classic template</code></a></td>
  </tr>
  <tr>
    <td><code>👤 Users</code></td>
  </tr>
  <tr>
    <td><code>🗝️ plugin_retroachievements_token</code></td>
  </tr>
  <tr>
    <td colspan="2" align="center">
      <img src="https://via.placeholder.com/468x60?text=No%20preview%20available" alt=""></img>
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
    <td nowrap="nowrap"><h4><code>plugin_retroachievements</code></h4></td>
    <td rowspan="2"><p>Enable RetroAchievements plugin</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">✨ On <code>master</code>/<code>main</code><br>
<b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_retroachievements_token</code></h4></td>
    <td rowspan="2"><p>RetroAchievements&#39;s API Token</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">🔐 Token<br>
✨ On <code>master</code>/<code>main</code><br>
<b>type:</b> <code>token</code>
<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_retroachievements_username</code></h4></td>
    <td rowspan="2"><p>RetroAchievements&#39;s Username realted to the API Token</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">✨ On <code>master</code>/<code>main</code><br>
<b>type:</b> <code>string</code>
<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_retroachievements_target</code></h4></td>
    <td rowspan="2"><p>The terget user to show the profile</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">✨ On <code>master</code>/<code>main</code><br>
<b>type:</b> <code>string</code>
<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_retroachievements_showachievements</code></h4></td>
    <td rowspan="2"><p>Show last achievements unlocked</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">✨ On <code>master</code>/<code>main</code><br>
<b>type:</b> <code>boolean</code>
<br>
<b>default:</b> yes<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_retroachievements_lastsin</code></h4></td>
    <td rowspan="2"><p>Number of days to look back for last achievements unlocked</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">✨ On <code>master</code>/<code>main</code><br>
<b>type:</b> <code>number</code>
<br>
<b>default:</b> 7<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_retroachievements_achievementslimit</code></h4></td>
    <td rowspan="2"><p>Number of achievements to show</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">✨ On <code>master</code>/<code>main</code><br>
<b>type:</b> <code>number</code>
<br>
<b>default:</b> 3<br></td>
  </tr>
</table>
<!--/options-->

## ℹ️ Examples workflows

<!--examples-->
```yaml
name: Generate RetroAchievements metrics
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.retroachievements.svg
  token: NOT_NEEDED
  plugin_retroachievements: yes
  plugin_retroachievements_token: ${{ secrets.RETROACHIEVEMENTS_TOKEN }}
  plugin_retroachievements_username: TheROG
  plugin_retroachievements_target: TheROG
  plugin_retroachievements_showachievements: yes
  plugin_retroachievements_lastsin: 2
  plugin_retroachievements_achievementslimit: 5

```
<!--/examples-->
