### 🎟️ Follow-up of issues and pull requests

The *followup* plugin displays the ratio of open/closed issues and the ratio of open/merged pull requests across all your repositories, which shows if they're well-maintained or not.

<table>
  <td align="center">
    <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.followup.svg">
    <details><summary>Created by user version</summary>
      <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.followup.user.svg">
    </details>
    <img width="900" height="1" alt="">
  </td>
</table>

#### ℹ️ Examples workflows

[➡️ Available options for this plugin](metadata.yml)

```yaml
- uses: lowlighter/metrics@latest
  with:
    # ... other options
    plugin_followup: yes
    plugin_followup_sections: repositories, user # Display overall status of issues/pull requests created on user's repositories and created by user
```

