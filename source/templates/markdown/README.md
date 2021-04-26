### 📒 Markdown

Markdown template can render a **markdown template** by interpreting **templating brackets** `{{` and `}}`.

<table>
  <td align="center">
    <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.markdown.png">
    <img width="900" height="1" alt="">
  </td>
</table>

It can be used to render custom markdown which include data gathered by metrics.
Unlike SVG templates, it is possible to include revelant hyperlinks since it'll be rendered as regular markdown.

You can even mix it with SVG plugins for even more customization using `embed` function.

See [example.md](/source/templates/markdown/example.md) for a markdown template example.

> Note that available data still depends on which plugins have been enabled.
> You may need to handle errors and setup plugins correctly in order to access to their output data.

To find which data can be used, you can run a workflow with `config_output: json`.
For convenience, several useful properties are aliased in [/source/templates/markdown/template.mjs](/source/templates/markdown/template.mjs).

#### ℹ️ Examples workflows

```yaml
- uses: lowlighter/metrics@latest
  with:
    # ... other options
    template: markdown
    filename: README.md      # Output file
    markdown: TEMPLATE.md    # Template file
    markdown_cache: .cache   # Cache folder
    config_output: markdown  # Output as markdown file
```
