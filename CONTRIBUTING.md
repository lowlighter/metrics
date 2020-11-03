# 📊 GitHub metrics

## 💪 Interested in contributing ?

Nice ! Read the few sections below to understand how this project is structured.

### 👨‍💻 General informations

#### Adding new metrics through GraphQL API, REST API or Third-Party service

To use [GitHub GraphQL API](https://docs.github.com/en/graphql), update the GraphQL query from `templates/*/query.graphql`.
Raw queried data should be exposed in `data.user` whereas computed data should be in `data.computed`, and code should be updated through `templates/*/template.mjs`.

To use [GitHub Rest API](https://docs.github.com/en/rest) or a third-party service instead, create a new plugin in `src/plugins`.
Plugins should be self-sufficient and re-exported from [src/plugins/index.mjs](https://github.com/lowlighter/metrics/blob/master/src/plugins/index.mjs), to be later included in the `//Plugins` section of `templates/*/template.mjs`.
Data generated should be exposed in `data.computed.plugins[plugin]` where `plugin` is your plugin's name.

#### Updating SVG templates

The SVG templates are located in `templates/*/image.svg` and include CSS from `templates/*/style.css`.

It is rendered with [EJS](https://github.com/mde/ejs) so you can actually include variables (e.g. `<%= user.name %>`) and execute simple code, like control statements.

It should handle plugins errors gracefully by displaying the error message.

#### Metrics server and GitHub action

Most of the time, you won't need to edit these, unless you're integrating features directly tied to them.
Remember that SVG image is actually generated from `src/metrics.mjs`, independently from metrics server and GitHub action.

Metrics server code is located in `src/app.mjs` and instantiates an `express` server app, `octokit`s instances, middlewares (like rate-limiter) and routes.

GitHub action code is located in `action/index.mjs` and instantiates `octokit`s instances and retrieves action parameters.
It then use directly `src/metrics.mjs` to generate the SVG image and commit them to user's repository.
You must run `npm run build` to rebuild the GitHub action.

#### Testing new features

To test new features, setup a metrics server with a test token and `debug` mode enabled.
This way you'll be able to rapidly test SVG renders with your browser.

### 🗂️ Project structure

#### Metrics generator

* `src/setup.mjs` contains the configuration setup
* `src/metrics.mjs` contains the metrics renderer
* `src/templates/*` contains templates files
* `src/templates/*/image.svg` contains the template used by the generated SVG image
* `src/templates/*/query.graphql` is the GraphQL query sent to GitHub GraphQL API
* `src/templates/*/style.css` contains the style used by the generated SVG image
* `src/templates/*/template.mjs` contains the code which prepares data for rendering
* `src/plugins/*` contains the source code of metrics plugins

#### Metrics server instance

* `index.mjs` contains the metrics server entry point
* `src/app.mjs` contains the metrics server code which serves, renders, restricts/rate limit, etc.
* `src/html/*` contains the metrics server static files

#### GitHub action

* `action.yml` contains the GitHub action descriptor
* `action/index.mjs` contains the GitHub action code
* `action/dist/index.js` contains compiled the GitHub action code
* `utils/build.mjs` contains the GitHub action builder

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
* [actions/toolkit](https://github.com/actions/toolkit/tree/master) and [vercel/ncc](https://github.com/vercel/ncc)
  * To build the GitHub Action
* [vuejs/vue](https://github.com/vuejs/vue) and [egoist/vue-prism-component](https://github.com/egoist/vue-prism-component) + [PrismJS/prism](https://github.com/PrismJS/prism)
  * To display server application
* [puppeteer/puppeteer](https://github.com/puppeteer/puppeteer)
  * To scrap the web
* [libxmljs/libxmljs](https://github.com/libxmljs/libxmljs)
  * To test and verify SVG validity

### 🗛 Fonts

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


