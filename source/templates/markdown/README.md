<!--header-->
<table>
  <tr><td colspan="2"><a href="/README.md#%EF%B8%8F-templates">← Back to templates index</a></td></tr>
  <tr><th colspan="2"><h3>📒 Markdown template</h3></th></tr>
  <tr><td colspan="2" align="center"><p>A template capable of rendering markdown from a given template file.</p>
</td></tr>
  <tr>
    <th rowspan="3">Supported features<br><sub><a href="metadata.yml">→ Full specification</a></sub></th>
    <td><a href="/source/plugins/activity/README.md" title="📰 Recent activity">📰</a> <a href="/source/plugins/posts/README.md" title="✒️ Recent posts">✒️</a> <a href="/source/plugins/rss/README.md" title="🗼 Rss feed">🗼</a> <a href="/source/plugins/topics/README.md" title="📌 Starred topics">📌</a> <a href="/source/plugins/tweets/README.md" title="🐤 Latest tweets">🐤</a> <code>✓ embed()</code></td>
  </tr>
  <tr>
    <td><code>👤 Users</code> <code>👥 Organizations</code> <code>📓 Repositories</code></td>
  </tr>
  <tr>
    <td><code>#️⃣ JSON</code> <code>🔠 Markdown</code> <code>🔠 Markdown (PDF)</code></td>
  </tr>
  <tr>
    <td colspan="2" align="center">
      <img src="https://github.com/lowlighter/metrics/blob/examples/metrics.markdown.png" alt=""></img>
      <img width="900" height="1" alt="">
    </td>
  </tr>
</table>
<!--/header-->

This template can be used to a *markdown template file* with data gathered by metrics.

Since the resulting output is a markdown file, it is possible to do additional formatting such as creating hyperlinks and adding custom texts.

## 🈂️ Templating syntax:

