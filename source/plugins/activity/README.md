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
| Option | Type *(format)* **[default]** *{allowed values}* | Description |
| ------ | -------------------------------- | ----------- |
| `plugin_activity` | `boolean` **[no]** | Display recent activity |
| `plugin_activity_limit` | `number` **[5]** *{1 ≤ 𝑥 ≤ 1000}* | Maximum number of events to display |
| `plugin_activity_load` | `number` **[300]** *{100 ≤ 𝑥 ≤ 1000}* | Number of events to load |
| `plugin_activity_days` | `number` **[14]** *{0 ≤ 𝑥 ≤ 365}* | Maximum event age |
| `plugin_activity_filter` | `array` *(comma-separated)* **[all]** *{"all", "comment", "ref/create", "ref/delete", "release", "push", "issue", "pr", "review", "wiki", "fork", "star", "member", "public"}* | Events types to keep |
| `plugin_activity_visibility` | `string` **[all]** *{"public", "all"}* | Set events visibility |
| `plugin_activity_timestamps` | `boolean` **[no]** | Display events timestamps |
| `plugin_activity_skipped` <sup>⏩</sup> | `array` *(comma-separated)* **[]** | Repositories to skip |
| `plugin_activity_ignored` <sup>⏩</sup> | `undefined` **[]** | Actors to ignore |


Legend for option icons:
* ⏩ Value inherits from its related global-level option
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