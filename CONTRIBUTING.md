# 📊 GitHub metrics

## 💪 Interested in contributing ?

Nice ! Read the few sections below to understand how this project is structured.

### 👨‍💻 General informations

#### Adding new metrics through GraphQL API, REST API or Third-Party service

When possible, try to use the [GitHub GraphQL API](https://docs.github.com/en/graphql) by editing queries in `source/queries` or the [GitHub Rest API](https://docs.github.com/en/rest). Use `puppeteer` in last resort.

Data computing and formatting should be made in `templates/*/template.mjs` if it's template specific, or in `templates/common.mjs` if it can be made available for all templates.

Raw queried data should be be exposed directly into `data.user`, whereas computed data should be stored in `data.computed`.

#### Updating SVG templates

SVG templates are located in `templates/*/image.svg` and include CSS from `templates/*/style.css`.

These are rendered through [EJS](https://github.com/mde/ejs), so it is actually possible to include variables (e.g. `<%= user.name %>`) and execute simple code, like control statements.

Exposed variables contains `user`, `computed` and `plugins` data, along with custom `style` and `fonts`.

#### Creating a new plugin

Start by creating a new folder in `source/plugins`, along with its entry point `index.mjs`.

A plugin function has access to a lot of data, such as user's `login`, `rest` and `graphql` GitHub API handlers, `imports` of various utilitaries functions and modules, and various data. See others plugins for examples.

Plugins should be self-sufficient and independant from others plugins.

Plugins errors should be handled gracefully by displaying an error message when it fails.

For user's convenience, a placeholder image can be generated to preview metrics without executing queries.
This use a [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) which "fills" with dummy data, though it has its limit (especially with iterable structures) so you may need to patch the placeholder function. It is located in `source/metrics.mjs`

When adding new options, be sure to patch both `action.yml` and `action/index.mjs` to support them.

#### Metrics web instance

Web instance code is located in `source/app.mjs` and instantiates an `express` server app.

#### GitHub action

GitHub action code is located in `action/index.mjs` and retrieves action parameters, which are converted into `q` parameters.
Once SVG image is generated through `source/metrics.mjs`, it is committed to user's repository.

#### Testing new features

To test new features, setup a metrics web instance with a personal token and `debug` mode enabled.
You can then test SVG renders in your browser and ensure that everything works as expected.

### 🗛 Fonts

Follow the following process to integrate custom fonts.
It should be avoided when possible as it increases drastically the size of generated metrics.

1. Find a font on [fonts.google.com](https://fonts.google.com/)
  - Select regular, bold, italic and bold+italic fonts
  - Open `embed` tab and extract the `href`
2. Open extracted `href` and append `&text=` params with used characters from SVG
  - e.g. `&text=%26%27"%7C%60%5E%40°%3F!%23%24%25()*%2B%2C-.%2F0123456789%3A%3B<%3D>ABCDEFGHIJKLMNOPQRSTUVWXYZ%5B%5D_abcdefghijklmnopqrstuvwxyz%7B%7D~─└├▇□✕`
3. Download each font file from url links from the generated stylesheet
4. Convert them into base64 with `woff` extension on [transfonter.org]https://transfonter.org/) and download archive
5. Extract archive and copy the content of the generated stylesheet to `templates/*/fonts.css`
6. Update your template
  - Include `<defs><style><%= fonts %></style></defs>` to your `templates/*/image.svg`
  - Edit your `templates/*/style.css` to use yout new font

### 🗂️ Project structure

#### Metrics generator

* `source/setup.mjs` contains configuration setup
* `source/metrics.mjs` contains the metrics renderer
* `source/templates/*` contains templates files
* `source/templates/*/image.svg` contains the image template used to render metrics
* `source/templates/*/style.css` contains the style used to render metrics
* `source/templates/*/fonts.css` contains additional fonts used to render metrics
* `source/templates/*/template.mjs` contains the code used to prepare metrics data before rendering
* `source/plugins/*` contains source code of plugins
* `source/queries/*` contains GraphQL queries

#### Web instance

* `index.mjs` contains metrics web instance entry point
* `source/app.mjs` contains metrics web instance source code
* `source/web/*` contains metrics web instance static files

#### GitHub action

* `action.yml` contains GitHub action descriptor
* `action/index.mjs` contains GitHub action source code

#### Others

* `tests/metrics.mjs` contains tests
* `utils/build.mjs` contains a tool used to rebuild plugins and template indexes

### 📦 Used packages

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
* [vuejs/vue](https://github.com/vuejs/vue) and [egoist/vue-prism-component](https://github.com/egoist/vue-prism-component) + [PrismJS/prism](https://github.com/PrismJS/prism)
  * To display server application
* [puppeteer/puppeteer](https://github.com/puppeteer/puppeteer)
  * To scrap the web
* [libxmljs/libxmljs](https://github.com/libxmljs/libxmljs)
  * To test and verify SVG validity
* [Marak/colors.js](https://github.com/Marak/colors.js)
  * To print colors in console
* [facebook/jest](https://github.com/facebook/jest) and [nodeca/js-yaml](https://github.com/nodeca/js-yaml)
  * For unit testing