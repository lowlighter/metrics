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

#### ℹ️ Examples workflows

[➡️ Available options for this plugin](metadata.yml)

```yaml
- uses: lowlighter/metrics@latest
  with:
    # ... other options
    plugin_wakatime: yes                                      # (🚧 @master feature)
    plugin_wakatime_token: ${{ secrets.WAKATIME_TOKEN }}      # Required
    plugin_wakatime_days: 7                                   # Display last week stats
    plugin_wakatime_sections: time, projects, projects-graphs # Display time and projects sections, along with projects graphs
    plugin_wakatime_limit: 4                                  # Show 4 entries per graph
```
