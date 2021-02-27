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

#### ℹ️ Examples workflows

[➡️ Available options for this plugin](metadata.yml)

```yaml
- uses: lowlighter/metrics@latest
  with:
    # ... other options
    plugin_stackoverflow: yes
    plugin_stackoverflow_user: 8332505                           # Stackoverflow user id (required)
    plugin_stackoverflow_sections: answers-top, questions-recent # Display top answers and recent questions
    plugin_stackoverflow_limit: 2                                # Display 2 entries per section
    plugin_stackoverflow_lines: 4                                # Display 4 lines per entry
```