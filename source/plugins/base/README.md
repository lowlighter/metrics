### 🗃️ Base content

The *base* content is all metrics enabled by default.

<table>
  <tr>
    <td align="center">
      <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.classic.svg">
      <img width="900" height="1" alt="">
    </td>
    <td align="center">
      <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.organization.svg">
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
| Option | Type *(format)* **[default]** *{allowed values}* | Description |
| ------ | -------------------------------- | ----------- |
| `base` | `array` *(comma-separated)* **[header, activity, community, repositories, metadata]** *{"header", "activity", "community", "repositories", "metadata"}* | Metrics base content |
| `repositories` | `number` **[100]** *{0 ≤ 𝑥}* | Number of repositories to use |
| `repositories_batch` | `number` **[100]** *{1 ≤ 𝑥 ≤ 100}* | Number of repositories to load at once by queries |
| `repositories_forks` | `boolean` **[no]** | Include forks in metrics |
| `repositories_affiliations` | `array` *(comma-separated)* **[owner]** *{"owner", "collaborator", "organization_member"}* | Repositories affiliations |
| `repositories_skipped` | `array` *(comma-separated)* **[]** | Default repositories to skip |
| `commits_authoring` | `array` *(comma-seperated)* **[.user.login]** | List of surnames or email addresses you use when authoring commits |


Legend for option icons:
* 🔐 Value should be stored in repository secrets
* ✨ New feature currently in testing on `master`/`main`
<!--/options-->

*[→ Full specification](metadata.yml)*

#### ℹ️ Examples workflows

<!--examples-->

<!--/examples-->
