### 📒 Markdown (🚧 v3.7)

Markdown template can render a **markdown template** by interpreting **templating brackets** `{{` and `}}`.

<table>
  <td align="center">
    <img width="900" height="1" alt="">
  </td>
</table>

It can be used to render custom markdown which include data gathered by metrics.
Unlike SVG templates, it is possible to include revelant hyperlinks since it'll be rendered as regular markdown.

You can even mix it with SVG plugins for even more customization.

See [example.md](/source/templates/markdown/example.md) for a markdown template example.

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
