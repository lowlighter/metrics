### 🏆 Achievements

The *achievements* plugin displays several highlights about what you achieved on GitHub.

<table>
  <td align="center">
    <details open><summary>Compact display</summary>
      <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.achievements.compact.svg">
    </details>
    <details><summary>Detailed display</summary>
      <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.achievements.svg">
    </details>
    <img width="900" height="1" alt="">
  </td>
</table>

Achievements are mostly related to features offered by GitHub, so by unlocking achivements ranks you'll be mastering GitHub in no time!

A few achievements contains actual real ranking (based on [GitHub search](https://github.com/search) results)!

**About achievements ranks**

Moving forward between ranks is voluntarily difficult, making it almost impossible to reach the latest rank except by hard work.

With this design, when a user reach upper ranks you can be sure that they really deserve it!
It also lets you quickly see at a glance what this user primarly use GitHub for, just look for crimson and gold badges!

![Ranks](/.github/readme/imgs/plugin_achievements_ranks.png)

#### ➡️ Available options

<!--options-->
| Option | Type *(format)* **[default]** *{allowed values}* | Description |
| ------ | -------------------------------- | ----------- |
| `plugin_achievements` | `boolean` **[no]** | Display achievements |
| `plugin_achievements_threshold` | `string` **[C]** *{"S", "A", "B", "C", "X"}* | Display rank minimal threshold |
| `plugin_achievements_secrets` | `boolean` **[yes]** | Display unlocked secrets achievements |
| `plugin_achievements_display` | `string` **[detailed]** *{"detailed", "compact"}* | Achievements display style |
| `plugin_achievements_limit` | `number` **[0]** *{0 ≤ 𝑥}* | Maximum number of achievements to display |
| `plugin_achievements_ignored` | `array` *(comma-separated)* **[]** | Unlocked achievements to hide |
| `plugin_achievements_only` | `array` *(comma-separated)* **[]** | Unlocked achievements to display |


<!--/options-->

*[→ Full specification](metadata.yml)*

#### ℹ️ Examples workflows

<!--examples-->
```yaml
name: Detailed display
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.achievements.svg
  token: ${{ secrets.METRICS_TOKEN }}
  base: ''
  plugin_achievements: 'yes'
  plugin_achievements_only: sponsor, maintainer, octonaut

```
```yaml
name: Compact display
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.achievements.compact.svg
  token: ${{ secrets.METRICS_TOKEN }}
  base: ''
  plugin_achievements: 'yes'
  plugin_achievements_only: >-
    polyglot, stargazer, sponsor, deployer, member, maintainer, developer,
    scripter, packager, explorer, infographile, manager
  plugin_achievements_display: compact
  plugin_achievements_threshold: X

```
<!--/examples-->