# 📐 Project architecture

Following diagram explain how **metrics** code is structured:

![Architecture](/.github/architecture.svg)

## 🗂️ Project structure
This section explain how *metrics* is structured.

* `source/app/metrics/` contains *metrics* engine files
* `source/app/action/` contains GitHub action files
  * `index.mjs` contains GitHub action entry point
  * `action.yml` contains GitHub action templated descriptor
* `source/app/web/` contains web instance files
  * `index.mjs` contains web instance entry point
  * `instance.mjs` contains web instance source code
  * `settings.example.json` contains web instance settings example
  * `statics/` contains web instance static files
    * `app.js` contains web instance client source code
    * `app.placeholder.js` contains web instance placeholder mocked data
* `source/plugins/*/` contains source code of plugins
  * `README.md` contains plugin documentation
  * `metadata.yml` contains plugin metadata
  * `examples.yml` contains plugin workflow examples
  * `index.mjs` contains plugin source code
  * `queries/` contains plugin GraphQL queries
* `source/templates/*/` contains templates files
  * `README.md` contains template documentation
  * `metadata.yml` contains template metadata
  * `examples.yml` contains template workflow examples
  * `image.svg` contains template image used to render metrics
  * `style.css` contains style used to render metrics
  * `fonts.css` contains additional fonts used to render metrics
  * `template.mjs` contains template source code
* `tests/` contains tests
  * `metrics.test.js` contains metrics testers
  * `source/app/mocks/` contains mocked data files
  * `api/` contains mocked api data
    * `axios/` contains external REST APIs mocked data
    * `github/` contains mocked GitHub api data
  * `index.mjs` contains mockers
* `Dockerfile` contains docker instructions used to build metrics image
* `package.json` contains dependencies and command line aliases

## 🎬 Behind the scenes

This section explore some topics which explain globally how metrics was designed and how it works.

### 💬 Creating SVGs images on-the-fly

*metrics* actually exploit the possibility of integrating HTML and CSS into SVGs, so basically creating these images is as simple as designing static web pages. It can even handle animations and transparency.

![Metrics are html](/.github/readme/imgs/about_metrics_are_html.png)

SVGs are templated through [EJS framework](https://github.com/mde/ejs) to make the whole rendering process easier thanks to variables, conditional and loop statements. Only drawback is that it tends to make syntax coloration a bit confused because templates are often misinterpreted as HTML tags markers (`<%= "EJS templating syntax" %>`).

Images (and custom fonts) are encoded into base64 to prevent cross-origin requests, while also removing any external dependencies, although it tends to increase files sizes.

Since SVG renders differently depending on OS and browsers (system fonts, CSS support, ...), it's pretty hard to compute dynamically height. Previously, it was computed with ugly formulas, but as it wasn't scaling really well (especially since the introduction of variable content length plugins). It was often resulting in large empty blank spaces or really badly cropped image.

To solve this, metrics now spawns a [puppeteer](https://github.com/puppeteer/puppeteer) instance and directly render SVG in a browser environment (with all animations disabled). An hidden "marker" element is placed at the end of the image, and is used to resize image through its Y-offset.

![Metrics marker](/.github/readme/imgs/about_metrics_marker.png)

Additional bonus of using puppeteer is that it can take screenshots, making it easy to convert SVGs to PNG output.

### 💬 Gathering external data from GitHub APIs and Third-Party services

*metrics* mostly use GitHub APIs since it is its primary target. Most of the time, data are retrieved through GraphQL to save APIs requests, but it sometimes fallback on REST for other features. Octokit SDKs are used to make it easier.

As for other external services (Twitter, Spotify, PageSpeed, ...), metrics use their respective APIs, usually making https requests through [axios](https://github.com/axios/axios) and by following their documentation. It would be overkill to install entire SDKs for these since plugins rarely uses more than 2/3 calls.

In last resort, puppeteer is seldom used to scrap websites, though its use tends to make things slow and unstable (as it'll break upon HTML structural changes).

### 💬 Web instance and GitHub action similarities

Historically, metrics used to be only a web service without any customization possible. The single input was a GitHub username, and was composed of what is now `base` content (along with `languages` and `followup` plugin, which is why they can be computed without any additional queries). That's why `base` content is handled a bit differently from plugins.

As it gathered more and more plugins over time, generating a single user's metrics was becoming costly both in terms of resources but also in APIs requests. It was thus decided to switch to GitHub Action. At first, it was just a way to explore possibilities of this GitHub feature, but now it's basically the full-experience of metrics (unless you use your own  self-hosted instance).

Both web instance and Action actually use the same entrypoint so they basically have the same features.
Action just format inputs into a query-like object (similarly to when url params are parsed by web instance), from which metrics compute the rendered image. It also makes testing easier, as test cases can be reused since only inputs differs.

## 📦 Packages reference

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
* [lovell/sharp](https://github.com/lovell/sharp), [foliojs/png.js](https://github.com/foliojs/png.js) and [eugeneware/gifencoder](https://github.com/eugeneware/gifencoder)
  * To process images transformations
* [svg/svgo](https://github.com/svg/svgo)
  * To optimize generated SVG
* [axios/axios](https://github.com/axios/axios)
  * To make HTTP/S requests
* [actions/toolkit](https://github.com/actions/toolkit/tree/master)
  * To build the GitHub Action
* [vuejs/vue](https://github.com/vuejs/vue), [egoist/vue-prism-component](https://github.com/egoist/vue-prism-component), [prismjs/prism](https://github.com/prismjs/prism) and [zenorocha/clipboard.js](https://github.com/zenorocha/clipboard.js)
  * To display server application
* [puppeteer/puppeteer](https://github.com/puppeteer/puppeteer)
  * To scrape the web
* [marudor/libxmljs2](https://github.com/marudor/libxmljs2) and [chrisbottin/xml-formatter](https://github.com/chrisbottin/xml-formatter)
  * To format, test and verify SVG validity
* [facebook/jest](https://github.com/facebook/jest) and [nodeca/js-yaml](https://github.com/nodeca/js-yaml)
  * For unit testing
* [faker-js/faker](https://github.com/faker-js/faker)
  * For mocking data
* [steveukx/git-js](https://github.com/steveukx/git-js)
  * For simple git operations
* [twitter/twemoji-parser](https://github.com/twitter/twemoji-parser) and [IonicaBizau/emoji-name-map](https://github.com/IonicaBizau/emoji-name-map)
  * To parse and handle emojis/[twemojis](https://github.com/twitter/twemoji)
* [jshemas/openGraphScraper](https://github.com/jshemas/openGraphScraper)
  * To retrieve open graphs metadata
* [panosoft/node-chartist](https://github.com/panosoft/node-chartist) and [gionkunz/chartist-js](https://github.com/gionkunz/chartist-js)
  * To display embed SVG charts
* [rbren/rss-parser](https://github.com/rbren/rss-parser)
  * To parse RSS streams
* [Nixinova/Linguist](https://github.com/Nixinova/Linguist)
  * To analyze used languages
* [markedjs/marked](https://github.com/markedjs/marked) and [apostrophecms/sanitize-html](https://github.com/apostrophecms/sanitize-html)
  * To render markdown blocks
* [css/csso](https://github.com/css/csso) and [FullHuman/purgecss](https://github.com/FullHuman/purgecss)
  * To optimize and purge unused CSS
* [isaacs/minimatch](https://github.com/isaacs/minimatch)
  * For file traversal
* [node-fetch/node-fetch](https://github.com/node-fetch/node-fetch)
  * For `fetch` polyfill
* [eslint/eslint](https://github.com/eslint/eslint)
  * As linter
