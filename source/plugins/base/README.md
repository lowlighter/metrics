### 🗃️ Base content

The *base* content is all metrics enabled by default.

<table>
  <tr>
    <td align="center">
      <img src="https://github.com/lowlighter/metrics/blob/examples/metrics.classic.svg">
      <img width="900" height="1" alt="">
    </td>
    <td align="center">
      <img src="https://github.com/lowlighter/metrics/blob/examples/metrics.organization.svg">
      <img width="900" height="1" alt="">
    </td>
  </tr>
</table>

It contains the following sections:
* `header`, which usually contains your username, your two-week commits calendars and a few additional data
* `activity`, which contains your recent activity (commits, pull requests, issues, etc.)
* `community`, which contains your community stats (following, sponsors, organizations, etc.)
* `repositories`, which contains your repositories stats (license, forks, stars, etc.)
* `metadata`, which contains informations about generated metrics

These are all enabled by default, but you can explicitely opt out from them.

#### ➡️ Available options

<!--options-->
<table>
  <tr>
    <td align="center" nowrap="nowrap">Type</i></td><td align="center" nowrap="nowrap">Description</td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>base</code></td>
    <td rowspan="2">Metrics base content<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>array</code>
<i>(comma-separated)</i>
<br>
<b>default:</b> header, activity, community, repositories, metadata<br>
<b>allowed values:</b><ul><li>header</li><li>activity</li><li>community</li><li>repositories</li><li>metadata</li></ul></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>repositories</code></td>
    <td rowspan="2">Number of repositories to use<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>number</code>
<i>(0 ≤
𝑥)</i>
<br>
<b>default:</b> 100<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>repositories_batch</code></td>
    <td rowspan="2">Number of repositories to load at once by queries<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>number</code>
<i>(1 ≤
𝑥
≤ 100)</i>
<br>
<b>default:</b> 100<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>repositories_forks</code></td>
    <td rowspan="2">Include forks in metrics<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>repositories_affiliations</code></td>
    <td rowspan="2">Repositories affiliations<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>array</code>
<i>(comma-separated)</i>
<br>
<b>default:</b> owner<br>
<b>allowed values:</b><ul><li>owner</li><li>collaborator</li><li>organization_member</li></ul></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>repositories_skipped</code></td>
    <td rowspan="2">Default repositories to skip<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">⏭️ Global option<br>
<b>type:</b> <code>array</code>
<i>(comma-separated)</i>
<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>users_ignored</code></td>
    <td rowspan="2">Default users to ignore<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">⏭️ Global option<br>
✨ On <code>master</code>/<code>main</code><br>
<b>type:</b> <code>array</code>
<i>(comma-separated)</i>
<br>
<b>default:</b> github-actions[bot], dependabot[bot], dependabot-preview[bot]<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>commits_authoring</code></td>
    <td rowspan="2">List of surnames or email addresses you use when authoring commits<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">⏭️ Global option<br>
<b>type:</b> <code>array</code>
<i>(comma-seperated)</i>
<br>
<b>default:</b> <code>→ User login</code><br></td>
  </tr>
</table>
<!--/options-->

*[→ Full specification](metadata.yml)*

#### ℹ️ Examples workflows

<!--examples-->
```yaml
name: Default metrics
uses: lowlighter/metrics@latest
with:
  filename: metrics.base.svg
  token: ${{ secrets.METRICS_TOKEN }}
  base: header, activity, community, repositories, metadata

```
<!--/examples-->
