### 🏅 Repository contributors

The *contributors* plugin lets you display repositories contributors from a commit range, that can be specified through either sha, tags, branch, etc.

It's especially useful to acknowledge contributors on release notes.

<table>
  <td align="center">
    <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.contributors.svg">
    <img width="900" height="1" alt="">
  </td>
</table>

#### ℹ️ Examples workflows

[➡️ Available options for this plugin](metadata.yml)

```yaml
- uses: lowlighter/metrics@latest
  with:
    # ... other options
    plugin_contributors: yes
    plugin_contributors_base: ""     # Base reference (commit, tag, branch, etc.)
    plugin_contributors_head: master # Head reference (commit, tag, branch, etc.)
```