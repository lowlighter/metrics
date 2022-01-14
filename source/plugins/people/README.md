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
<!--/options-->

*[→ Full specification](metadata.yml)*

#### ℹ️ Examples workflows

<!--examples-->
<!--/examples-->