### ♐ Code snippet of the day

> ⚠️ When improperly configured, this plugin could display private code. If you work with sensitive data or company code, it is advised to keep this plugin disabled. *Metrics* and its authors cannot be held responsible for any resulting code leaks, use at your own risk.

Display a random code snippet from your recent activity history.

<table>
  <td align="center">
    <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.code.svg">
    <img width="900" height="1" alt="">
  </td>
</table>

#### ℹ️ Examples workflows

[➡️ Available options for this plugin](metadata.yml)

```yaml
- uses: lowlighter/metrics@latest
  with:
    # ... other options
    plugin_code: yes
    plugin_code_lines: 12               # Only display snippets with less than 12 lines
    plugin_code_load: 100               # Fetch 100 events from activity
    plugin_code_visibility: public      # Only display snippets from public activity
    plugin_code_skipped: github/octocat # Skip github/octocat repository
```