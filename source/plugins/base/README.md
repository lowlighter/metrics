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

#### ℹ️ Examples workflows

[➡️ Available options for this plugin](metadata.yml)

```yaml
- uses: lowlighter/metrics@latest
  with:
    # ... other options
    base: header, repositories                     # Only display "header" and "repositories" sections
    repositories: 100                              # Query only last 100 repositories
    repositories_batch: 25                         # Query repositories 25 by 25 (lower this to avoid API timeouts)
    repositories_forks: no                         # Don't include forks
    repositories_affiliations: owner, collaborator # Display only repositories where user is owner or collaborator
    repositories_skipped: lowlighter/lowlighter    # Exclude automatically "lowlighter/lowlighter" repository from plugins allowing a skip list
    commits_authoring: octocat@github.com          # Handle you use when authoring commits, which can be used to filter commits in other plugins
```
