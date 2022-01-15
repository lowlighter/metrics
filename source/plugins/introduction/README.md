### 🙋 Introduction

The *introduction* plugin display your account bio or your organization/repository description.
It is mostly intended for metrics used outside of GitHub, since these informations are already available on GitHub.

<table>
  <td align="center">
    <details open><summary>For an user or an organization</summary>
      <img src="https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.introduction.svg">
    </details>
    <details><summary>For a repository</summary>
      <img src="https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.introduction.repository.svg">
    </details>
    <img width="900" height="1" alt="">
  </td>
</table>

#### ➡️ Available options

<!--options-->
<table>
  <tr>
    <td align="center" nowrap="nowrap">Type</i></td><td align="center" nowrap="nowrap">Description</td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_introduction</code></td>
    <td rowspan="2"><p>Display account or repository introduction</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_introduction_title</code></td>
    <td rowspan="2"><p>Display introduction section title</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> yes<br></td>
  </tr>
</table>
<!--/options-->

*[→ Full specification](metadata.yml)*

#### ℹ️ Examples workflows

<!--examples-->
```yaml
name: Organization introduction
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
