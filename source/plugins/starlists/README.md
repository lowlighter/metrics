### 💫 Starlists

The *starlists* plugin displays your recently star lists.

<table>
  <td align="center">
    <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.starlists.svg">
    <img width="900" height="1" alt="">
  </td>
</table>

#### ℹ️ Examples workflows

[➡️ Available options for this plugin](metadata.yml)

```yaml
- uses: lowlighter/metrics@latest
  with:
    # ... other options
    plugin_starlists: yes
    plugin_starlists_limit: 16             # Limit to 16 entries
    plugin_starlists_limit_repositories: 2 # Limit to 2 repositories per entries
    plugin_starlists_ignored: list1, list2 # Ignored lists
    plugin_starlists_only: list3           # Only display this list
```