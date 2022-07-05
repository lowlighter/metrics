<!--header-->
<table>
  <tr><td colspan="2"><a href="/README.md#-plugins">← Back to plugins index</a></td></tr>
  <tr><th colspan="2"><h3>⏱️ Google PageSpeed</h3></th></tr>
  <tr><td colspan="2" align="center"><p>This plugin displays performance statistics of a website.</p>
<p>It uses <a href="https://developers.google.com/speed/docs/insights/v5/get-started">Google&#39;s PageSpeed API</a> (same as <a href="https://web.dev">web.dev</a>), see <a href="https://web.dev/performance-scoring/">performance scoring</a> and <a href="https://googlechrome.github.io/lighthouse/scorecalc/">score calculator</a> for more informations about results.</p>
</td></tr>
  <tr>
    <th rowspan="3">Supported features<br><sub><a href="metadata.yml">→ Full specification</a></sub></th>
    <td><a href="/source/templates/classic/README.md"><code>📗 Classic template</code></a> <a href="/source/templates/repository/README.md"><code>📘 Repository template</code></a> <a href="/source/templates/terminal/README.md"><code>📙 Terminal template</code></a></td>
  </tr>
  <tr>
    <td><code>👤 Users</code> <code>👥 Organizations</code> <code>📓 Repositories</code></td>
  </tr>
  <tr>
    <td><code>🗝️ plugin_pagespeed_token</code></td>
  </tr>
  <tr>
    <td colspan="2" align="center">
      <details open><summary>PageSpeed scores</summary><img src="https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.pagespeed.svg" alt=""></img></details>
      <details><summary>PageSpeed scores with detailed report</summary><img src="https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.pagespeed.detailed.svg" alt=""></img></details>
      <details><summary>PageSpeed scores with a website screenshot</summary><img src="https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.pagespeed.screenshot.svg" alt=""></img></details>
      <img width="900" height="1" alt="">
    </td>
  </tr>
</table>
<!--/header-->

## ➡️ Available options

<!--options-->
<table>
  <tr>
    <td align="center" nowrap="nowrap">Option</i></td><td align="center" nowrap="nowrap">Description</td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_pagespeed</code></h4></td>
    <td rowspan="2"><p>Enable pagespeed plugin</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_pagespeed_token</code></h4></td>
    <td rowspan="2"><p>PageSpeed token</p>
<blockquote>
<p>⚠️ While not mandatory, it is strongly advised pass a token to avoid triggering the rate limiter. See <a href="https://developers.google.com/speed/docs/insights/v5/get-started">PageSpeed documentation</a> for more informations.</p>
</blockquote>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">🔐 Token<br>
<b>type:</b> <code>token</code>
<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_pagespeed_url</code></h4></td>
    <td rowspan="2"><p>Audited website</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">⏯️ Cannot be preset<br>
<b>type:</b> <code>string</code>
<br>
<b>default:</b> <code>→ User attached website</code><br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_pagespeed_detailed</code></h4></td>
    <td rowspan="2"><p>Detailed results</p>
<p>The following additional stats will be displayed:</p>
<ul>
<li>First Contentful Paint</li>
<li>Speed Index</li>
<li>Largest Contentful Paint</li>
<li>Time to Interactive</li>
<li>Total Blocking Time</li>
<li>Cumulative Layout Shift</li>
</ul>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_pagespeed_screenshot</code></h4></td>
    <td rowspan="2"><p>Website screenshot</p>
<p>Significantly increase filesize</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugin_pagespeed_pwa</code></h4></td>
    <td rowspan="2"><p>PWA Status</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
</table>
<!--/options-->

## ℹ️ Examples workflows

<!--examples-->
```yaml
name: Succint report
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.pagespeed.svg
  token: NOT_NEEDED
  base: ""
  plugin_pagespeed: yes
  plugin_pagespeed_token: ${{ secrets.PAGESPEED_TOKEN }}
  plugin_pagespeed_url: https://lecoq.io

```
```yaml
name: Detailed report
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.pagespeed.detailed.svg
  token: NOT_NEEDED
  base: ""
  plugin_pagespeed: yes
  plugin_pagespeed_detailed: yes
  plugin_pagespeed_token: ${{ secrets.PAGESPEED_TOKEN }}
  plugin_pagespeed_url: https://lecoq.io

```
```yaml
name: Screenshot
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.pagespeed.screenshot.svg
  token: NOT_NEEDED
  base: ""
  plugin_pagespeed: yes
  plugin_pagespeed_screenshot: yes
  plugin_pagespeed_token: ${{ secrets.PAGESPEED_TOKEN }}
  plugin_pagespeed_url: https://lecoq.io

```
```yaml
name: Succint report with PWA
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.pagespeed.svg
  token: NOT_NEEDED
  base: ""
  plugin_pagespeed: yes
  plugin_pagespeed_token: ${{ secrets.PAGESPEED_TOKEN }}
  plugin_pagespeed_url: https://lecoq.io
  plugin_pagespeed_pwa: yes

```
<!--/examples-->
