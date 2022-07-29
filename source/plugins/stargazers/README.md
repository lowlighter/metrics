<!--header-->
<table>
  <tr><td colspan="2"><a href="/README.md#-plugins">← Back to plugins index</a></td></tr>
  <tr><th colspan="2"><h3>✨ Stargazers</h3></th></tr>
  <tr><td colspan="2" align="center"><p>This plugin displays stargazers evolution across affiliated repositories.</p>
</td></tr>
  <tr><th>⚠️ Disclaimer</th><td><p>This plugin is not affiliated, associated, authorized, endorsed by, or in any way officially connected with <a href="https://github.com">GitHub</a>.
All product and company names are trademarks™ or registered® trademarks of their respective holders.</p>
</td></tr>
  <tr>
    <th rowspan="3">Supported features<br><sub><a href="metadata.yml">→ Full specification</a></sub></th>
    <td><a href="/source/templates/classic/README.md"><code>📗 Classic template</code></a> <a href="/source/templates/repository/README.md"><code>📘 Repository template</code></a></td>
  </tr>
  <tr>
    <td><code>👤 Users</code> <code>👥 Organizations</code> <code>📓 Repositories</code></td>
  </tr>
  <tr>
    <td><code>🔑 (scopeless)</code> <code>🗝️ plugin_stargazers_worldmap_token</code> <code>read:org (optional)</code> <code>read:user (optional)</code> <code>read:packages (optional)</code> <code>repo (optional)</code></td>
  </tr>
  <tr>
    <td colspan="2" align="center">
      <details open><summary>Classic charts</summary><img src="https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.stargazers.svg" alt=""></img></details>
      <details><summary>Chartist charts</summary><img src="https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.stargazers.chartist.svg" alt=""></img></details>
      <details open><summary>Worldmap</summary><img src="https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.stargazers.worldmap.svg" alt=""></img></details>
      <img width="900" height="1" alt="">
    </td>
  </tr>
</table>
<!--/header-->

## 🗝️ Obtaining a Google Maps API token

Some features like `plugin_stagazers_worldmap` require a Google Geocoding API token.
Follow instructions from their [documentation](https://developers.google.com/maps/documentation/geocoding/get-api-key) for more informations.

> 💳 A billing account is required to get a token. However a recurring [monthly credit](https://developers.google.com/maps/billing-credits#monthly) is offered which means you should not be charged if you don't exceed the free quota.
>
> It is advised to set the quota limit at 1200 requests per day
>
> Use at your own risk, *metrics* and its authors cannot be held responsible for anything charged.

## ➡️ Available options

<!--options-->
<table>
  <tr>
    <td align="center" nowrap="nowrap">Option</i></td><td align="center" nowrap="nowrap">Description</td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_stargazers</code></h4></td>
    <td rowspan="2"><p>Enable stargazers plugin</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_stargazers_charts</code></h4></td>
    <td rowspan="2"><p>Charts</p>
<p>It includes total number of stargazers evolution, along with the number of new stars per day over the last two weeks.</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">✨ On <code>master</code>/<code>main</code><br>
<b>type:</b> <code>boolean</code>
<br>
<b>default:</b> yes<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_stargazers_charts_type</code></h4></td>
    <td rowspan="2"><p>Charts display type</p>
<ul>
<li><code>classic</code>: <code>&lt;div&gt;</code> based charts, simple and lightweight</li>
<li><code>chartist</code>: <code>&lt;svg&gt;</code> based charts, smooth</li>
</ul>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">🌐 Web instances must configure <code>settings.json</code>:
<ul>
<li><i>metrics.npm.optional.chartist</i></li>
</ul>
<b>type:</b> <code>string</code>
<br>
<b>default:</b> classic<br>
<b>allowed values:</b><ul><li>classic</li><li>chartist</li></ul></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_stargazers_worldmap</code></h4></td>
    <td rowspan="2"><p>Stargazers worldmap</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">✨ On <code>master</code>/<code>main</code><br>
🌐 Web instances must configure <code>settings.json</code>:
<ul>
<li><i>metrics.api.google.maps</i></li>
<li><i>metrics.npm.optional.d3</i></li>
</ul>
<b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_stargazers_worldmap_token</code></h4></td>
    <td rowspan="2"><p>Stargazers worldmap token</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">🔐 Token<br>
✨ On <code>master</code>/<code>main</code><br>
<b>type:</b> <code>token</code>
<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_stargazers_worldmap_sample</code></h4></td>
    <td rowspan="2"><p>Stargazers worldmap sample</p>
<p>Use this setting to randomly sample and limit your stargazers.
Helps to avoid consuming too much Google Geocoding API requests while still being representative.</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">✨ On <code>master</code>/<code>main</code><br>
<b>type:</b> <code>number</code>
<i>(0 ≤
𝑥)</i>
<br>
<b>zero behaviour:</b> disable</br>
<b>default:</b> 0<br></td>
  </tr>
</table>
<!--/options-->

## ℹ️ Examples workflows

<!--examples-->
```yaml
name: Using classic charts
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.stargazers.svg
  token: ${{ secrets.METRICS_TOKEN }}
  base: ""
  plugin_stargazers: yes

```
```yaml
name: Using chartist charts
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.stargazers.chartist.svg
  token: ${{ secrets.METRICS_TOKEN }}
  base: ""
  plugin_stargazers: yes
  plugin_stargazers_charts_type: chartist

```
```yaml
name: With worldmap
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.stargazers.worldmap.svg
  token: ${{ secrets.METRICS_TOKEN }}
  base: ""
  plugin_stargazers: yes
  plugin_stargazers_charts: no
  plugin_stargazers_worldmap: yes
  plugin_stargazers_worldmap_token: ${{ secrets.GOOGLE_MAP_TOKEN }}
  plugin_stargazers_worldmap_sample: 200

```
<!--/examples-->
