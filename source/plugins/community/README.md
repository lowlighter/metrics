<table>
  <tr><th colspan="2"><h3>🎲 Community plugins</h3></th></tr>
  <tr><td colspan="2" align="center">Additional plugins maintained by community for even more features!</td></tr>
  <tr>
    <th><a href="source/plugins/community/nightscout/README.md">💉 Nightscout</a></th>
    <th><a href="source/plugins/community/poopmap/README.md">💩 PoopMap plugin</a></th>
  </tr>
  <tr>
    <td  align="center">
      <img alt="" width="400" src="https://github.com/legoandmars/legoandmars/blob/master/metrics.plugin.nightscout.svg" alt=""></img>
      <img width="900" height="1" alt="">
    </td>
    <td  align="center">
      <img alt="" width="400" src="https://github.com/matievisthekat/matievisthekat/blob/master/metrics.plugin.poopmap.svg" alt=""></img>
      <img width="900" height="1" alt="">
    </td>
  </tr>  <tr>
    <th><a href="source/plugins/community/screenshot/README.md">📸 Website screenshot</a></th>
    <th><a href="source/plugins/community/stock/README.md">💹 Stock prices</a></th>
  </tr>
  <tr>
    <td  align="center">
      <img alt="" width="400" src="https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.screenshot.svg" alt=""></img>
      <img width="900" height="1" alt="">
    </td>
    <td  align="center">
      <img alt="" width="400" src="https://github.com/lowlighter/metrics/blob/examples/metrics.plugin.stock.svg" alt=""></img>
      <img width="900" height="1" alt="">
    </td>
  </tr>
</table>

## 📪 Creating community plugins

