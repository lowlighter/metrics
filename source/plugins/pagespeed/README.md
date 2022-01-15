
### ⏱️ Website performances

The *pagespeed* plugin adds the performance statistics of the website attached on your account:

<table>
  <td align="center">
    <details open><summary>PageSpeed scores</summary>
      <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.pagespeed.svg">
    </details>
    <details><summary>PageSpeed scores with detailed report</summary>
      <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.pagespeed.detailed.svg">
    </details>
    <details><summary>PageSpeed scores with a website screenshot</summary>
      <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.plugin.pagespeed.screenshot.svg">
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
| Option | Type *(format)* **[default]** *{allowed values}* | Description |
| ------ | -------------------------------- | ----------- |
| `plugin_pagespeed` | `boolean` **[no]** | Display a website Google PageSpeed metrics |
| `plugin_pagespeed_url` | `string` **[*→ User attached website*]** | Audited website |
| `plugin_pagespeed_detailed` | `boolean` **[no]** | Detailed audit result |
| `plugin_pagespeed_screenshot` | `boolean` **[no]** | Display a screenshot of your website |
| `plugin_pagespeed_token` <sup>🔐</sup> | `token` **[]** | PageSpeed token |


Legend for option icons:
* 🔐 Value should be stored in repository secrets
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
