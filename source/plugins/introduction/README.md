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

#### ➡️ Available options

<!--options-->
| Option | Type *(format)* **[default]** *{allowed values}* | Description |
| ------ | -------------------------------- | ----------- |
| `plugin_introduction` | `boolean` **[no]** | Display account or repository introduction |
| `plugin_introduction_title` | `boolean` **[yes]** | Display introduction section title |


<!--/options-->

*[→ Full specification](metadata.yml)*

#### ℹ️ Examples workflows

<!--examples-->
```yaml
name: User introduction
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.introduction.svg
  token: ${{ secrets.METRICS_TOKEN }}
  user: github
  base: header
  plugin_introduction: 'yes'

```
```yaml
name: Repository introduction
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.introduction.repository.svg
  token: ${{ secrets.METRICS_TOKEN }}
  template: repository
  repo: metrics
  base: header
  plugin_introduction: 'yes'

```
<!--/examples-->
