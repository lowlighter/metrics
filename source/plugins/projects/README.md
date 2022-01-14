### 🗂️ Active projects

> ⚠️ This plugin requires a personal token with public_repo scope.

The *projects* plugin displays the progress of your profile projects.

<table>
  <td align="center">
    <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.projects.svg">
    <img width="900" height="1" alt="">
  </td>
</table>

Because of GitHub REST API limitation, provided token requires `public_repo` scope to access projects informations.

Note that by default, projects have progress tracking disabled.
To enable it, open the `≡ Menu` and edit the project to opt-in to `Track project progress` (it can be a bit confusing since it's actually not in the project settings).

![Enable "Track project progress"](/.github/readme/imgs/plugin_projects_track_progress.png)

<details>
<summary>💬 Create a personal project on GitHub</summary>

On your profile, select the `Projects` tab:
![Create a new project](/.github/readme/imgs/plugin_projects_create.png)

Fill the informations and set visibility to *public*:
![Configure project](/.github/readme/imgs/plugin_projects_setup.png)

</details>

<details>
<summary>💬 Use repositories projects</summary>

It is possible to display projects related to repositories along with personal projects.

To do so, open your repository project and retrieve the last URL endpoint, in the format `:user/:repository/projects/:project_id` (for example, `lowlighter/metrics/projects/1`) and add it in the `plugin_projects_repositories` option. Enable `Track project progress` in the project settings to display a progress bar in generated metrics.

![Add a repository project](/.github/readme/imgs/plugin_projects_repositories.png)

</details>

#### ➡️ Available options

<!--options-->
| Option | Type *(format)* **[default]** *{allowed values}* | Description |
| ------ | -------------------------------- | ----------- |
| `plugin_projects` | `boolean` **[no]** | Display active projects |
| `plugin_projects_limit` | `number` **[4]** *{0 ≤ 𝑥 ≤ 100}* | Maximum number of projects to display |
| `plugin_projects_repositories` | `array` *(comma-separated)* **[]** | List of repository project identifiers to disaplay |
| `plugin_projects_descriptions` | `boolean` **[no]** | Display projects descriptions |


<!--/options-->

*[→ Full specification](metadata.yml)*

#### ℹ️ Examples workflows

<!--examples-->
```yaml
name: Project from a repository
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.projects.svg
  token: ${{ secrets.METRICS_BOT_TOKEN }}
  base: ''
  plugin_projects: 'yes'
  plugin_projects_repositories: lowlighter/metrics/projects/1
  plugin_projects_descriptions: 'yes'

```
<!--/examples-->