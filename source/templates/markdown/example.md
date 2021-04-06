# 📒 Markdown template example

This is a markdown template example which explain the basic usage of this template.

## 🈂️ Templating syntax:

* Regular EJS syntax is supported
* `{{` and `}}` will be interpolated as EJS brackets (syntaxic sugar)
  * `{%` and `%}` can be used as control statements
* Use [metrics.lecoq.io](https://metrics.lecoq.io/) with `config.output=json` to see available data
  * You can also use `config_output: json` in GitHub Actions and/or inspect [metrics](https://github.com/lowlighter/metrics) code to get available data too

## 🧩 Markdown plugins

Most of plugins from SVG templates can be reused directly by including image source in markdown, but some have them have their own **markdown** version which includes hyperlinks.

### 📰 Recent activity

<%- await include(`partials/activity.ejs`) %>

### ✒️ Recent posts

*Coming soon*

### 🗼 Rss feed

*Coming soon*

### 🐤 Latest tweets

*Coming soon*

### 🌇 GitHub Skyline 3D calendar

*Coming soon*

### 📌 Starred topics

*Coming soon*
