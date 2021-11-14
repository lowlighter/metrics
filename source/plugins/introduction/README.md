### 🙋 Introduction

The *introduction* plugin display your account bio or your organization/repository description.
It is mostly intended for metrics used outside of GitHub, since these informations are already available on GitHub.

<table>
  <td align="center">
    <details open><summary>For an user or an organization</summary>
      <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.introduction.svg">
    </details>
    <details><summary>For a repository</summary>
      <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.introduction.repository.svg">
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
    plugin_introduction: yes
    plugin_introduction_title: no # Hide section title
```