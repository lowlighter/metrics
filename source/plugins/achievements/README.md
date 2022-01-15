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
<table>
  <tr>
    <td align="center" nowrap="nowrap">Type</i></td><td align="center" nowrap="nowrap">Description</td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_achievements</code></td>
    <td rowspan="2">Display achievements<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_achievements_threshold</code></td>
    <td rowspan="2">Display rank minimal threshold<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>string</code>
<br>
<b>default:</b> C<br>
<b>allowed values:</b><ul><li>S</li><li>A</li><li>B</li><li>C</li><li>X</li></ul></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_achievements_secrets</code></td>
    <td rowspan="2">Display unlocked secrets achievements<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> yes<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_achievements_display</code></td>
    <td rowspan="2">Achievements display style<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>string</code>
<br>
<b>default:</b> detailed<br>
<b>allowed values:</b><ul><li>detailed</li><li>compact</li></ul></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_achievements_limit</code></td>
    <td rowspan="2">Maximum number of achievements to display<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>number</code>
<i>(0 ≤
𝑥)</i>
<br>
<b>default:</b> 0<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_achievements_ignored</code></td>
    <td rowspan="2">Unlocked achievements to hide<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>array</code>
<i>(comma-separated)</i>
<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_achievements_only</code></td>
    <td rowspan="2">Unlocked achievements to display<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>array</code>
<i>(comma-separated)</i>
<br></td>
  </tr>
</table>
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