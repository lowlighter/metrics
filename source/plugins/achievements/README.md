### 🏆 Achievements

The *achievements* plugin displays several highlights about what you achieved on GitHub.

<table>
  <td align="center">
    <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.achievements.svg">
    <details><summary>Compact display</summary>
      <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.achievements.compact.svg">
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

#### ℹ️ Examples workflows

[➡️ Available options for this plugin](metadata.yml)

```yaml
- uses: lowlighter/metrics@latest
  with:
    # ... other options
    plugin_achievements: yes
    plugin_achievements_threshold: B       # Display achievements with rank B or higher
    plugin_achievements_secrets: yes       # Display unlocked secrets achievements
    plugin_achievements_ignored: octonaut  # Hide octonaut achievement
    plugin_achievements_limit: 0           # Display all unlocked achievement matching threshold and secrets params
    plugin_achievements_display: compact   # Use compact display
```
