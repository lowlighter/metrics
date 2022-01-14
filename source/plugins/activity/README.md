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
<!--/options-->

*[→ Full specification](metadata.yml)*

#### ℹ️ Examples workflows

<!--examples-->
<!--/examples-->