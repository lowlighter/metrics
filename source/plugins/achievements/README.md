### 🏆 Achievements

The *achievements* plugin displays several highlights about what you achieved on GitHub.

<table>
  <td align="center">
    <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.achievements.svg">
    <img width="900" height="1" alt="">
  </td>
</table>

Achievements are mostly related to features offered by GitHub, so by unlocking achivements ranks you'll be mastering GitHub in no time!

A few achievements contains actual real ranking (based on [GitHub search](https://github.com/search) results)!

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
```
