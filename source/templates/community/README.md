### 📕 Community templates

It is possible to use official releases with templates from forked repositories (whether you own them or not).

Use `setup_community_templates` option to specify additional external sources using following format: `user/repo@branch:template`.
Templates added this way will be downloaded through git and can be used by prefixing their name with an `@`.

By default, community templates use `template.mjs` from official `classic` template instead of their own, to prevent executing malicious code and avoid token leaks.

If you trust it, append `+trust` after their name.

```yaml
- uses: lowlighter/metrics@latest
  with:
    # ... other options
    template: "@super-metrics"
    # Download "super-metrics" and "trusted-metrics" templates from "octocat/metrics@master"
    # "@trusted-metrics" template can execute remote JavaScript code
    setup_community_templates: octocat/metrics@master:super-metrics, octocat/metrics@master:trusted-metrics+trust
```

To create a new community template, fork this repository and create a new folder in `/source/templates` with same structure as current templates.
Then, it's just as simple as HTML and CSS with a bit of JavaScript!

If you made something awesome, please share it here!