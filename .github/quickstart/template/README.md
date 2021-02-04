### 📕 <%= `${name.charAt(0).toLocaleUpperCase()}${name.substring(1)}` %> template

<table>
  <td align="center">
    <img src="">
    <img width="900" height="1" alt="">
  </td>
</table>

#### ℹ️ Examples workflows

```yaml
- uses: lowlighter/metrics@latest
  with:
    # ... other options
    setup_community_templates: user/metrics@master:<%= name %>
    template: "@<%= name %>"
```