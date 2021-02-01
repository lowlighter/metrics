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

<!-- TODO -->

</details>

#### ℹ️ Examples workflows

[➡️ Available options for this plugin](metadata.yml)

```yaml
- uses: lowlighter/metrics@latest
  with:
    # ... other options
    plugin_wakatime: yes
    plugin_wakatime_token: ${{ secrets.WAKATIME_TOKEN }}      # Required
    plugin_wakatime_days: 7                                   # Display last week stats
    plugin_wakatime_sections: time, projects, projects-graphs # Display time and projects sections, along with projects graphs
```
