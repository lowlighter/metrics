<!--header-->
<table>
  <tr><td colspan="2"><a href="/README.md#-plugins">← Back to plugins index</a></td></tr>
  <tr><th colspan="2"><h3>📜 Repository licenses</h3></th></tr>
  <tr><td colspan="2" align="center"><p>This plugin display repository license informations like permissions, limitations and conditions along with additional stats about dependencies.</p>
</td></tr>
  <tr>
    <th rowspan="3">Supported features<br><sub><a href="metadata.yml">→ Full specification</a></sub></th>
    <td><a href="/source/templates/repository/README.md"><code>📘 Repository template</code></a></td>
  </tr>
  <tr>
    <td><code>📓 Repositories</code></td>
  </tr>
  <tr>
    <td><code>🔑 (scopeless)</code> <code>read:org (optional)</code> <code>read:user (optional)</code> <code>read:packages (optional)</code> <code>repo (optional)</code></td>
  </tr>
  <tr>
    <td colspan="2" align="center">
      <details open><summary>Permissions, limitations and conditions</summary><img src="https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.licenses.svg" alt=""></img></details>
      <details open><summary>Licenses overview</summary><img src="https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.licenses.ratio.svg" alt=""></img></details>
      <img width="900" height="1" alt="">
    </td>
  </tr>
</table>
<!--/header-->

## 🔎 Licenses analysis

Use to `plugin_licenses_setup` command to setup project dependencies.

*Example: setup a NodeJS project using `npm ci`*
```yml
- name: Licenses and permissions
  with:
    repo: metrics
    plugin_licenses: yes
    plugin_licenses_setup: npm ci
```

Dependencies will be analyzed by [GitHub licensed](https://github.com/github/licensed) and compared against GitHub known licenses.

> ⚠️ This is **NOT** legal advice, use at your own risk

> 💣 This plugin **SHOULD NOT** be enabled on web instances, since it allows raw command injection.
> This could result in compromised server!


## ➡️ Available options

<!--options-->
<table>
  <tr>
    <td align="center" nowrap="nowrap">Option</i></td><td align="center" nowrap="nowrap">Description</td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_licenses</code></h4></td>
    <td rowspan="2"><p>Enable licenses plugin</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">🌐 Web instances must configure <code>settings.json</code>:
<ul>
<li><i>metrics.cpu.overuse</i></li>
<li><i>metrics.run.tempdir</i></li>
<li><i>metrics.run.git</i></li>
<li><i>metrics.run.licensed</i></li>
<li><i>metrics.run.user.cmd</i></li>
</ul>
<b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_licenses_setup</code></h4></td>
    <td rowspan="2"><p>Setup command</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>string</code>
<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_licenses_ratio</code></h4></td>
    <td rowspan="2"><p>Used licenses ratio</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_licenses_legal</code></h4></td>
    <td rowspan="2"><p>Permissions, limitations and conditions about used licenses</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> yes<br></td>
  </tr>
</table>
<!--/options-->

## ℹ️ Examples workflows

<!--examples-->
```yaml
name: Licenses and permissions
with:
  filename: metrics.plugin.licenses.svg
  token: ${{ secrets.METRICS_TOKEN }}
  base: ""
  template: repository
  repo: metrics
  plugin_licenses: yes
  plugin_licenses_setup: npm ci

```
```yaml
name: Licenses with open-source ratio graphs
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.licenses.ratio.svg
  token: ${{ secrets.METRICS_TOKEN }}
  base: ""
  template: repository
  repo: metrics
  plugin_licenses: yes
  plugin_licenses_setup: npm ci
  plugin_licenses_legal: no
  plugin_licenses_ratio: yes

```
<!--/examples-->
