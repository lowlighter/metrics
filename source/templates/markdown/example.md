# 📒 Markdown template example

See [rendering of this file here](https://github.com/lowlighter/lowlighter/blob/master/metrics.markdown.full.md) and [original template source here](https://github.com/lowlighter/metrics/blob/master/source/templates/markdown/example.md).

## 🧩 Plugins with markdown version

<%- await include(`partials/activity.ejs`) %>

___

<%- await include(`partials/posts.ejs`) %>

___

<%- await include(`partials/rss.ejs`) %>

___

<%- await include(`partials/tweets.ejs`) %>

___

<%- await include(`partials/topics.ejs`) %>

## 🎈 Embedding SVG metrics on-the-fly

<%- await embed(`example-isocalendar`, {isocalendar:true, isocalendar_duration:"full-year", config_display:"large"}) %>

___

<%- await embed(`example-languages-pdf`, {languages:true, languages_details:"percentage, bytes-size", config_display:"large"}) %>

___

<%- await embed(`example-base-pdf`, {base:"activity, community, repositories"}) %>
