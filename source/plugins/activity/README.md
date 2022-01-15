### 📰 Recent activity

The *activity* plugin displays your recent activity on GitHub.

<table>
  <td align="center">
    <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.activity.svg">
    <img width="900" height="1" alt="">
  </td>
</table>

It uses data from [GitHub events](https://docs.github.com/en/free-pro-team@latest/developers/webhooks-and-events/github-event-types) and is able to track the following events:

| Event        | Description                                     |
| ------------ | ----------------------------------------------- |
| `push`       | Push of commits                                 |
| `issue`      | Opening/Reopening/Closing of issues             |
| `pr`         | Opening/Closing of pull requests                |
| `ref/create` | Creation of git tags or git branches            |
| `ref/delete` | Deletion of git tags or git branches            |
| `release`    | Publication of new releases                     |
| `review`     | Review of pull requests                         |
| `comment`    | Comments on commits, issues and pull requests   |
| `wiki`       | Edition of wiki pages                           |
| `fork`       | Forking of repositories                         |
| `star`       | Starring of repositories                        |
| `public`     | Repositories made public                        |
| `member`     | Addition of new collaborator in repository      |

Use a full `repo` scope token to display **private** events.

#### ➡️ Available options

<!--options-->
<table>
  <tr>
    <td align="center" nowrap="nowrap">Type</i></td><td align="center" nowrap="nowrap">Description</td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_activity</code></td>
    <td rowspan="2">Display recent activity<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_activity_limit</code></td>
    <td rowspan="2">Maximum number of events to display<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>number</code>
<br>
<i>(1 ≤
𝑥
≤ 1000)</i>
<b>default:</b> 5<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_activity_load</code></td>
    <td rowspan="2">Number of events to load<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>number</code>
<br>
<i>(100 ≤
𝑥
≤ 1000)</i>
<b>default:</b> 300<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_activity_days</code></td>
    <td rowspan="2">Maximum event age<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>number</code>
<br>
<i>(0 ≤
𝑥
≤ 365)</i>
<b>default:</b> 14<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_activity_filter</code></td>
    <td rowspan="2">Events types to keep<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>array</code>
<i>(comma-separated)</i>
<br>
<b>default:</b> all<br>
<b>allowed values:</b><ul><li>all</li><li>comment</li><li>ref/create</li><li>ref/delete</li><li>release</li><li>push</li><li>issue</li><li>pr</li><li>review</li><li>wiki</li><li>fork</li><li>star</li><li>member</li><li>public</li></ul></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_activity_visibility</code></td>
    <td rowspan="2">Set events visibility<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>string</code>
<br>
<b>default:</b> all<br>
<b>allowed values:</b><ul><li>public</li><li>all</li></ul></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_activity_timestamps</code></td>
    <td rowspan="2">Display events timestamps<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_activity_skipped</code></td>
    <td rowspan="2">Repositories to skip<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">⏩ Inherits <code>repositories_skipped</code><br>
<b>type:</b> <code>array</code>
<i>(comma-separated)</i>
<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_activity_ignored</code></td>
    <td rowspan="2">Actors to ignore<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">⏩ Inherits <code>users_ignored</code><br>
<b>type:</b> <code>undefined</code>
<br></td>
  </tr>
</table>
<!--/options-->

*[→ Full specification](metadata.yml)*

#### ℹ️ Examples workflows

<!--examples-->
```yaml
name: Recent activity
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.activity.svg
  token: ${{ secrets.METRICS_TOKEN }}
  base: ''
  plugin_activity: 'yes'
  plugin_activity_limit: 5
  plugin_activity_days: 0
  plugin_activity_filter: issue, pr, release, fork, review, ref/create

```
<!--/examples-->