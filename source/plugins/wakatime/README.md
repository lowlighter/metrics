<!--header-->
<table>
  <tr><td colspan="2"><a href="/README.md#-plugins">← Back to plugins index</a></td></tr>
  <tr><th colspan="2"><h3>⏰ WakaTime plugin</h3></th></tr>
  <tr><td colspan="2" align="center"><p>This plugin displays statistics from your <a href="https://wakatime.com">WakaTime</a> account.</p>
</td></tr>
  <tr>
    <th rowspan="3">Supported features<br><sub><a href="metadata.yml">→ Full specification</a></sub></th>
    <td><a href="/source/templates/classic/README.md"><code>📗 Classic template</code></a></td>
  </tr>
  <tr>
    <td><code>👤 Users</code></td>
  </tr>
  <tr>
    <td><code>🗝️ plugin_wakatime_token</code></td>
  </tr>
  <tr>
    <td colspan="2" align="center">
      <img src="https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.wakatime.svg" alt=""></img>
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
    <td nowrap="nowrap"><h4><code>plugin_wakatime</code></h4></td>
    <td rowspan="2"><p>Enable wakatime plugin</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_wakatime_token</code></h4></td>
    <td rowspan="2"><p>WakaTime API token</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">🔐 Token<br>
<b>type:</b> <code>token</code>
<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_wakatime_days</code></h4></td>
    <td rowspan="2"><p>Time range</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>string</code>
<br>
<b>default:</b> 7<br>
<b>allowed values:</b><ul><li>7</li><li>30</li><li>180</li><li>365</li></ul></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_wakatime_sections</code></h4></td>
    <td rowspan="2"><p>Displayed sections</p>
<ul>
<li><code>time</code>: show total coding time and daily average</li>
<li><code>projects</code>: show most time spent project</li>
<li><code>projects-graphs</code>: show most time spent projects graphs</li>
<li><code>languages</code>: show most language</li>
<li><code>languages-graphs</code>: show languages graphs</li>
<li><code>editors</code>: show most used code editor</li>
<li><code>editors-graphs</code>: show code editors graphs</li>
<li><code>os</code>: show most used operating system</li>
<li><code>os-graphs</code>: show code operating systems graphs</li>
</ul>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>array</code>
<br>
<b>default:</b> time, projects, projects-graphs, languages, languages-graphs, editors, os<br>
<b>allowed values:</b><ul><li>time</li><li>projects</li><li>projects-graphs</li><li>languages</li><li>languages-graphs</li><li>editors</li><li>editors-graphs</li><li>os</li><li>os-graphs</li></ul></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_wakatime_limit</code></h4></td>
    <td rowspan="2"><p>Display limit (per graph)</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>number</code>
<i>(0 ≤
𝑥)</i>
<br>
<b>zero behaviour:</b> disable</br>
<b>default:</b> 5<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_wakatime_url</code></h4></td>
    <td rowspan="2"><p>WakaTime url</p>
<p>Also compatible with self-hosted instance (<a href="https://github.com/muety/wakapi">wakapi</a>)</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>string</code>
<br>
<b>default:</b> https://wakatime.com<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_wakatime_user</code></h4></td>
    <td rowspan="2"><p>WakaTime username</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">⏯️ Cannot be preset<br>
<b>type:</b> <code>string</code>
<br>
<b>default:</b> current<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_wakatime_languages_other</code></h4></td>
    <td rowspan="2"><p>Include other languages</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_wakatime_languages_ignored</code></h4></td>
    <td rowspan="2"><p>Ignored languages</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">✨ On <code>master</code>/<code>main</code><br>
<b>type:</b> <code>array</code>
<i>(comma-separated)</i>
<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_wakatime_repositories_visibility</code></h4></td>
    <td rowspan="2"><p>Repositories visibility</p>
<p>Lets you hide private repositories.</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">✨ On <code>master</code>/<code>main</code><br>
<b>type:</b> <code>string</code>
<br>
<b>default:</b> all<br>
<b>allowed values:</b><ul><li>public</li><li>all</li></ul></td>
  </tr>
</table>
<!--/options-->

## 🗝️ Obtaining a WakaTime token

Create a [WakaTime account](https://wakatime.com) and retrieve API key in [Account settings](https://wakatime.com/settings/account).

![WakaTime API token](/.github/readme/imgs/plugin_wakatime_token.png)

Then setup [WakaTime plugins](https://wakatime.com/plugins) to be ready to go!

## ℹ️ Examples workflows

<!--examples-->
```yaml
name: WakaTime
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.wakatime.svg
  token: NOT_NEEDED
  base: ""
  plugin_wakatime: yes
  plugin_wakatime_sections: time, projects, projects-graphs, languages, languages-graphs, editors, os
  plugin_wakatime_token: ${{ secrets.WAKATIME_TOKEN }}

```
<!--/examples-->