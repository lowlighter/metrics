<!--header-->
<table>
  <tr><td colspan="2"><a href="/README.md#-plugins">← Back to plugins index</a></td></tr>
  <tr><th colspan="2"><h3>🗃️ Base content</h3></th></tr>
  <tr><td colspan="2" align="center"></td></tr>
  <tr>
    <th rowspan="3">Supported features<br><sub><a href="metadata.yml">→ Full specification</a></sub></th>
    <td><a href="/source/templates/classic/README.md"><code>📗 Classic template</code></a> <a href="/source/templates/repository/README.md"><code>📘 Repository template</code></a> <a href="/source/templates/terminal/README.md"><code>📙 Terminal template</code></a></td>
  </tr>
  <tr>
    <td><code>👤 Users</code> <code>👥 Organizations</code> <code>📓 Repositories</code></td>
  </tr>
  <tr>
    <td><code>🔑 (scopeless)</code> <code>read:org (optional)</code> <code>read:user (optional)</code> <code>read:packages (optional)</code> <code>repo (optional)</code></td>
  </tr>
  <tr>
<td colspan="2"><table><tr>
<td align="center">
<img src="https://github.com/lowlighter/metrics/blob/examples/metrics.classic.svg" alt=""></img>
</td>
<td align="center">
<img src="https://github.com/lowlighter/metrics/blob/examples/metrics.organization.svg" alt=""></img>
</td>
</tr></table></td>
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
    <td nowrap="nowrap"><h4><code>base</code></h4></td>
    <td rowspan="2"><p>Base content</p>
<p>The following sections are supported:</p>
<ul>
<li><code>header</code>, which usually contains username, two-weeks commits calendars and a few additional data</li>
<li><code>activity</code>, which contains recent activity (commits, pull requests, issues, etc.)</li>
<li><code>community</code>, which contains community stats (following, sponsors, organizations, etc.)</li>
<li><code>repositories</code>, which contains repository stats (license, forks, stars, etc.)</li>
<li><code>metadata</code>, which contains information about generated metrics</li>
</ul>
<p>These are all enabled by default, but it is possible to explicitly opt out from them.</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>array</code>
<i>(comma-separated)</i>
<br>
<b>default:</b> header, activity, community, repositories, metadata<br>
<b>allowed values:</b><ul><li>header</li><li>activity</li><li>community</li><li>repositories</li><li>metadata</li></ul></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>base_indepth</code></h4></td>
    <td rowspan="2"><p>Indepth mode</p>
<p>Enabling this will consume additional API queries to fetch more data.
This currently improves the accuracy of the following statistics:</p>
<ul>
<li>total commits</li>
<li>total issues</li>
<li>total pull requests</li>
<li>total pull requests reviews</li>
<li>total repositories contributed to</li>
</ul>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">🌐 Web instances must configure <code>settings.json</code>:
<ul>
<li><i>metrics.api.github.overuse</i></li>
</ul>
<b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>base_hireable</code></h4></td>
    <td rowspan="2"><p>Show <code>Available for hire!</code> in header section</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>repositories</code></h4></td>
    <td rowspan="2"><p>Fetched repositories</p>
<p>A higher value result in more accurate metrics but can hit GitHub API rate-limit more easily (especially with a lot of plugins enabled)</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>number</code>
<i>(0 ≤
𝑥)</i>
<br>
<b>default:</b> 100<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>repositories_batch</code></h4></td>
    <td rowspan="2"><p>Fetched repositories per query</p>
<p>If you receive <code>Something went wrong while executing your query</code> (which is usually caused by API timeouts), lowering this value may help.
This setting may not be supported by all plugins.</p>
<img width="900" height="1" alt=""></td>
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
    <td nowrap="nowrap"><h4><code>repositories_forks</code></h4></td>
    <td rowspan="2"><p>Include forks</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>repositories_affiliations</code></h4></td>
    <td rowspan="2"><p>Repositories affiliations</p>
<ul>
<li><code>owner</code>: owned repositories</li>
<li><code>collaborator</code>: repositories with push access</li>
<li><code>organization_member</code>: repositories from an organization where user is a member</li>
</ul>
<p>Some plugin outputs may be affected by this setting too.</p>
<p>Set to <code>&quot;&quot;</code> to disable and fetch all repositories related to given account.
Broad affiliations will result in less representative metrics.</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>array</code>
<i>(comma-separated)</i>
<br>
<b>default:</b> owner<br>
<b>allowed values:</b><ul><li>owner</li><li>collaborator</li><li>organization_member</li></ul></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>repositories_skipped</code></h4></td>
    <td rowspan="2"><p>Default skipped repositories</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">⏭️ Global option<br>
<b>type:</b> <code>array</code>
<i>(comma-separated)</i>
<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>users_ignored</code></h4></td>
    <td rowspan="2"><p>Default ignored users</p>
<p>Note that emails are only supported in commits-related elements.</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">⏭️ Global option<br>
<b>type:</b> <code>array</code>
<i>(comma-separated)</i>
<br>
<b>default:</b> github-actions[bot], dependabot[bot], dependabot-preview[bot], actions-user, action@github.com<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>commits_authoring</code></h4></td>
    <td rowspan="2"><p>Identifiers that has been used for authoring commits</p>
<p>Specify names, surnames, username, email addresses that has been used in the past that can be used to detect commits ownerships in some plugins</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">⏭️ Global option<br>
⏯️ Cannot be preset<br>
<b>type:</b> <code>array</code>
<i>(comma-separated)</i>
<br>
<b>default:</b> <code>→ User login</code><br></td>
  </tr>
</table>
<!--/options-->

## ℹ️ Examples workflows

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