Plugins creation requires you to be comfortable with JavaScript, HTML, CSS and [EJS](https://github.com/mde/ejs).

### 💬 Before creating a new plugin

Be sure to read [contribution guide](/CONTRIBUTING.md) and [architecture](/ARCHITECTURE.md) first.

> ℹ️ *metrics* maintainers have no obligation towards community plugins support and may redirect any help, feature or fix requests from other users to you. Of course you are not bound to work on it, but it would be great if you plan to merge a plugin in the main repository

Please respect the following guidelines:

- A plugin should be independant and should not rely on other plugins
  - [🧱 core](/source/plugins/core/README.md) and [🗃️ base](/source/plugins/base/README.md) output can be reused though
- A plugin should never edit its original arguments, as the object is shared amongst other plugins and would create unattended side effects
- Use `imports.metadata.plugins.{plugin-name}.inputs()` to automatically typecheck and default user inputs through defined `metadata.yml`
- Plugin options should respect the "lexical field" of existing option to keep consistency
- Plugin errors should be handled gracefully by partials with error message
- New dependencies should be avoided, consider using existing `imports`
- Spawning sub-process should be avoided, unless absolute necessity
  - Use `imports.which()` to detect whether a command is available
  - Use `imports.run()` to run a command
    - Pass `{prefixed: true}` to wrap automatically command with [WSL](https://docs.microsoft.com/windows/wsl/about) on Windows
  - It is required to work on Linux Ubuntu (as the GitHub action run on it)

### 💬 Quick-start

To create a new plugin, clone and setup this repository first:
```shell
git clone https://github.com/lowlighter/metrics.git
cd metrics/
npm install
```

Find a cool name and an [unused emoji](https://emojipedia.org) for your new plugin and run the following:
```shell
npm run quickstart plugin <plugin_name>
```

> ⚠️ Community plugins cannot have the same name as official plugins. *metrics* maintainers may also reserve a plugin name for future usage and may ask you to rename it in case of conflicts

It will create a new directory in `/source/plugins/community` with the following file structure:
* `/source/plugins/community/{plugin-name}`
  * `README.md`
  * `metadata.yml`
  * `examples.mjs`
  * `index.mjs`

Plugins are auto-loaded based on their folder existence, so there's no need to register them somewhere.

### 💬 Filling `metadata.yml`

`metadata.yml` is a required file which describes supported account types, output formats, scopes, etc.

The default file looks like below:
```yaml
name: "🧩 Plugin name"
category: community
description: Short description
examples:
  default: https://via.placeholder.com/468x60?text=No%20preview%20available
supports:
  - user
  - organization
  - repository
scopes: []
inputs:

  plugin_{name}:
    description: Enable {name} plugin
    type: boolean
    default: no
```

> 💡 It is important to correctly define `metadata.yml` because *metrics* will use its content for various usage

[`🧱 core`](/source/plugins/core/README.md) plugin (which is always called) will automatically verify user inputs against `supports` and `inputs` values and throw an error in case of incompatibility.

`name`, `description`, `scopes`, `examples` are used to auto-generate documentation in the `README.md`. For community plugins, `examples` should be set with auto-generated examples of your own profile.

`category` should be set to `community`.

Because of GitHub Actions original limitations, only strings, numbers and boolean were actually supported by `action.yml`. *metrics* implemented its own `inputs` validator to circumvent this. It should be pretty simple to use.

*Example: boolean type, defaults to `false`*
```yml
  plugin_{name}_{option}:
    description: Boolean type
    type: boolean
    default: no
```

```yml
  plugin_{name}_{option}:
    description: String type
    type: string
    default: .user.login
```

> 💡 `.user.login`, `.user.twitter` and `.user.website` are special default values that will be respectively replaced by user's login, Twitter username and attached website. Note that these are not available if `token: NOT_NEEDED` is set by user

*Example: string type, defaults to `foo` with `foo` or `bar` as allowed values*
```yml
  plugin_{name}_{option}:
    description: Select type
    type: string
    values:
      - foo
      - bar
    default: foo
```

> 💡 `values` restricts what can be passed by user

*Example: number type, defaults to `1` and expected to be between `0` and `100`*
```yml
  plugin_{name}_{option}:
    description: Number type
    type: number
    default: 1
    min: 0
    max: 100
```

> 💡 `min` and `max` restricts what can be passed by user. Omit these to respectively remove lower and upper limits.

> 💡 Zero may have a special behaviour (usually to disable limitations), if that's the case add a `zero` attribute (e.g. `zero: disable`) to reference this in documentation

*Example: array type, with comma-separated elements*
```yml
  plugin_{name}_{option}:
    description: Array type
    type: array
    format: comma-separated
    values:
      - foo
      - bar
    default: foo, bar
```

> 💡 An array can be either `comma-separated` or `space-separated`, and will split user input by mentioned separator. Each value is trimmed and lowercased.

*Example: json type*
```yml
  plugin_{name}_{option}:
    description: JSON type
    type: json
    default: |
      {
        "foo": "bar"
      }
```

> 💡 JSON types should be avoided when possible, as they're usually kind of unpractical to write within a YAML document

For complex inputs, pass an `example` that will be displayed as a placeholder on web instances.

When calling `imports.metadata.plugins.{plugin-name}.inputs({data, account, q})`, an object with verified user inputs and correct typing will be returned.

Any invalid input will use have the `default` value instead.

> ⚠️ Returned object will use the web syntax for options rather than the action one. It means that `plugin_` prefix is dropped, and all underscores (`_`) are replaced by dots (`.`)

*Example: validating user inputs*
```javascript
let {limit, "limit.field":limit_field} = imports.metadata.plugins.myplugin.inputs({data, account, q})
console.assert(limit === true)
```

### 💬 Filling `index.mjs`

> 🚧 Will be available at a later date

### 💬 Creating partials

Just create a new `.ejs` file in `partials` folder from templates you wish to support, and reference it into their `partials/_.json`.

Plugin partials should be able to handle gracefully their own state and errors.

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

[EJS](https://github.com/mde/ejs) framework is used to template content through templating tags (``).

### 💬 Filling `examples.yml`

Workflow examples from `examples.yml` are used as unit testing and to auto-generate documentation in the `README.md`.

It uses the same syntax as GitHub action and looks like below:
```yml
- name: Test name
  uses: lowlighter/metrics@latest
  with:
    filename: metrics.plugin.{name}.svg
    token: ${{ secrets.METRICS_TOKEN }}
    base: ""
    plugin_{name}: yes
  prod:
    skip: true
  test:
    timeout: 1800000
    modes:
      - action
      - web
      - placeholder
```

> 💡 Tests are executed in a mocked environment to avoid causing charges on external services. It may be required to create mock testing files.

`test` is usually not needed and optional but can be set to set a custom timeout (for plugins with a high execution time) and `modes` can be used to restrict which environment should be used.

`prod` should keep `skip: true` as you should use your own render outputs as examples.

### 💬 Filling `README.md`

`README.md` is used as documentation.

Most of it will is auto-generated by `metadata.yml` and `examples.yml` content, so usually it is not required to manually edit it.

The default content looks like below:
```markdown
<ǃ--header-->
<ǃ--/header-->

## ➡️ Available options

<ǃ--options-->
<ǃ--/options-->

## ℹ️ Examples workflows

<ǃ--examples-->
<ǃ--/examples-->
```

- `<ǃ--header-->` will be replaced by an auto-generated header containing plugin name, supported features and output examples based on `metadata.yml`
- `<ǃ--options-->` will be replaced by an auto-generated table containing all referenced option from `metadata.yml`
- `<ǃ--examples-->` will be replaced by workflows from `examples.yml`

When a plugin requires a token, please add a `## 🗝️ Obtaining a {service} token` section after the available options section.

Complex features may also be documented in additional sections after available options section options if required.

Try to respect current format of `README.md` from other plugins and use a neutral and impersonal writing style if possible.
