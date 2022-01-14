### 🧑‍🤝‍🧑 People plugin

The *people* plugin can display people you're following or sponsoring, and also users who're following or sponsoring you.
In repository mode, it's possible to display sponsors, stargazers, watchers.

<table>
  <td align="center">
    <details open><summary>Related to an user</summary>
      <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.people.followers.svg">
    </details>
    <details><summary>Related to a repository</summary>
      <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.people.repository.svg">
    </details>
    <img width="900" height="1" alt="">
  </td>
</table>

The following types are supported:

| Type            | Alias                                | User metrics       | Repository metrics |
| --------------- | ------------------------------------ | :----------------: | :----------------: |
| `followers`     |                                      | ✔️                 | ❌                |
| `following`     | `followed`                           | ✔️                 | ❌                |
| `sponsoring`    | `sponsored`, `sponsorshipsAsSponsor` | ✔️                 | ❌                |
| `sponsors`      | `sponsorshipsAsMaintainer`           | ✔️                 | ✔️                |
| `contributors`  |                                      | ❌                 | ✔️                |
| `stargazers`    |                                      | ❌                 | ✔️                |
| `watchers`      |                                      | ❌                 | ✔️                |
| `thanks`        |                                      | ✔️                 | ✔️                |
| `members`       |                                      | ✔️ (organization)  | ❌                |


Sections will be ordered the same as specified in `plugin_people_types`.
`sponsors` for repositories will output the same as the owner's sponsors.

#### ➡️ Available options

<!--options-->
| Option | Type *(format)* **[default]** *{allowed values}* | Description |
| ------ | -------------------------------- | ----------- |
| `plugin_people` | `boolean` **[no]** | Display GitHub users from various affiliations |
| `plugin_people_limit` | `number` **[24]** *{0 ≤ 𝑥}* | Maximum number of user to display |
| `plugin_people_size` | `number` **[28]** *{8 ≤ 𝑥 ≤ 64}* | Size of displayed GitHub users' avatars |
| `plugin_people_types` | `array` *(comma-separated)* **[followers, following]** *{"followers", "following", "followed", "sponsoring", "members", "sponsored", "sponsors", "contributors", "stargazers", "watchers", "thanks"}* | Affiliations to display |
| `plugin_people_thanks` | `array` *(comma-separated)* **[]** | GitHub users to personally thanks |
| `plugin_people_sponsors_custom` | `array` *(comma-separated)* **[]** | Custom GitHub sponsors |
| `plugin_people_identicons` | `boolean` **[no]** | Use identicons instead of avatars |
| `plugin_people_shuffle` | `boolean` **[no]** | Shuffle users |


<!--/options-->

*[→ Full specification](metadata.yml)*

#### ℹ️ Examples workflows

<!--examples-->
```yaml
name: Followers
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.people.followers.svg
  token: ${{ secrets.METRICS_TOKEN }}
  base: ''
  plugin_people: 'yes'
  plugin_people_types: followers

```
```yaml
name: Contributors and sponsors
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.people.repository.svg
  token: ${{ secrets.METRICS_TOKEN }}
  base: ''
  template: repository
  repo: metrics
  plugin_people: 'yes'
  plugin_people_types: contributors, stargazers, watchers, sponsors
  plugin_people_sponsors_custom: >-
    iamsainikhil, yutkat, KasparJohannesSchneider, ktnkk, tfSheol, haribo-io,
    marcreichel

```
<!--/examples-->