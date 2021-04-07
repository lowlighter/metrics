# 📒 Markdown template example

This is a markdown template example which explain the basic usage of this template.

See [rendering of this file here](https://github.com/lowlighter/lowlighter/blob/master/metrics.markdown.full.md).

## 🈂️ Templating syntax:

* Regular EJS syntax is supported
* `{{` and `}}` will be interpolated as EJS brackets (syntaxic sugar)
  * `{%` and `%}` can be used as control statements
* Use [metrics.lecoq.io](https://metrics.lecoq.io/) with `config.output=json` to see available data
  * You can also use `config_output: json` in GitHub Actions and/or inspect [metrics](https://github.com/lowlighter/metrics) code to get available data too
* Same formatting helpers available in templates can be used too

```markdown
I joined GitHub on `{{ f.date(REGISTRATION_DATE, {dateStyle:"short"}) }}`.
I contributed to `{{ REPOSITORIES_CONTRIBUTED_TO }}` repositories and made `{{ COMMITS }}` commits.
```

## 🧩 Markdown plugins

Most of plugins from SVG templates can be reused directly by including image source in markdown, but some have them have their own **markdown** version which includes hyperlinks.

### 📰 Recent activity

<%- await include(`partials/activity.ejs`) %>

### ✒️ Recent posts

*Coming soon*

### 🗼 Rss feed

<%- await include(`partials/rss.ejs`) %>

### 🐤 Latest tweets

*Coming soon*

### 🌇 GitHub Skyline 3D calendar

*Coming soon*

### 📌 Starred topics

<%- await include(`partials/topics.ejs`) %>
