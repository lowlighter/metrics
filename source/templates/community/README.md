<table>
  <tr><th colspan="2"><h3>📕 Community templates</h3></th></tr>
  <tr><td colspan="2" align="center">A template capable of rendering markdown from a given template file.</td></tr>
  <tr>
    <td  colspan="2" align="center">
      <img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.markdown.png" alt=""></img>
      <img width="900" height="1" alt="">
    </td>
  </tr>
</table>

___

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

## 📪 Creating community templates

To create a new template, start a new repository and create a new folder in `/source/templates` with the same file structure as in [lowlighter/metrics](https://github.com/lowlighter/metrics) templates:

* `/source/templates`
  * `{template-name}`
    * `README.md`,
    * `metadata.yml`,
    * `image.svg`
    * `partials/`
      * `_.json`
      * `*.ejs`

Then use HTML, CSS, and [EJS](https://github.com/mde/ejs) to create something awesome!
Do not hesitate to share it on [GitHub discussions](https://github.com/lowlighter/metrics/discussions)!

For more information, see [contribution guide](/CONTRIBUTING.md).

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