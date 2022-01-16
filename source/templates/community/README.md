<table>
  <tr><th colspan="2"><h3>📕 Community templates</h3></th></tr>
  <tr><td colspan="2" align="center">A template capable of rendering markdown from a given template file.</td></tr>
  <tr>
    <td  colspan="2" align="center">
      <img src="https://github.com/lowlighter/metrics/blob/examples/metrics.markdown.png" alt=""></img>
      <img width="900" height="1" alt="">
    </td>
  </tr>
</table>

Community templates are a way to use official releases of [lowlighter/metrics](https://github.com/lowlighter/metrics) while using templates from external repositories (owned or not).

## 📮 Using community templates

Use `setup_community_templates` option to specify additional external sources using following format:
```
user/repo@branch:template
```

These templates will be downloaded through git and will be usable by prefixing their name with an `@`.

*Example: using `my-theme` template by downloading it from `user/repo`*
```yml
- uses: lowlighter/metrics@latest
  with:
    template: "@my-theme"
    setup_community_templates: "user/repo@main:my-theme"
```

For security reasons, community templates will use the `classic` template `template.mjs` instead of their own.
If you trust a community template, append `+trust` to it.

*Example: using and trusting `my-theme` template by downloading it from `user/repo`*
```yml
- uses: lowlighter/metrics@latest
  with:
    template: "@my-theme"
    setup_community_templates: "user/repo@main:my-theme+trust"
```

> ⚠️ Note that it basically allow remote code execution and the template may have access to **sensitive data** along with **tokens**! Use this feature only from a trusted source. Remember that its content may also change at any time...

Some templates may accept additional custom parameters that can be passed through the `query` option, using a JSON formatted string.

*Example: using and trusting `my-theme` template by downloading it from `user/repo`*
```yaml
- uses: lowlighter/metrics@latest
  with:
    template: "@my-theme"
    query: |
      {
        "header_color": "#FF0000"
      }
```

## ℹ️ Examples workflows

<!--examples-->
```yaml
name: Using a community template
uses: lowlighter/metrics@latest
with:
  token: ${{ secrets.METRICS_TOKEN }}
  template: '@classic'
  setup_community_templates: lowlighter/metrics@master:classic

```
```yaml
name: Using a trusted community template
uses: lowlighter/metrics@latest
with:
  token: ${{ secrets.METRICS_TOKEN }}
  template: '@terminal'
  setup_community_templates: lowlighter/metrics@master:terminal+trust

```
<!--/examples-->
```

### 💬 Creating partials

Just create a new `.ejs` file in `partials` folder, and reference it into `partials/_.json`.

It should be able to handle gracefully plugins state and errors.

Below is a minimal snippet of a partial:
```ejs
<% if (plugins.gists) { %>
  <% if (plugins.gists.error) { %>
    <%= plugins.gists.error.message %>
  <% } else { %>
    <%# content %>
  <% } %>
<% } %>
```

Partials should have the match the same name as plugin handles, as they're used to display plugin compatibility in auto-generated header.

### 💬 Adding custom fonts

> ⚠️ This significantly increases rendered metrics filesize and thus not recommended. You should restrict charset when using this feature

Here's a quick step-by-step tutorial to create base64 encoded fonts:
- 1. Find a font on [fonts.google.com](https://fonts.google.com)
    - Select regular, bold, italic and bold+italic fonts
    - Open `embed` tab and extract `href`
- 2. Open extracted `href` in a browser and append `&text=` parameter with list of used characters
    - e.g. `&text=0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz`
- 3. Download each font file from urls present in generated stylesheet
- 4. Convert them into base64 with `woff` format on [transfonter.org](https://transfonter.org)
- 5. Download archive and extract it
- 6. Copy content of generated stylesheet to `fonts.css`
- 7. Update `style.css` to use the new font
