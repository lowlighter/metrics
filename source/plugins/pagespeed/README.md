
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

#### ℹ️ Examples workflows

[➡️ Available options for this plugin](metadata.yml)

```yaml
- uses: lowlighter/metrics@latest
  with:
    # ... other options
    plugin_pagespeed: yes
    plugin_pagespeed_token: ${{ secrets.PAGESPEED_TOKEN }} # Optional but recommended
    plugin_pagespeed_detailed: yes                         # Print detailed audit metrics
    plugin_pagespeed_screenshot: no                        # Display a screenshot of your website
    plugin_pagespeed_url: .user.website                    # Website to audit (defaults to your GitHub linked website)
```
