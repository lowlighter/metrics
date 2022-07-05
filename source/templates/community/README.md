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
  template: "@classic"
  setup_community_templates: lowlighter/metrics@master:classic

```
```yaml
name: Using a trusted community template
uses: lowlighter/metrics@latest
with:
  token: ${{ secrets.METRICS_TOKEN }}
  template: "@terminal"
  setup_community_templates: lowlighter/metrics@master:terminal+trust

```
<!--/examples-->

## 📪 Creating community templates

Templates creation requires you to be comfortable with HTML, CSS and [EJS](https://github.com/mde/ejs).

### 💬 Quick-start

To create a new template, clone and setup this repository first:
```shell
git clone https://github.com/lowlighter/metrics.git
cd metrics/
npm install
```

Find a cool name for your new template and run the following:
```shell
npm run quickstart template <template_name>
```

It will create a new directory in `/source/templates` with the following file structure:
* `/source/templates/{template-name}`
  * `README.md`
  * `metadata.yml`
  * `image.svg`
  * `partials/`
    * `_.json`
    * `*.ejs`

Templates are auto-loaded based on their folder existence, so there's no need to register them somewhere.

### 💬 Understanding `image.svg`

Usually `image.svg` doesn't need to be edited too much, but let's explain it how it works.

```html
<svg xmlns="http://www.w3.org/2000/svg" width="480" height="99999" class="<%= !animated ? 'no-animations' : '' %>">

  <defs><style><%= fonts %></style></defs>
  <style data-optimizable="true"><%= style %></style>

  <foreignObject x="0" y="0" width="100%" height="100%">
    <div xmlns="http://www.w3.org/1999/xhtml" xmlns:xlink="http://www.w3.org/1999/xlink">
      <% for (const partial of [...partials]) { %>
        <%- await include(`partials/${partial}.ejs`) %>
      <% } %>

      <div id="metrics-end"></div>
    </div>
  </foreignObject>

</svg>
```

#### ℹ️ EJS syntax

[EJS](https://github.com/mde/ejs) framework is used to programmatically create content through the help of templating tags (`<% %>`).

#### ℹ️ Styling

`fonts` and `style` variables are respectively populated with `fonts.css` and `styles.css` files content (or will fallback to those of `classic` template inexistent).

These will define the global design of the output.

`data-optimizable="true"` tells that a `style` tag can be safely minified and purged by CSS post-processors.

#### ℹ️ Partials

`partials` variable is populated with `partials/_.json` file content and define which files should be included along with default ordering.

The loop iterates over this array to include all defined partials. Each partial should handle whether it should be displayed by itself.

#### ℹ️ `#metrics-end` tag

`#metrics-end` is a special HTML tag which must remain at the bottom of SVG template.

It is used to compute height dynamically through a [puppeteer](https://github.com/puppeteer/puppeteer) headless instance. Initial height should remain a high number so it doesn't get cropped accidentally while [puppeteer](https://github.com/puppeteer/puppeteer) compute [element.getBoundingClientRect()](https://developer.mozilla.org/fr/docs/Web/API/Element/getBoundingClientRect).

### 💬 Filling `metadata.yml`

`metadata.yml` is a required file which describes supported account types, output formats, scopes, etc.

The default file looks like below:
```yaml
name: 🖼️ Template name
extends: classic
description: |
  Short description
examples:
  default: https://via.placeholder.com/468x60?text=No%20preview%20available
supports:
  - user
  - organization
  - repository
formats:
  - svg
  - png
  - jpeg
  - json
  - markdown
  - markdown-pdf
```

> 💡 It is important to correctly define `metadata.yml` because *metrics* will use its content for various usage

[`🧱 core`](/source/plugins/core/README.md) plugin (which is always called) will automatically verify user inputs against `supports` and `formats` values and throw an error in case of incompatibility.

`extends` is used to define the fallback for `template.mjs` when a template is not trusted by user (depending  on whether you're building an user/organization or repository template, it is advised to either use `classic` or `repository`).

`name`, `description` and `examples` are used to auto-generate documentation in the `README.md`.

### 💬 Filling `examples.yml`

Workflow examples from `examples.yml` are used to auto-generate documentation in the `README.md`.

### 💬 Filling `README.md`

`README.md` is used as documentation.

Most of it will is auto-generated by `metadata.yml` and `examples.yml` content, so usually it is not required to manually edit it.

The default content looks like below:
```markdown
<ǃ--header-->
<ǃ--/header-->

## ℹ️ Examples workflows

<ǃ--examples-->
<ǃ--/examples-->
```

- `<ǃ--header-->` will be replaced by an auto-generated header containing template name, supported features and output examples based on `metadata.yml`
- `<ǃ--examples-->` will be replaced by workflows from `examples.yml`

### 💬 Creating partials

Just create a new `.ejs` file in `partials` folder, and reference it into `partials/_.json`.

It should be able to handle gracefully plugins state and errors.

Below is a minimal snippet of a partial:
```ejs
<% if (plugins.{plugin_name}) { %>
  <% if (plugins.{plugin_name}.error) { %>
    <%= plugins.{plugin_name}.error.message %>
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