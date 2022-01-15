
### ⏱️ Website performances

The *pagespeed* plugin adds the performance statistics of the website attached on your account:

<table>
  <td align="center">
    <details open><summary>PageSpeed scores</summary>
      <img src="https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.pagespeed.svg">
    </details>
    <details><summary>PageSpeed scores with detailed report</summary>
      <img src="https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.pagespeed.detailed.svg">
    </details>
    <details><summary>PageSpeed scores with a website screenshot</summary>
      <img src="https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.pagespeed.screenshot.svg">
    </details>
    <img width="900" height="1" alt="">
  </td>
</table>

These metrics are computed through [Google's PageSpeed API](https://developers.google.com/speed/docs/insights/v5/get-started), which yields the same results as [web.dev](https://web.dev).

See [performance scoring](https://web.dev/performance-scoring/) and [score calculator](https://googlechrome.github.io/lighthouse/scorecalc/) for more informations about how PageSpeed compute these statistics.

Although not mandatory, you can generate an API key for PageSpeed API [here](https://developers.google.com/speed/docs/insights/v5/get-started) to avoid hitting rate limiter.

Expect 10 to 30 seconds to generate the results.

#### ➡️ Available options

<!--options-->
<table>
  <tr>
    <td align="center" nowrap="nowrap">Type</i></td><td align="center" nowrap="nowrap">Description</td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_pagespeed</code></td>
    <td rowspan="2">Display a website Google PageSpeed metrics<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_pagespeed_url</code></td>
    <td rowspan="2">Audited website<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>string</code>
<br>
<b>default:</b> <code>→ User attached website</code><br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_pagespeed_detailed</code></td>
    <td rowspan="2">Detailed audit result<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_pagespeed_screenshot</code></td>
    <td rowspan="2">Display a screenshot of your website<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugin_pagespeed_token</code></td>
    <td rowspan="2">PageSpeed token<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">🔐 Token<br>
<b>type:</b> <code>token</code>
<br></td>
  </tr>
</table>
<!--/options-->

*[→ Full specification](metadata.yml)*

#### ℹ️ Examples workflows

<!--examples-->
```yaml
name: Succint report
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.pagespeed.svg
  token: NOT_NEEDED
  base: ''
  plugin_pagespeed: 'yes'
  plugin_pagespeed_token: ${{ secrets.PAGESPEED_TOKEN }}
  plugin_pagespeed_url: https://lecoq.io

```
```yaml
name: Detailed report
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.pagespeed.detailed.svg
  token: NOT_NEEDED
  base: ''
  plugin_pagespeed: 'yes'
  plugin_pagespeed_detailed: 'yes'
  plugin_pagespeed_token: ${{ secrets.PAGESPEED_TOKEN }}
  plugin_pagespeed_url: https://lecoq.io

```
```yaml
name: Screenshot
uses: lowlighter/metrics@latest
with:
  filename: metrics.plugin.pagespeed.screenshot.svg
  token: NOT_NEEDED
  base: ''
  plugin_pagespeed: 'yes'
  plugin_pagespeed_screenshot: 'yes'
  plugin_pagespeed_token: ${{ secrets.PAGESPEED_TOKEN }}
  plugin_pagespeed_url: https://lecoq.io

```
<!--/examples-->
