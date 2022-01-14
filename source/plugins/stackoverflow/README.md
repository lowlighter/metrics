### 🗨️ Stackoverflow plugin

The *stackoverflow* plugin lets you display your metrics, questions and answer from [stackoverflow](https://stackoverflow.com/).

<table>
  <td align="center">
    <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.stackoverflow.svg">
    <img width="900" height="1" alt="">
  </td>
</table>

<details>
<summary>💬 Get your user id</summary>

Go to [stackoverflow.com](https://stackoverflow.com/) and click on your account profile.

Your user id will be in both url and search bar.

![User id](/.github/readme/imgs/plugin_stackoverflow_user_id.png)

</details>

#### ➡️ Available options

<!--options-->
| Option | Type *(format)* **[default]** *{allowed values}* | Description |
| ------ | -------------------------------- | ----------- |
| `plugin_stackoverflow` | `boolean` **[no]** | Stackoverflow metrics |
| `plugin_stackoverflow_user` | `number` **[0]** | Stackoverflow user id |
| `plugin_stackoverflow_sections` | `array` *(comma-separated)* **[answers-top, questions-recent]** *{"answers-top", "answers-recent", "questions-top", "questions-recent"}* | Sections to display |
| `plugin_stackoverflow_limit` | `number` **[2]** *{1 ≤ 𝑥 ≤ 30}* | Maximum number of entries to display per section |
| `plugin_stackoverflow_lines` | `number` **[4]** *{0 ≤ 𝑥}* | Maximum number of lines to display per question or answer |
| `plugin_stackoverflow_lines_snippet` | `number` **[2]** *{0 ≤ 𝑥}* | Maximum number of lines to display per code snippet |


<!--/options-->

*[→ Full specification](metadata.yml)*

#### ℹ️ Examples workflows

<!--examples-->
```yaml
name: Top answers from stackoverflow
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.stackoverflow.svg
  token: ${{ secrets.METRICS_TOKEN }}
  base: ''
  plugin_stackoverflow: 'yes'
  plugin_stackoverflow_user: 1
  plugin_stackoverflow_sections: answers-top
  plugin_stackoverflow_limit: 2

```
<!--/examples-->