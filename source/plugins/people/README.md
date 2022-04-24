<!--header-->
<table>
  <tr><td colspan="2"><a href="/README.md#-plugins">← Back to plugins index</a></td></tr>
  <tr><th colspan="2"><h3>🧑‍🤝‍🧑 People plugin</h3></th></tr>
  <tr><td colspan="2" align="center"><p>This plugin can display relationships with users, such as followers, sponsors, contributors, stargazers, watchers, members, etc.</p>
</td></tr>
  <tr>
    <th rowspan="3">Supported features<br><sub><a href="metadata.yml">→ Full specification</a></sub></th>
    <td><a href="/source/templates/classic/README.md"><code>📗 Classic template</code></a> <a href="/source/templates/repository/README.md"><code>📘 Repository template</code></a></td>
  </tr>
  <tr>
    <td><code>👤 Users</code> <code>👥 Organizations</code> <code>📓 Repositories</code></td>
  </tr>
  <tr>
    <td><code>🔑 (scopeless)</code> <code>read:org (optional)</code> <code>read:user (optional)</code> <code>read:packages (optional)</code> <code>repo (optional)</code></td>
  </tr>
  <tr>
    <td colspan="2" align="center">
      <details open><summary>Related to a user</summary><img src="https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.people.followers.svg" alt=""></img></details>
      <details><summary>Related to a repository</summary><img src="https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.people.repository.svg" alt=""></img></details>
      <img width="900" height="1" alt="">
    </td>
  </tr>
</table>
<!--/header-->

## ➡️ Available options

<!--options-->
<table>
  <tr>
    <td align="center" nowrap="nowrap">Option</i></td><td align="center" nowrap="nowrap">Description</td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_people</code></h4></td>
    <td rowspan="2"><p>Enable people plugin</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_people_limit</code></h4></td>
    <td rowspan="2"><p>Display limit</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>number</code>
<i>(0 ≤
𝑥)</i>
<br>
<b>zero behaviour:</b> disable</br>
<b>default:</b> 24<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_people_identicons</code></h4></td>
    <td rowspan="2"><p>Toggle identicons display</p>
<p>This can be used to mask user profile pictures for privacy</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_people_identicons_hide</code></h4></td>
    <td rowspan="2"><p>Hide identicons display</p>
<p>This can be used to mask user who did not setup a personal profile picture.</p>
<p>When used with <code>plugin_people_identicons</code>, users who did not setup a personal profile picture
will still be filtered out, but will have their picture replaced by an identicon instead.</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_people_size</code></h4></td>
    <td rowspan="2"><p>Profile picture display size</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>number</code>
<i>(8 ≤
𝑥
≤ 64)</i>
<br>
<b>default:</b> 28<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_people_types</code></h4></td>
    <td rowspan="2"><p>Displayed sections (order is respected)</p>
<p>User and organization accounts support the following values:</p>
<ul>
<li><code>followers</code></li>
<li><code>following</code>/<code>followed</code></li>
<li><code>sponsoring</code>/<code>sponsored</code></li>
<li><code>sponsors</code></li>
<li><code>members</code> (organization only)</li>
<li><code>thanks</code>(to be configured with <code>plugin_people_thanks</code>)
Repositories support the following values:</li>
<li><code>sponsors</code> (same as owner sponsors)</li>
<li><code>contributors</code></li>
<li><code>stargazers</code></li>
<li><code>watchers</code></li>
<li><code>thanks</code>(to be configured with <code>plugin_people_thanks</code>)</li>
</ul>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>array</code>
<i>(comma-separated)</i>
<br>
<b>default:</b> followers, following<br>
<b>allowed values:</b><ul><li>followers</li><li>following</li><li>followed</li><li>sponsoring</li><li>members</li><li>sponsored</li><li>sponsors</li><li>contributors</li><li>stargazers</li><li>watchers</li><li>thanks</li></ul></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_people_thanks</code></h4></td>
    <td rowspan="2"><p>Special thanks</p>
<p>This list can be used to thank specific users</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">⏯️ Cannot be preset<br>
<b>type:</b> <code>array</code>
<i>(comma-separated)</i>
<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_people_sponsors_custom</code></h4></td>
    <td rowspan="2"><p>Custom sponsors</p>
<p>This list can be used to add users from unsupported GitHub sponsors sources.
The option <code>plugin_people_types</code> must contain the <code>sponsors</code> section in order for this setting to be effective</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">⏯️ Cannot be preset<br>
<b>type:</b> <code>array</code>
<i>(comma-separated)</i>
<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_people_shuffle</code></h4></td>
    <td rowspan="2"><p>Shuffle data for varied output</p>
<p>This will fetch 10 times more data than <code>plugin_people_limit</code> to ensure output is always different</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
</table>
<!--/options-->

## ℹ️ Examples workflows

<!--examples-->
```yaml
name: Followers
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.people.followers.svg
  token: ${{ secrets.METRICS_TOKEN }}
  base: ""
  plugin_people: yes
  plugin_people_types: followers

```
```yaml
name: Contributors and sponsors
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.people.repository.svg
  token: ${{ secrets.METRICS_TOKEN }}
  base: ""
  template: repository
  repo: metrics
  plugin_people: yes
  plugin_people_types: contributors, stargazers, watchers, sponsors

```
<!--/examples-->