The templating engine is [EJS](https://github.com/mde/ejs) and can be used to interpolate any data retrieved by metrics.

* `<%=` and `%>` are used to display escaped output
  * `{{` and `}}` is also supported as syntaxic sugar
* `<%-` and `%>` are used to display raw output
* `<%` and `%>` are used to execute JavaScript, and can also contains control statements such as conditionals and loops

*Example: basic templating*
```markdown
<!-- template -->
I joined GitHub on `{{ f.date(REGISTRATION_DATE, {date:true}) }}`.
I contributed to `{{ REPOSITORIES_CONTRIBUTED_TO }}` repositories and made `{{ COMMITS }}` commits.

<!-- render -->
I joined GitHub on `20 Oct 2016`.
I contributed to `37` repositories and made `5947` commits.
```

## 🔣 Available data

Any data fetched by metrics and exposed formatting helpers can be used.

It also means that to access plugins data they must be enabled and configured beforehand.

*Example: enabling `plugin_activity` exposes `plugins.activity` data*
```yml
- uses: lowlighter/metrics@latest
  with:
    template: markdown
    plugin_activity: yes
```

> 💡 To avoid failures while accessing data, use [optional chaining operator `?.`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining) or ensure that no errors where reported by a given plugin.

> ⚠️ Although rare, data schemas may change in-between metrics version without any notice (these changes are not documented in release notes). It is advised to use a pinned version or a fork when using this template.

A few properties are aliased in [/source/templates/markdown/template.mjs](/source/templates/markdown/template.mjs) for convenience.

Use `config_output: json` to dump all available data for a given configuration. Power users can also directly read [metrics source code](https://github.com/lowlighter/metrics) to know what is exposed.

For a quick overview, it is also possible to use [metrics.lecoq.io/{username}?config.output=json](https://metrics.lecoq.io).

> 💡 Note however that [metrics.lecoq.io](https://metrics.lecoq.io) has a caching system which may prevent any new result.

## 🧩 Plugins with markdown version

Several plugins have a markdown version which provides better usability, usually with hyperlinks and better text formatting.

*Example: using `✒️ posts` plugin markdown version*
```ejs
<%- await include(`partials/posts.ejs`) %>
```

**[✒️ Recent posts from dev.to](https://dev.to/lowlighter)**
<table>
  <tr>
    <td rowspan="2" width="280">
      <img src="https://res.cloudinary.com/practicaldev/image/fetch/s--rbmokFTg--/c_imagga_scale,f_auto,fl_progressive,h_420,q_auto,w_1000/https://dev-to-uploads.s3.amazonaws.com/i/idot5ak9irxtu948bgzs.png" alt="" width="280">
    </td>
    <th>
      <a href="https://dev.to/lowlighter/metrics-v3-0-the-ultimate-tool-to-pimp-your-github-profile-g7p">Metrics v3.0, the ultimate tool to pimp your GitHub profile!</a>
    </th>
  </tr>
  <tr>
    <td>
      Metrics is an extensive SVG images generator plugged with various APIs (GitHub, Twitter, Spotify, ......
      <br>
      <i>Published on 4 Jan 2021</i>
    </td>
  </tr>
</table>

> 💡 Remember, plugins still need to be enabled and configured in workflow file!

## 🎈 Embedding SVG metrics on-the-fly

An additional feature which makes the markdown template more powerful than its counterparts is that it can also render SVG on the fly using `embed()` function, without creating any additional jobs.

These renders will automatically be pushed to `markdown_cache` folder and included in the markdown render.

```yml
- uses: lowlighter/metrics@latest
  with:
    template: markdown
    markdown_cache: .cache
```

The `embed()` function takes two arguments:
1. An unique file identifier (which will be used to store render in `${markdown_cache}/${file_identifier}`)
2. Configuration options
  - Note that `token` options are automatically passed down from overall configuration, do not pass them again (especially in clear) in it

*Example: embed a `🈷️ languages` SVG render*
```ejs
<%- await embed(`example-languages-pdf`, {languages:true, languages_details:"percentage, bytes-size", config_display:"large"}) %>
```

<img src="https://github.com/lowlighter/metrics/blob/examples/.cache/example-languages-pdf.svg">

> 💡 The `plugin_` prefix can be dropped for convenience

> 💡 The `embed()` function does not have `🗃️ base` plugin enabled by default. To use it, it is required to explicitly pass them through `base` option.

## ℹ️ Examples workflows

<!--examples-->
```yaml
name: Example
uses: lowlighter/metrics@latest
with:
  template: markdown
  filename: metrics.markdown.md
  markdown: >-
    https://raw.githubusercontent.com/lowlighter/metrics/examples/metrics.markdown.template.md
  config_output: markdown
  token: ${{ secrets.METRICS_TOKEN }}

```
```yaml
name: Example with plugins configuration for embed use
uses: lowlighter/metrics@latest
with:
  template: markdown
  filename: metrics.markdown.full.md
  markdown: >-
    https://raw.githubusercontent.com/lowlighter/metrics/master/source/templates/markdown/example.md
  config_output: markdown
  plugin_activity: yes
  plugin_activity_limit: 7
  plugin_activity_days: 0
  plugin_activity_filter: issue, pr, release, fork, review, ref/create
  plugin_posts: yes
  plugin_posts_source: dev.to
  plugin_posts_descriptions: yes
  plugin_posts_covers: yes
  plugin_posts_limit: 2
  plugin_rss: yes
  plugin_rss_source: https://news.ycombinator.com/rss
  plugin_rss_limit: 4
  plugin_tweets: yes
  plugin_tweets_token: ${{ secrets.TWITTER_TOKEN }}
  plugin_tweets_user: github
  plugin_tweets_attachments: yes
  plugin_tweets_limit: 2
  plugin_topics: yes
  plugin_topics_limit: 24
  plugin_isocalendar: yes
  plugin_languages: yes
  token: ${{ secrets.METRICS_TOKEN }}

```
```yaml
name: Example (pdf output)
uses: lowlighter/metrics@latest
with:
  template: markdown
  filename: metrics.markdown.pdf
  markdown: >-
    https://raw.githubusercontent.com/lowlighter/metrics/master/source/templates/markdown/example.pdf.md
  config_output: markdown-pdf
  plugin_rss: yes
  plugin_rss_source: https://news.ycombinator.com/rss
  plugin_rss_limit: 4
  plugin_isocalendar: yes
  config_twemoji: yes
  config_padding: 5%
  token: ${{ secrets.METRICS_TOKEN }}

```
<!--/examples-->
