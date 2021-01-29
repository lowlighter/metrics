### 🧑‍🤝‍🧑 People plugin <sup>🚧 <code>plugin_people_thanks</code>, repository version and "sponsors" on <code>@master</code></sup>

The *people* plugin can display people you're following or sponsoring, and also users who're following or sponsoring you.
In repository mode, it's possible to display sponsors, stargazers, watchers.

<table>
  <td align="center">
    <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.people.followers.svg">
    <details><summary>Followed people version</summary>
      <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.people.following.svg">
    </details>
    <details><summary>Special thanks version</summary>
      <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.people.thanks.svg">
    </details>
    <details><summary>Repository template version</summary>
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

Sections will be ordered the same as specified in `plugin_people_types`.
`sponsors` for repositories will output the same as the owner's sponsors.

#### ℹ️ Examples workflows

[➡️ Available options for this plugin](metadata.yml)

```yaml
- uses: lowlighter/metrics@latest
  with:
    # ... other options
    plugin_people: yes
    plugin_people_types: followers, thanks     # Display followers and "thanks" sections
    plugin_people_limit: 28                    # Limit to 28 entries per section
    plugin_people_size: 28                     # Size in pixels of displayed avatars
    plugin_people_identicons: no               # Use avatars (do not use identicons)
    plugin_people_thanks: lowlighter, octocat  # Users that will be displayed in "thanks" sections
```
