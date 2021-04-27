# 📒 Markdown template example

This is a markdown template example which explain the basic usage of this template.

See [rendering of this file here](https://github.com/lowlighter/lowlighter/blob/master/metrics.markdown.full.md) and [original template source here](https://github.com/lowlighter/metrics/blob/master/source/templates/markdown/example.md).

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

## 🧩 Plugins

### Using markdown plugins

Some plugins have their own **markdown** version which includes hyperlinks and reduce image overhead.

See [compatibility matrix](https://github.com/lowlighter/metrics#-templateplugin-compatibily-matrix) for more informations.

___

<%- await include(`partials/activity.ejs`) %>

___

<%- await include(`partials/posts.ejs`) %>

___

<%- await include(`partials/rss.ejs`) %>

___

<%- await include(`partials/tweets.ejs`) %>

___

<%- await include(`partials/topics.ejs`) %>

### Embedding SVG metrics

To include SVGs metrics images without creating additional jobs, use the `embed` function:

<%- await embed(`example-isocalendar`, {isocalendar:true, isocalendar_duration:"full-year"}) %>

It takes two arguments:
- An unique identifier which will be used as filename withing `markdown_cache` folder
- Configuration options (see [action.yml](https://github.com/lowlighter/metrics/blob/master/action.yml))
  - Tokens options are automatically passed down from your workflow job, do not pass them again
  - Options syntax is same as web instance (i.e. dots (`.`) instead of underscores (`_`) and no `plugin_` prefixes)
