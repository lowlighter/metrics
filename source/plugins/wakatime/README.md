### ⏰ WakaTime plugin

The *wakatime* plugin displays statistics from your [WakaTime](https://wakatime.com) account.

<table>
  <td align="center">
    <img src="https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.wakatime.svg">
    <img width="900" height="1" alt="">
  </td>
</table>

<details>
<summary>💬 Obtaining a WakaTime token</summary>

Create a [WakaTime account](https://wakatime.com) and retrieve your API key in your [Account settings](https://wakatime.com/settings/account).

![WakaTime API token](/.github/readme/imgs/plugin_wakatime_token.png)

Then setup [WakaTime plugins](https://wakatime.com/plugins) to be ready to go!

</details>

#### ➡️ Available options

<!--options-->
<table>
  <tr>
    <td align="center" nowrap="nowrap">Type</i></td><td align="center" nowrap="nowrap">Description</td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_wakatime</code></td>
    <td rowspan="2"><p>Display WakaTime stats</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_wakatime_token</code></td>
    <td rowspan="2"><p>WakaTime API token</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">🔐 Token<br>
<b>type:</b> <code>token</code>
<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_wakatime_days</code></td>
    <td rowspan="2"><p>WakaTime time range</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>string</code>
<br>
<b>default:</b> 7<br>
<b>allowed values:</b><ul><li>7</li><li>30</li><li>180</li><li>365</li></ul></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_wakatime_sections</code></td>
    <td rowspan="2"><p>Sections to display</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>array</code>
<br>
<b>default:</b> time, projects, projects-graphs, languages, languages-graphs, editors, os<br>
<b>allowed values:</b><ul><li>time</li><li>projects</li><li>projects-graphs</li><li>languages</li><li>languages-graphs</li><li>editors</li><li>editors-graphs</li><li>os</li><li>os-graphs</li></ul></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_wakatime_limit</code></td>
    <td rowspan="2"><p>Maximum number of entries to display per graph</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>number</code>
<i>(0 ≤
𝑥)</i>
<br>
<b>default:</b> 5<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_wakatime_url</code></td>
    <td rowspan="2"><p>Address where to reach your Wakatime instance</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>string</code>
<br>
<b>default:</b> https://wakatime.com<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_wakatime_user</code></td>
    <td rowspan="2"><p>Your Wakatime user on the selfhosted Wakapi instance</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>string</code>
<br>
<b>default:</b> current<br></td>
  </tr>
</table>
<!--/options-->

*[→ Full specification](metadata.yml)*

#### ℹ️ Examples workflows

<!--examples-->
```yaml
name: WakaTime
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.wakatime.svg
  token: NOT_NEEDED
  base: ''
  plugin_wakatime: 'yes'
  plugin_wakatime_sections: time, projects, projects-graphs, languages, languages-graphs, editors, os
  plugin_wakatime_token: ${{ secrets.WAKATIME_TOKEN }}

```
<!--/examples-->