# 📒 Markdown template example (pdf)

When using **markdown template**, it is possible to export output as PDF.

See [rendering of this file here](https://github.com/lowlighter/lowlighter/blob/master/metrics.markdown.pdf) and [original template source here](https://github.com/lowlighter/metrics/blob/master/source/templates/markdown/example.pdf.md).

## 🧩 Plugins

You can customize your template with both markdown plugins and SVG plugins like below:

<%- await include(`partials/rss.ejs`) %>

<%- await embed(`test-isocalendar`, {isocalendar:true}) %>
