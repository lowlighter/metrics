### 🏆 Achievements

The *achievements* plugin displays several highlights about what you achieved on GitHub.

<table>
  <td align="center">
    <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.achievements.svg">
    <img width="900" height="1" alt="">
  </td>
</table>

Achievements are mostly related to features offered by GitHub, so by unlocking achivements ranks you'll be mastering GitHub in no time!

Ranks **C** to **A+** are based on fixed thresholds while **S** ranks are dynamically computed to ensure you're at least in the top 10% of GitHub at any time (which also means that it is possible to lose them).

#### ℹ️ Examples workflows

[➡️ Available options for this plugin](metadata.yml)

```yaml
- uses: lowlighter/metrics@latest
  with:
    # ... other options
    plugin_achievements: yes
    plugin_achievements_ranks: S++, S+, S, A++, A+, A, B, $ # Display achievements with rank B or higher, including secrets achievements
    plugin_achievements_hide: octonaut                      # Hide octonaut achievement
```