### ⏰ WakaTime plugin

The *wakatime* plugin displays statistics from your [WakaTime](https://wakatime.com) account.

<table>
  <td align="center">
    <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.wakatime.svg">
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
| Option | Type *(format)* **[default]** *{allowed values}* | Description |
| ------ | -------------------------------- | ----------- |
| `plugin_wakatime` | `boolean` **[no]** | Display WakaTime stats |
| `plugin_wakatime_token` 🔐 | `token` **[]** | WakaTime API token |
| `plugin_wakatime_days` | `string` **[7]** *{"7", "30", "180", "365"}* | WakaTime time range |
| `plugin_wakatime_sections` | `array` **[time, projects, projects-graphs, languages, languages-graphs, editors, os]** *{"time", "projects", "projects-graphs", "languages", "languages-graphs", "editors", "editors-graphs", "os", "os-graphs"}* | Sections to display |
| `plugin_wakatime_limit` | `number` **[5]** *{0 ≤ 𝑥}* | Maximum number of entries to display per graph |
| `plugin_wakatime_url` | `string` **[https://wakatime.com]** | Address where to reach your Wakatime instance |
| `plugin_wakatime_user` | `string` **[current]** | Your Wakatime user on the selfhosted Wakapi instance |


Legend for option icons:
* 🔐 Value should be stored in repository secrets
* ✨ New feature currently in testing on `master`/`main`
<!--/options-->

*[→ Full specification](metadata.yml)*

#### ℹ️ Examples workflows

<!--examples-->
```yaml
name: ⏰ WakaTime
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.wakatime.svg
  token: NOT_NEEDED
  plugin_wakatime: 'yes'
  plugin_wakatime_sections: time, projects, projects-graphs, languages, languages-graphs, editors, os
  plugin_wakatime_token: ${{ secrets.WAKATIME_TOKEN }}

```
<!--/examples-->