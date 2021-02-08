# 📊 Metrics

## 💪 Interested in contributing?

Nice! Read the few sections below to understand how this project is structured and how to implement new features.

## 👨‍💻 Extending metrics

This section explains how to create new templates and plugins. It also contains references about used packages, global project structure and list which contributions on are accepted.

### 🤝 Accepted contributions

Thanks for your interest in [metrics](https://github.com/lowlighter/metrics) and wanting to help it growing!

Review below which contributions are accepted:
<table>
  <tr>
    <th>Section</th>
    <th colspan="2">Addition</th>
    <th colspan="2">Editions</th>
  </tr>
  <tr>
    <td>🧩 Plugins</td>
    <td>✔️</td>
    <td>✔️</td>
    <td>
      <ul>
        <li>New plugins are welcomed provided they're not redundant with existing plugins</li>
        <li>New features for existing plugins are allowed but must be optional</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>🖼️ Templates</td>
    <td>❌</td>
    <td>⭕</td>
    <td>
      <ul>
        <li>New templates are not allowed (use <a href="https://github.com/lowlighter/metrics/blob/master/source/templates/community/README.md">📕 Community templates</a> instead)</li>
        <li>Templates editions are allowed for new features additions (but must remain consistent with current visuals)</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>🧪 Tests</td>
    <td>✔️</td>
    <td>✔️</td>
    <td>
      <ul>
        <li>Everything that make metrics more stable is welcomed!</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>🧱 Core</td>
    <td>❌</td>
    <td>⭕</td>
    <td>
      <ul>
        <li>Core editions impacts all rendering process and should be avoided unless necessary</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>🗃️ Repository</td>
    <td>❌</td>
    <td>❌</td>
    <td>
      <ul>
        <li>Workflows, license, readmes, etc. usually don't need to be edited</li>
      </ul>
    </td>
  </tr>
</table>

**Legend**
* ✔️: Contributions welcomed!
* ⭕: Contributions welcomed, but must be discussed first
* ❌: Only maintainers can manage these files

Before working on something, ensure that it isn't already [in progress](https://github.com/lowlighter/metrics/projects/1#column-12158618) and that it will not duplicate any open pull requests (including drafts).
If you're unsure, always open an issue first to get insights and gather feedback.

Even if your changes don't get merged in [lowlighter/metrics](https://github.com/lowlighter/metrics), please don't be too sad.
Metrics is designed to be highly customizable, so you can always decide to generate metrics on your forked repository 🙂!

</details>

<details>
<summary>🖼️ Templates</summary>

Templates require you to be comfortable with HTML, CSS and JavaScript ([EJS](https://github.com/mde/ejs) flavored).

Metrics does not really accept contributions on [default templates](https://github.com/lowlighter/metrics/tree/master/source/templates) in order to avoid bloating main repository with a lot of templates and to keep visual consistency across all version, but fear not! Users will still be able to use your custom templates thanks to [community templates](source/templates/community)!

If you make something awesome, don't hesitate to share it!

<details>
<summary>💬 Creating a new template from scratch</summary>

Find a cool name for your template and run:
```shell
npm run quickstart -- template <template_name>
```

It will create a new folder in [`source/templates`](https://github.com/lowlighter/metrics/tree/master/source/templates) with the following files:
- A `README.md` to describe your template and document it
- An `image.svg` with base structure for rendering
- A `partials/` folder where you'll be able to implement parts of your template
  - A `partials/_.json` with a JSON array listing these parts in the order you want them displayed (unless overridden by user with `config_order` option)

If needed, you can also create the following optional files:
- A `fonts.css` containing base64 encoded custom fonts
- A `styles.css` with custom CSS that'll style your template
- A `template.mjs` with additional data processing and formatting at template-level
  - When your template is used through `setup_community_templates` on official releases, this is disabled by default unless user trusts it by appending `+trust` at the end of source

If inexistent, these will fallback to [`classic`](https://github.com/lowlighter/metrics/tree/master/source/templates/classic) template files.

Templates are auto-loaded based on their folder existence, so there's no need to register them somewhere.

</details>

<details>
<summary>💬 Creating <code>image.svg</code> and partials</summary>

The base structure for rendering looks like below:
```html
<svg xmlns="http://www.w3.org/2000/svg" width="480" height="99999" class="<%= !animated ? 'no-animations' : '' %>">

  <defs><style><%= fonts %></style></defs>
  <style><%= style %></style>

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

- `fonts` and `style` variables will both be populated with the same content as your `fonts.css` and `styles.css` files
  - (or thos of `classic` template files if inexistent)
- `partials` variable will be populated with `partials/_.json` content
  - Main loop will iterate over this array to include all defined partials
- `#metrics-end` is a special HTML tag which must remain at the bottom of SVG template
  - This is used to compute dynamically height through a [puppeteer](https://github.com/puppeteer/puppeteer) headless instance
  - SVG height must also be set to a high number so it doesn't get cropped accidentally while [puppeteer](https://github.com/puppeteer/puppeteer) compute [element.getBoundingClientRect()](https://developer.mozilla.org/fr/docs/Web/API/Element/getBoundingClientRect)

As you can see, we exploit the fact that SVG images are able to render HTML and CSS content so designing partials is the same as creating static web pages.

[EJS](https://github.com/mde/ejs) framework is also used to programmatically create content through the help of templating tags (`<% %>`).

</details>

<details>
<summary>💬 Adding custom fonts</summary>

    ⚠️ This significantly increases rendered metrics filesize and thus not recommended

When using this feature, you should aim to restrict used charset to avoid including useless data.

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
- 7. Update your template `style.css` to use the new font

</details>

</details>


<details>
<summary>🧩 Plugins</summary>

Plugins lets add new features with additional content to rendered metrics and are coded with [JavaScript modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules).

New plugins are welcomed, but maintainers have no obligation to maintain them.
It means you (as author) may be notified about open issues regarding related plugin.

<details>
<summary>💬 Creating a new plugin from scratch</summary>

Find a cool name for your plugin and run:
```shell
npm run quickstart -- plugin <plugin_name>
```

It will create a new folder in [`source/plugins`](https://github.com/lowlighter/metrics/tree/master/source/plugins) with the following files:
- A `README.md` to describe your plugin and document it
- An `index.mjs` with minimal plugin code
- A `metadata.yml` which list plugin attributes and inputs
- A `tests.yml` for unit tests

Here are some guidelines to follow about plugins:
- They should never be dependent on output produced by other plugins (though allowed to re-use core and base data)
  - It allows parallelization of plugins execution
  - It avoids creating inter-dependencies which makes it confusing for both developers and users
- Use of new external dependencies should be avoided
  - Adding new libraries to use only ~5% of its possibilities is just a waste
    - For APIs, most of the time a few HTTP calls instead of installing a full SDK wrapper is more than sufficient
    - `imports` probably already contains a library or a function that can help you achieving what you want
    - It also add more unstability as it external changes are
- Use of raw commands should be avoided when (spawning sub-process)
  - It allows metrics to be platform agnostic (i.e. working on most OS)
  - If mandatory:
    - Use [`which`](https://linux.die.net/man/1/which) detect whether command is available
    - For Windows, wrap command with [WSL](https://docs.microsoft.com/windows/wsl/about)
- Errors should be handled gracefully with error messages
- Plugins arguments should **NEVER** be directly edited from inside a plugin
  - These are used by all plugins, including core and base so it would create unattended side effects
- They should let end user with some customization options (limit entries, detailed output, etc.)

You'll also need to an unused [emoji](https://emojipedia.org) to use as your plugin icon.

Plugins are auto-loaded based on their folder existence, so there's no need to register them somewhere.

</details>

<details>
<summary>💬 Implementing <code>index.mjs</code> and gathering new data from external APIs</summary>

Default exported function in `index.mjs` will receive the following inputs:
- `login`, set to GitHub login
- `q`, with query parameters (formatted with dots (`.`) instead of underscores (`_`) and without `plugin_` prefix)
- `imports`, with libraries and utilitaries
  - `imports.url` for [NodeJS `url` library](https://nodejs.org/api/url.html)
  - `imports.os` for [NodeJS `os` library](https://nodejs.org/api/os.html)
  - `imports.fs` for [NodeJS `fs` library](https://nodejs.org/api/fs.html)
  - `imports.paths` for [NodeJS `paths` library](https://nodejs.org/api/paths.html)
  - `imports.util` for [NodeJS `util` library](https://nodejs.org/api/util.html)
  - `imports.imgb64` for [renanbastos93/image-to-base64](https://github.com/renanbastos93/image-to-base64)
  - `imports.axios` for [axios/axios](https://github.com/axios/axios)
  - `imports.puppeteer` for [puppeteer/puppeteer](https://github.com/puppeteer/puppeteer)
  - `imports.run` is an helper to run raw command
  - `imports.shuffle` is an helper to shuffle array
  - `imports.__module` is an helper to find `__dirname` from a module `import.meta.url`
  - And more...
- `data` and `computed`, with all data gathered from core and base
- `graphql` and `rest`, with authenticated [octokit clients](https://github.com/octokit) (for GitHub APIs)
- `queries`, with autoloaded GraphQL queries and replacers
- `account`, set to account type ("user" or "organization")

Second input contains configuration settings from [settings.json](https://github.com/lowlighter/metrics/blob/master/settings.example.json) (which is mostly used by web instances) and all also user inputs of type `token`.

As said previously, plugins arguments should **NEVER** be directly edited from it, since these are used by all plugins, including core and base so it would create unattended side effects.

As for data gathering:
  - Related to GitHub, use `graphql` (for [GraphQL API](https://docs.github.com/en/graphql)) or `rest` [REST API](https://docs.github.com/en/rest)
  - From Third-Party services, use [`imports.axios`](https://github.com/axios/axios) to make APIs calls
  - In last resort, use `imports.puppeteer`

For GraphQL queries, use `queries` which will auto-load all queries from `queries` directory and will lets you create custom queries on the fly.

For example:
```js
//Calling this
  await graphql(queries.myquery({login:"github-user", account:"user"}))

//With this in source/queries/myquery.graphql
  query MyQuery {
    $account(login: "$login") {
      name
    }
  }

//Will have the same result as calling this
  await graphql(`
    query MyQuery {
      user(login: "github-user") {
        name
      }
    }
  `)
```

</details>


<details>
<summary>💬 Filling <code>metadata.yml</code></summary>

`metadata.yml` is a mandatory file which describes what inputs are allowed, which entities are supported, etc.

Here's an example:
```yaml
name: "🧩 Plugin name (with emoji icon)"
cost: Estimates how many GitHub requests is used during plugin execution ("N/A" for Third-Party services)
supports:
  - user          # Support users account
  - organization  # Support organizations account
  - repository    # Support repositories metrics
inputs:

  # A comment detailing input purposes
  # An input must have at least a "description" and a "default" (used to generated GitHub Action `action.yml`)
  plugin_input:
    description: Short description (few words)
    type: boolean
    default: no
```

Because of GitHub Actions limitations, only strings and numbers are actually supported by `action.yml` inputs.
Metrics apply additional post-processing to handle inputs.

Supported input types are `boolean`, `string`, `number`, `array` and `json`.

- Allowed values for `string` and `array` may be restricted using `values` attribute
  - Special default values `.user.login`, `.user.twitter` and `.user.website` will respectively be replaced by user's login, Twitter username and website (not available when `token` is set to `NOT_NEEDED` by user  )
- Lower and upper limits for `number` may be set using `min` and `max` attribute
- Array `format` attribute define how string should be splitted (`comma-separated` or `space-separated`)

You can additionally specify an `example` which will also be used in web instance input placeholder.

Inputs will be available through `imports.metadata.plugins.name.inputs` with correct typing and default values (`plugin_` prefix will be dropped, and all underscored (`_`) will be changed to dots (`.`) instead):
```javascript
//Load inputs
  let {limit, "limit.field":limit_field} = imports.metadata.plugins.name.inputs({data, account, q})
```

Additionally, if `account` isn't supported, this method will automatically prevent your plugin from running by throwing an error.

</details>

<details>
<summary>💬 Creating a new partial</summary>

In templates you want to support, create a new `.ejs` file in `partials` folder and paste the following for a quick start:
```html
<% if (plugins./* your plugin name */) { %>
  <section>
    <div class="row">
      <% if (plugins./* your plugin name */.error) { %>
        <section>
          <div class="field error">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16"><path fill-rule="evenodd" d="M2.343 13.657A8 8 0 1113.657 2.343 8 8 0 012.343 13.657zM6.03 4.97a.75.75 0 00-1.06 1.06L6.94 8 4.97 9.97a.75.75 0 101.06 1.06L8 9.06l1.97 1.97a.75.75 0 101.06-1.06L9.06 8l1.97-1.97a.75.75 0 10-1.06-1.06L8 6.94 6.03 4.97z"></path></svg>
            <%= plugins./* your plugin name */.error.message %>
          </div>
        </section>
      <% } else { %>
          <section>
            <%# Do stuff in there -%>
          </section>
      <% } %>
    </div>
  </section>
<% } %>
```

- First conditional statement ensures that partial is displayed only when plugin is enabled
- Nested conditional statement check plugin output
  - If it failed, an error message instead will be displayed instead
  - If it succeeded, second section in render.

Additional CSS rules may be added to `style.css` of edited template, but ensure it does not break other plugins rendering.

</details>


<details>
<summary>💬 Fast prototyping and testing</summary>

The easiest way to test and prototype your plugin is to setup a web instance. See [documentation](https://github.com/lowlighter/metrics#%EF%B8%8F-deploying-your-own-web-instance-15-min-setup-depending-on-your-sysadmin-knowledge) for more informations about that.

Open a browser and try to generate metrics with new your plugin enabled to see if it works as expected:
```
http://localhost:3000/your-github-login?base=0&your-plugin-name=1
```

Once ready, define test cases in your plugin directory `tests.yml`.

These tests will be run with:
  - Metrics action
  - Metrics web instance
  - Metrics web instance placeholder (rendered by browser)

Most APIs (including GitHub) usually have a rate-limit to ensure quality of service.
This is why APIs output must be mocked and added in [`source/app/mocks/api/`](/source/app/mocks/api) in order for tests to be able to be performed anytime.

Files from these directories are auto-loaded, so you just need to create new functions (see other mocked data for examples).

Finally, edit [source/app/web/statics/app.placeholder.js](https://github.com/lowlighter/metrics/blob/master/source/app/web/statics/app.placeholder.js) to add mocked result (but this time from metrics server) so users will be able to render placeholder preview in web instance.

</details>

<details>
<summary>💬 Submitting a pull request</summary>

Ensure that:
- `metadata.yml` is correctly filled
- `tests.yml` has defined test cases
- `mocks/api` has mocked data for external APIs
- `app.placeholder.js` has been updated with mocked plugin output
- `README.md` of plugin explain how plugin works
  - `<table>` tag **MUST** remain present (along with `<img width="900" height="1" alt="">`) as these are extracted for global `README.md`
- `npm run linter` outputs no errors
- `npm test` is successful

Use `config.output` option to render a PNG version of your plugin:
```
http://localhost:3000/your-github-login?base=0&your-plugin-name=1&config.output=png
```

And finally open a new [pull request](https://github.com/lowlighter/metrics/pulls) and ensure that all builds succeed.

Global `README.md`, `plugins/README.md`, `templates/README.md`, `action.yml` and `settings.example.json` are automatically rebuild by GitHub action, do not edit them manually.

```markdown
### 🧩 Your plugin name

<table>
  <td align="center">
    <img src="">
    <img width="900" height="1" alt="">
  </td>
</table>

#### ℹ️ Examples workflows

[➡️ Available options for this plugin](metadata.yml)

'''yaml
- uses: lowlighter/metrics@latest
  with:
    # ... other options
    plugin_custom: yes
'''

```

Note that you **must** keep .

</details>


<details>
<summary>🗂️ Project structure</summary>

This section explain how metrics is structured.

* `source/app/metrics/` contains core metrics files
* `source/app/action/` contains GitHub action files
  * `index.mjs` contains GitHub action entry point
  * `action.yml` contains GitHub action descriptor
* `source/app/web/` contains web instance files
  * `index.mjs` contains web instance entry point
  * `instance.mjs` contains web instance source code
  * `settings.example.json` contains web instance settings example
  * `statics/` contains web instance static files
    * `app.js` contains web instance client source code
    * `app.placeholder.js` contains web instance placeholder mocked data
* `source/app/mocks/` contains mocked data files
  * `api/` contains mocked api data
    * `axios/` contains external REST APIs mocked data
    * `github/` contains mocked GitHub api data
  * `index.mjs` contains mockers
* `source/plugins/` contains source code of plugins
  * `README.md` contains plugin documentation
  * `metadata.yml` contains plugin metadata
  * `index.mjs` contains plugin source code
  * `queries/` contains plugin GraphQL queries
* `source/templates/` contains templates files
  * `README.md` contains template documentation
  * `image.svg` contains template image used to render metrics
  * `style.css` contains style used to render metrics
  * `fonts.css` contains additional fonts used to render metrics
  * `template.mjs` contains template source code
* `tests/` contains tests
  * `metrics.test.js` contains metrics testers
* `Dockerfile` contains docker instructions used to build metrics image
* `package.json` contains dependencies and command line aliases

</details>

<details>
<summary>📦 Packages</summary>

Below is a list of used packages.

* [express/express.js](https://github.com/expressjs/express) and [expressjs/compression](https://github.com/expressjs/compression)
  * To serve, compute and render a GitHub user's metrics
* [nfriedly/express-rate-limit](https://github.com/nfriedly/express-rate-limit)
  * To apply rate limiting on server and avoid spams and hitting GitHub API's own rate limit
* [octokit/graphql.js](https://github.com/octokit/graphql.js/) and [octokit/rest.js](https://github.com/octokit/rest.js)
  * To perform request to GitHub GraphQL API and GitHub REST API
* [mde/ejs](https://github.com/mde/ejs)
  * To render SVG images
* [ptarjan/node-cache](https://github.com/ptarjan/node-cache)
  * To cache generated content
* [renanbastos93/image-to-base64](https://github.com/renanbastos93/image-to-base64)
  * To generate base64 representation of users' avatars
* [svg/svgo](https://github.com/svg/svgo)
  * To optimize generated SVG
* [axios/axios](https://github.com/axios/axios)
  * To make HTTP/S requests
* [actions/toolkit](https://github.com/actions/toolkit/tree/master)
  * To build the GitHub Action
* [vuejs/vue](https://github.com/vuejs/vue) and [egoist/vue-prism-component](https://github.com/egoist/vue-prism-component) + [prismjs/prism](https://github.com/prismjs/prism)
  * To display server application
* [puppeteer/puppeteer](https://github.com/puppeteer/puppeteer)
  * To scrap the web
* [libxmljs/libxmljs](https://github.com/libxmljs/libxmljs)
  * To test and verify SVG validity
* [facebook/jest](https://github.com/facebook/jest) and [nodeca/js-yaml](https://github.com/nodeca/js-yaml)
  * For unit testing
* [marak/faker.js](https://github.com/marak/Faker.js)
  * For mocking data
* [steveukx/git-js](https://github.com/steveukx/git-js)
  * For simple git operations

</details>

## 🎬 Behind the scenes

This section explore some topics which explain globally how metrics was designed and how it works.

<details>
<summary>💬 Creating SVGs images on-the-fly</summary>

Metrics actually exploit the possibility of integrating HTML and CSS into SVGs, so basically creating these images is as simple as designing static web pages. It can even handle animations and transparency.

![Metrics are html](.github/readme/imgs/about_metrics_are_html.png)

SVGs are templated through [EJS framework](https://github.com/mde/ejs) to make the whole rendering process easier thanks to variables, conditional and loop statements. Only drawback is that it tends to make syntax coloration a bit confused because templates are often misinterpreted as HTML tags markers (`<%= "EJS templating syntax" %>`).

Images (and custom fonts) are encoded into base64 to prevent cross-origin requests, while also removing any external dependencies, although it tends to increase files sizes.

Since SVG renders differently depending on OS and browsers (system fonts, CSS support, ...), it's pretty hard to compute dynamically height. Previously, it was computed with ugly formulas, but as it wasn't scaling really well (especially since the introduction of variable content length plugins). It was often resulting in large empty blank spaces or really badly cropped image.

To solve this, metrics now spawns a [puppeteer](https://github.com/puppeteer/puppeteer) instance and directly render SVG in a browser environment (with all animations disabled). An hidden "marker" element is placed at the end of the image, and is used to resize image through its Y-offset.

![Metrics marker](.github/readme/imgs/about_metrics_marker.png)

Additional bonus of using pupeeter is that it can take screenshots, making it easy to convert SVGs to PNG output.

Finally, SVGs image can be optimized through [svgo](https://github.com/svg/svgo), which helps to remove unused attributes and blank space, while also reducing a bit the file size.

</details>

<details>
<summary>💬 Gathering external data from GitHub APIs and Third-Party services</summary>

Metrics mostly use GitHub APIs since it is its primary target. Most of the time, data are retrieved through GraphQL to save APIs requests, but it sometimes fallback on REST for other features. Octokit SDKs are used to make it easier.

As for other external services (Twitter, Spotify, PageSpeed, ...), metrics use their respective APIs, usually making https requests through [axios](https://github.com/axios/axios) and by following their documentation. It would be overkill to install entire SDKs for these since plugins rarely uses more than 2/3 calls.

In last resort, pupeeter is seldom used to scrap websites, though its use tends to make things slow and unstable (as it'll break upon HTML structural changes).

</details>

<details>
<summary>💬 Web instance and GitHub action similarities</summary>

Historically, metrics used to be only a web service without any customization possible. The single input was a GitHub username, and was composed of what is now `base` content (along with `languages` and `followup` plugin, which is why they can be computed without any additional queries). That's why `base` content is handled a bit differently from plugins.

As it gathered more and more plugins over time, generating a single user's metrics was becoming costly both in terms of resources but also in APIs requests. It was thus decided to switch to GitHub Action. At first, it was just a way to explore possibilities of this GitHub feature, but now it's basically the full-experience of metrics (unless you use your own  self-hosted instance).

Both web instance and Action actually use the same entrypoint so they basically have the same features.
Action just format inputs into a query-like object (similarly to when url params are parsed by web instance), from which metrics compute the rendered image. It also makes testing easier, as test cases can be reused since only inputs differs.

</details>

<details>
<summary>💬 Testing and mocking</summary>

Testing is done through [jest](https://github.com/facebook/jest) framework.

While the best would be to work with real data during testing, to avoid consuming too much APIs requests for testing (and to be more planet friendly), they're [mocked](https://github.com/lowlighter/metrics/blob/master/source/app/mocks.mjs) using [JavaScript Proxies](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) and [Faker.js](https://github.com/marak/Faker.js/). Basically function calls are "trapped" and send randomly generated data from Faker.js if we're in a development environment.

</details>

___

Written by [lowlighter](https://github.com/lowlighter)
