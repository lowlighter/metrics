<!--header-->
<table>
  <tr><td colspan="2"><a href="/README.md#-plugins">← Back to plugins index</a></td></tr>
  <tr><th colspan="2"><h3>🧱 Core</h3></th></tr>
  <tr><td colspan="2" align="center"><p>Global configuration and options</p>
</td></tr>
  <tr>
    <th rowspan="3">Supported features<br><sub><a href="metadata.yml">→ Full specification</a></sub></th>
    <td></td>
  </tr>
  <tr>
    <td><code>👤 Users</code> <code>👥 Organizations</code> <code>📓 Repositories</code></td>
  </tr>
  <tr>
    <td><code>🗝️ token</code> <code>🗝️ committer_token</code></td>
  </tr>
  <tr>
    <td colspan="2" align="center">
      <img width="900" height="1" alt="">
    </td>
  </tr>
</table>
<!--/header-->

[➡️ Jump to all available options](#%EF%B8%8F-available-options)

## 🌐 Configure used timezone

By default, dates use Greenwich meridian (GMT/UTC).

Configure `config_timezone` (see [supported timezone](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)) to avoid time offsets.

*Example: configuring timezone*
```yaml
- uses: lowlighter/metrics@latest
  with:
    config_timezone: Europe/Paris
```

## 📦 Ordering content

Content can be manually ordered using `config_order` option.

*Example: display base.header, isocalendar, languages and stars in this specific order*
```yaml
- uses: lowlighter/metrics@latest
  with:
    base: header
    plugin_isocalendar: yes
    plugin_languages: yes
    plugin_stars: yes
    config_order: base.header, isocalendar, languages, stars
```

> 💡 Omitted sections will be appended at the end using default order

> ℹ️ The handles to use for each plugin and sections is based on the [`partials/_.json`](/source/templates/classic/partials/_.json) of the template.
> It may not necessarly be the plugin id (e.g. `base.header`, `base.activity+community`, `base.repositories`, etc.).

## 🪛 Using presets

It is possible to reuse the same configuration across different repositories and workflows using configuration presets.
A preset override the default values of inputs, and multiple presets can be provided at once through URLs or file paths.

Options resolution is done in the following order:
- default values
- presets, from first to last
- user values

*Example: using a configuration preset from an url*
```yaml
- uses: lowlighter/metrics@latest
  with:
    config_presets: https://raw.githubusercontent.com/lowlighter/metrics/presets/lunar-red/preset.yaml
```

Some presets are hosted on this repository on the [`@presets`](https://github.com/lowlighter/metrics/tree/presets) branch and can be used directly by using using their identifier prefixed by an arobase (`@`).

*Example: using a pre-defined configuration preset*
```yaml
- uses: lowlighter/metrics@latest
  with:
    config_presets: "@lunar-red"
```

> ⚠️ `🔐 Tokens` and options marked with `⏯️ Cannot be preset`, as they suggest, cannot be preset and thus requires to be explicitly defined to be set.

> ℹ️ Presets configurations use [schemas](https://github.com/lowlighter/metrics/tree/presets/%40schema) to ensure compatibility between format changes

## 🎨 Custom CSS styling

Additional CSS can be injected using `extras_css` option.

*Example: changing the color of `h2`*
```yaml
- uses: lowlighter/metrics@latest
  with:
    base: header
    extras_css: |
      h2 {
        color: red;
      }
```

> 💡 *metrics* does not use `!important` keyword, so use it when having trouble when styling is not applied

> 💡 If you make an heavy use of this option, creating a [community templates](/source/templates/community/README.md) may be a better alternative

> ⚠️ CSS styles may slightly change between releases, backward compatibility is not guaranteed!

## 🗳️ Custom JavaScript scripting

Additional JavaScript can be injected using `extras_js` option.

*Example: removing all `h2`*
```yaml
- uses: lowlighter/metrics@latest
  with:
    base: header
    extras_js: |
      document.querySelectorAll("h2")?.forEach(h2 => h2.remove())
```

> ℹ️ JavaScript is executed in puppeteer context during the rendering phase, **not** in *metrics* context.
> It will be possible to access `document` and all other features accessibles like if the SVG was opened in a browser page

> 💡 If you make an heavy use of this option, creating a [community templates](/source/templates/community/README.md) may be a better alternative

> ⚠️ HTML elements may slightly change between releases, backward compatibility is not guaranteed!

## 🔲 Adjusting padding

SVG rendering is dependent on operating system, browser and fonts combination and may look different across different platforms.

It may not look like it, but computing the height of a SVG is not trivial. *metrics* spawns an headless browser and try to do its best to resize the result, but it may sometimes ends up in either cropped or oversized images.

Tweak `config_padding` option to manually adjust padding and solve this issue.

This settings supports the following format:
- 1 value for both width and height
- 2 values for width first and height second, separated by a comma (`,`)

> 💡 Both negative and positive values are allowed

Each value need to respect the following format:
- {number}
- {number} + {number}%
- {number}%

> 💡 Percentage based values are relative to the height computed by puppeteer

*Example: add 10px padding for both width and height*
```yaml
- uses: lowlighter/metrics@latest
  with:
    config_padding: 10
```

*Example: add 10px padding to height and increase it by 8%*
```yaml
- uses: lowlighter/metrics@latest
  with:
    config_padding: 0, 10 + 8%
```

*Example: remove 10% from height*
```yaml
- uses: lowlighter/metrics@latest
  with:
    config_padding: 0, -10%
```

## ↔️ Controlling display size

Some templates may support different output display size.

A `regular` display size will render a medium-sized image suitable for both desktop and mobile displays, while a `large` one will be more suitable only for desktop and some plugins (like [`📌 topics`](/source/plugins/topics/README.md) or [`🏅 contributors`](/source/plugins/contributors/README.md))

The `columns` display will render a full-width image with automatic resizing: two columns for desktop and a single one column for mobiles.

*Example: output a PNG image*
```yaml
- uses: lowlighter/metrics@latest
  with:
    config_display: large
```

## 💱 Configuring output format

Use `config_output` to change output format.

*Example: output a PNG image*
```yaml
- uses: lowlighter/metrics@latest
  with:
    config_output: png
```

A JSON output can be used to retrieved collected data and use it elsewhere.

*Example: output a JSON data dump*
```yaml
- uses: lowlighter/metrics@latest
  with:
    config_output: json
```

When using a PDF output, it is advised to set `config_base64: yes` to encode embed images in base64 in order to make self-contained documents.

*Example: output a self-contained PDF document*
```yaml
- uses: lowlighter/metrics@latest
  with:
    markdown: TEMPLATE.md
    config_output: markdown-pdf
    config_base64: yes
```

## ✨ Render `Metrics insights` statically

It is possible to generate a self-contained HTML file containing `✨ Metrics insights` output by using `config_output: insights`.

> 💡 Note that like `✨ Metrics insights` content is not configurable, thus any other plugin option will actually be ignored

*Example: output `✨ Metrics insights` report*
```yaml
- uses: lowlighter/metrics@latest
  with:
    config_output: insights
```

## 🧶 Configuring output action

Before configuring output action, ensure that workflows permissions are properly set.
These can be changed either through repository settings in Actions tab:

![Setting workflows permissions](/.github/readme/imgs/setup_workflow_permissions.light.png#gh-light-mode-only)
![Setting workflows permissions](/.github/readme/imgs/setup_workflow_permissions.dark.png#gh-dark-mode-only)

Or more granulary [at job or workflow level](https://docs.github.com/en/actions/security-guides/automatic-token-authentication#permissions-for-the-github_token).

### Using commits (default)

Use `config_output: commit` to make the action directly push changes to `committer_branch` with a commit.
A custom commit message can be used through `committer_message`.

> 💡 *metrics* will automatically ignore push events with a commit message containing `[Skip GitHub Action]` or `Auto-generated metrics for run #` to avoid infinite loops. Note that by default, GitHub already ignore events pushed by `${{ github.token }}` or containing `[skip ci]` in commit message

*Example: push output to metrics-renders branch rather than the default branch*
```yaml
metrics:
  permissions:
    contents: write
  steps:
    - uses: lowlighter/metrics@latest
      with:
        output_action: commit
        committer_branch: metrics-renders
        committer_message: "chore: update metrics"
```

### Using pull requests

Use `config_output: pull-request` to make the action open a new pull request and push changes from the same run on it.

The last step should use either `pull-request-merge`, `pull-request-squash` or `pull-request-rebase` to merge changes to `committer_branch`.

> 💡 When using `pull-request` output action, do not forget to change `filename` too or previous output will be overwritten!

*Example: push two outputs using a merge pull request*
```yaml
metrics:
  permissions:
    contents: write
    pull-requests: write
  steps:
    - uses: lowlighter/metrics@latest
      with:
        filename: my-metrics-0.svg
        output_action: pull-request

    - uses: lowlighter/metrics@latest
      with:
        filename: my-metrics-1.svg
        output_action: pull-request-merge
```

### Using gists

Use `config_output: gist` to push output to a [GitHub gist](https://gist.github.com) instead.
It is required to provide a gist id to `committer_gist` option to make it work.

> 💡 This feature will use `token` instead of `committer_token` to push changes, so `gists` scope must be granted to the original `token` first

*Example: push output to a gist*
```yaml
metrics:
  steps:
    - uses: lowlighter/metrics@latest
      with:
        output_action: gist
        committer_gist: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Manual handling

Use `config_ouput: none` to perform custom processing with outputs.
They will be available under `/metrics_renders/{filename}` in the runner.

*Example: generate outputs and manually push them*
```yaml
metrics:
  permissions:
    contents: write
  steps:
    - name: Checkout repository
      uses: actions/checkout@v2
        with:
          fetch-depth: 0

    - uses: lowlighter/metrics@latest
      with:
        output_action: none

    - uses: lowlighter/metrics@latest
      run: |
        set +e
        git checkout metrics-renders
        git config user.name github-actions[bot]
        git config user.email 41898282+github-actions[bot]@users.noreply.github.com
        sudo mv /metrics_renders/* ./
        git add --all
        git commit -m "chore: push metrics"
        git push
```

## ♻️ Retrying automatically failed rendering and output action

Rendering is subject to external factors and can fail ocassionaly.
Use `retries` and `retries_delay` options to automatically retry rendering.

*Example: retry render up to 3 times (wait 5 minutes between each fail)*
```yaml
- uses: lowlighter/metrics@latest
  with:
    retries: 3
    retries_delay: 300
```

Output action is also subject to GitHub API rate-limiting and overall health status and can fail ocassionaly.
Use `retries_output_action` and `retries_delay_output_action` options to automatically retry output action.

> 💡 As output action is a separate step from rendering, render step won't be called again

*Example: retry output action up to 5 times (wait 2 minutes between each fail)*
```yaml
- uses: lowlighter/metrics@latest
  with:
    retries_output_action: 5
    retries_delay_output_action: 120
```

## 🗜️ Optimize SVG output

To reduce filesize and decrease loading time, *metrics* offers several optimization options, such as purging unused CSS and style minification, XML pretty-pretting (which also reduce diffs between changes) and general SVG optimation (still experimental).

> 💡 This option is enabled by default!

*Example: optimize CSS and XML*
```yaml
- uses: lowlighter/metrics@latest
  with:
    optimize: css, xml
```

*Example: optimize SVG (experimental)*
```yaml
- uses: lowlighter/metrics@latest
  with:
    optimize: svg
    experimental_features: --optimize-svg
```

## 🐳 Faster execution with prebuilt docker images

When using `lowlighter/metrics` official releases as a GitHub Action, a prebuilt docker container image will be pulled from [GitHub Container Registry](https://github.com/users/lowlighter/packages/container/package/metrics). It allows to significantly reduce workflow execution time.

> 💡 This option is enabled by default!

On forks, this feature is disable to take into account any changes you made on it.

*Example: using prebuilt docker image*
```yaml
- uses: lowlighter/metrics@latest
  with:
    use_prebuilt_image: yes
```

## ➡️ Available options

<!--options-->
<table>
  <tr>
    <td align="center" nowrap="nowrap">Option</i></td><td align="center" nowrap="nowrap">Description</td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>token</code></h4></td>
    <td rowspan="2"><p>GitHub Personal Access Token</p>
<p>No scopes are required by default, though some plugins and features may require additional scopes.</p>
<p>When using a configuration which does not requires a GitHub PAT, it is possible to pass <code>NOT_NEEDED</code> instead.
When doing so, any settings which defaults on user fetched values will not be templated (e.g. <code>.user.*</code>) and will usually need to be set manually.</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">✔️ Required<br>
🔐 Token<br>
<b>type:</b> <code>token</code>
<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>user</code></h4></td>
    <td rowspan="2"><p>GitHub username</p>
<p>Defaults to <code>token</code> owner username.</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">⏯️ Cannot be preset<br>
<b>type:</b> <code>string</code>
<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>repo</code></h4></td>
    <td rowspan="2"><p>GitHub repository</p>
<p>This option is only revelant for repositories templates</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">⏯️ Cannot be preset<br>
<b>type:</b> <code>string</code>
<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>committer_token</code></h4></td>
    <td rowspan="2"><p>GitHub Token used to commit metrics</p>
<p>Leave this to <code>${{ github.token }}</code> or <code>${{ secrets.GITHUB_TOKEN }}</code>, which is a special auto-generated token restricted to current repository scope.</p>
<blockquote>
<p>💡 When using <code>output_action: gist</code>, it will use <code>token</code> instead, since gists are outside of scope</p>
</blockquote>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">🔐 Token<br>
<b>type:</b> <code>token</code>
<br>
<b>default:</b> ${{ github.token }}<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>committer_branch</code></h4></td>
    <td rowspan="2"><p>Target branch</p>
<p>Defaults to current repository default branch</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>string</code>
<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>committer_message</code></h4></td>
    <td rowspan="2"><p>Commit message</p>
<p>Use <code>${filename}</code> to display filename</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>string</code>
<br>
<b>default:</b> Update ${filename} - [Skip GitHub Action]<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>committer_gist</code></h4></td>
    <td rowspan="2"><p>Gist id</p>
<p>Specify an existing gist id (can be retrieved from its URL) when using <code>output_action: gist</code>.</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">⏯️ Cannot be preset<br>
<b>type:</b> <code>string</code>
<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>filename</code></h4></td>
    <td rowspan="2"><p>Output path</p>
<p>When using an asterisk (<code>*</code>), correct extension will automatically be applied according to <code>config_output</code> value</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>string</code>
<br>
<b>default:</b> github-metrics.*<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>markdown</code></h4></td>
    <td rowspan="2"><p>Markdown template path</p>
<p>It can be either a local path or a full link (e.g. <a href="https://raw.githubusercontent.com">https://raw.githubusercontent.com</a>)</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>string</code>
<br>
<b>default:</b> TEMPLATE.md<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>markdown_cache</code></h4></td>
    <td rowspan="2"><p>Markdown file cache</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>string</code>
<br>
<b>default:</b> .cache<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>output_action</code></h4></td>
    <td rowspan="2"><p>Output action</p>
<ul>
<li><code>none</code>: just create file in <code>/metrics_renders</code> directory of action runner</li>
<li><code>commit</code>: push output to <code>committer_branch</code></li>
<li><code>pull-request</code>: push output to a new branch and open a pull request to <code>committer_branch</code></li>
<li><code>pull-request-merge</code>: same as <code>pull-request</code> and additionaly merge pull request</li>
<li><code>pull-request-squash</code>: same as <code>pull-request</code> and additionaly squash and merge pull request</li>
<li><code>pull-request-rebase</code>: same as <code>pull-request</code> and additionaly rebase and merge pull request</li>
<li><code>gist</code>: push output to <code>committer_gist</code></li>
</ul>
<blockquote>
<p>💡 When using <code>pull-request</code>, you will need to set the last job with a <code>pull-request-*</code> action instead, else it won&#39;t be merged</p>
</blockquote>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>string</code>
<br>
<b>default:</b> commit<br>
<b>allowed values:</b><ul><li>none</li><li>commit</li><li>pull-request</li><li>pull-request-merge</li><li>pull-request-squash</li><li>pull-request-rebase</li><li>gist</li></ul></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>output_condition</code></h4></td>
    <td rowspan="2"><p>Output condition</p>
<ul>
<li><code>always</code>: always try to push changes</li>
<li><code>data-changed</code>: skip changes if no data changed (e.g. like when only metadata changed)</li>
</ul>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>string</code>
<br>
<b>default:</b> always<br>
<b>allowed values:</b><ul><li>always</li><li>data-changed</li></ul></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>optimize</code></h4></td>
    <td rowspan="2"><p>Optimization features</p>
<ul>
<li><code>css</code>: purge and minify CSS styles</li>
<li><code>xml</code>: pretty-print XML (useful to reduce diff)</li>
<li><code>svg</code>: optimization with SVGO (experimental, require <code>--optimize-svg</code> experimental flag)</li>
</ul>
<p>Some templates may not support all options</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>array</code>
<i>(comma-separated)</i>
<br>
<b>default:</b> css, xml<br>
<b>allowed values:</b><ul><li>css</li><li>xml</li><li>svg</li></ul></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>setup_community_templates</code></h4></td>
    <td rowspan="2"><p>Community templates to setup</p>
<p>See <a href="https://github.com/lowlighter/metrics/blob/master/source/templates/community/README.md">community templates guide</a> for more informations</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">🌐 Web instances must configure <code>settings.json</code>:
<ul>
<li><i>metrics.setup.community.templates</i></li>
</ul>
<b>type:</b> <code>array</code>
<i>(comma-separated)</i>
<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>template</code></h4></td>
    <td rowspan="2"><p>Template</p>
<p>Community templates must be prefixed by at sign (<code>@</code>)
See <a href="https://github.com/lowlighter/metrics/blob/master/README.md#%EF%B8%8F-templates">list of supported templates</a></p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>string</code>
<br>
<b>default:</b> classic<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>query</code></h4></td>
    <td rowspan="2"><p>Query parameters</p>
<p>Pass additional parameters to templates.
This is mostly useful for custom templates.</p>
<blockquote>
<p>⚠️ <strong>Do not</strong> use this option to pass other existing parameters, they will be overwritten</p>
</blockquote>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>json</code>
<br>
<b>default:</b> {}<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>extras_css</code></h4></td>
    <td rowspan="2"><p>Extra CSS</p>
<p>Custom CSS that will be injected in used template.
Useful to avoid creating a new template just to tweak some styling</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">🌐 Web instances must configure <code>settings.json</code>:
<ul>
<li><i>metrics.run.puppeteer.user.css</i></li>
</ul>
<b>type:</b> <code>string</code>
<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>extras_js</code></h4></td>
    <td rowspan="2"><p>Extra JavaScript</p>
<p>Custom JavaScript that will be executed during puppeteer rendering.
Useful to avoid creating a new template just to tweak some content.</p>
<p>Note that is it executed within puppeteer context and <strong>not</strong> <em>metrics</em> context.
It is run after transformations and optimizations, but just before resizing.</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">🌐 Web instances must configure <code>settings.json</code>:
<ul>
<li><i>metrics.run.puppeteer.user.js</i></li>
</ul>
<b>type:</b> <code>string</code>
<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>config_timezone</code></h4></td>
    <td rowspan="2"><p>Timezone for dates</p>
<p>See <a href="https://en.wikipedia.org/wiki/List_of_tz_database_time_zones">list of supported timezone</a></p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">⏭️ Global option<br>
<b>type:</b> <code>string</code>
<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>config_order</code></h4></td>
    <td rowspan="2"><p>Plugin order</p>
<p>By default, templates use <code>partials/_.json</code> ordering.
You can override the content order by using this setting.</p>
<p>If some partials are omitted, they will be appended at the end with default ordering</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">⏭️ Global option<br>
<b>type:</b> <code>array</code>
<i>(comma-separated)</i>
<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>config_twemoji</code></h4></td>
    <td rowspan="2"><p>Use twemojis</p>
<p>Replace emojis by <a href="%5Btwemojis%5D(https://github.com/twitter/twemoji)">twemojis</a> to have a consistent render across all platforms
May increase filesize.</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">⏭️ Global option<br>
<b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>config_gemoji</code></h4></td>
    <td rowspan="2"><p>Use GitHub custom emojis</p>
<p>GitHub supports additional emojis which are not registered in Unicode standard (:octocat:, :shipit:, :trollface:, ...)
See full list at <a href="https://api.github.com/emojis">https://api.github.com/emojis</a>.</p>
<p>This option has no effect when <code>token: NOT_NEEDED</code> is set.</p>
<p>May increase filesize</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">⏭️ Global option<br>
<b>type:</b> <code>boolean</code>
<br>
<b>default:</b> yes<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>config_octicon</code></h4></td>
    <td rowspan="2"><p>Use GitHub octicons</p>
<p>Octicons are open-sourced icons provided by GitHub.
See full list at <a href="https://primer.style/octicons">https://primer.style/octicons</a>.</p>
<p>To include an octicon, use the following syntax: <code>:octicon-{name}-{size}:</code>.
Size must be a supported icon size (12, 16 or 24).
16px octicons can omit size and directly use <code>:octicon-{name}:</code> syntax.</p>
<p>May increase filesize</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">⏭️ Global option<br>
<b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>config_display</code></h4></td>
    <td rowspan="2"><p>Display width (for image output formats)</p>
<ul>
<li><code>regular</code>: 480px width</li>
<li><code>large</code>: 960px width (may not be supported by all templates)</li>
<li><code>columns</code>: Full width with auto-sizing (two columns for desktops, and one column for mobile)<ul>
<li>known issue: <a href="https://github.com/lowlighter/metrics/issues/374">https://github.com/lowlighter/metrics/issues/374</a></li>
</ul>
</li>
</ul>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">⏭️ Global option<br>
<b>type:</b> <code>string</code>
<br>
<b>default:</b> regular<br>
<b>allowed values:</b><ul><li>regular</li><li>large</li><li>columns</li></ul></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>config_animations</code></h4></td>
    <td rowspan="2"><p>Use CSS animations</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">⏭️ Global option<br>
<b>type:</b> <code>boolean</code>
<br>
<b>default:</b> yes<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>config_base64</code></h4></td>
    <td rowspan="2"><p>Base64-encoded images</p>
<p>Enable this option to make self-contained ouput (i.e. with no external links)</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">⏭️ Global option<br>
<b>type:</b> <code>boolean</code>
<br>
<b>default:</b> yes<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>config_padding</code></h4></td>
    <td rowspan="2"><p>Output padding</p>
<p>Although <em>metrics</em> try to auto-guess resulting height, rendering is still dependent on OS and browser settings.
It can result in cropped or oversized outputs.</p>
<p>This settings let you manually adjust padding with the following format:</p>
<ul>
<li>1 value for both width and height</li>
<li>2 values for width fist and height second, separated by a comma (<code>,</code>)</li>
</ul>
<p>Each value need to respect the following format:</p>
<ul>
<li>{number}</li>
<li>{number} + {number}%</li>
<li>{number}%</li>
</ul>
<p>Percentage are relative to computed dimensions</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>string</code>
<br>
<b>default:</b> 0, 8 + 11%<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>config_output</code></h4></td>
    <td rowspan="2"><p>Output format</p>
<ul>
<li><code>auto</code>: Template default (usually <code>svg</code> or <code>markdown</code>)</li>
<li><code>svg</code>: SVG image</li>
<li><code>png</code>: PNG image (animations not supported)</li>
<li><code>jpeg</code>: JPEG image (animations and transparency not supported)</li>
<li><code>json</code>: JSON data dump</li>
<li><code>markdown</code>: Markdown rendered file</li>
<li><code>markdown-pdf</code>: PDF from markdown rendered file</li>
<li><code>insights</code>: Metrics Insights self-contained HTML file (not configurable)</li>
</ul>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>string</code>
<br>
<b>default:</b> auto<br>
<b>allowed values:</b><ul><li>auto</li><li>svg</li><li>png</li><li>jpeg</li><li>json</li><li>markdown</li><li>markdown-pdf</li><li>insights</li></ul></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>config_presets</code></h4></td>
    <td rowspan="2"><p>Configuration presets</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">⏯️ Cannot be preset<br>
🌐 Web instances must configure <code>settings.json</code>:
<ul>
<li><i>metrics.setup.community.presets</i></li>
</ul>
<b>type:</b> <code>array</code>
<i>(comma-separated)</i>
<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>retries</code></h4></td>
    <td rowspan="2"><p>Retries in case of failures (for rendering)</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>number</code>
<i>(1 ≤
𝑥
≤ 10)</i>
<br>
<b>default:</b> 3<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>retries_delay</code></h4></td>
    <td rowspan="2"><p>Delay between each retry (in seconds, for rendering)</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>number</code>
<i>(0 ≤
𝑥
≤ 3600)</i>
<br>
<b>default:</b> 300<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>retries_output_action</code></h4></td>
    <td rowspan="2"><p>Retries in case of failures (for output action)</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>number</code>
<i>(1 ≤
𝑥
≤ 10)</i>
<br>
<b>default:</b> 5<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>retries_delay_output_action</code></h4></td>
    <td rowspan="2"><p>Delay between each retry (in seconds, for output action)</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>number</code>
<i>(0 ≤
𝑥
≤ 3600)</i>
<br>
<b>default:</b> 120<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>clean_workflows</code></h4></td>
    <td rowspan="2"><p>Clean previous workflows jobs</p>
<p>This can be used to clean up Action tabs from previous workflows runs.</p>
<p>Use <code>all</code> to clean up workflows runs in any state.</p>
<blockquote>
<p>⚠️ When reporting issues, it is <strong>required</strong> to provide logs so it can be investigated and reproduced.
Be sure to disable this option when asking for help or submitting bug reports.</p>
</blockquote>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">⏯️ Cannot be preset<br>
<b>type:</b> <code>array</code>
<i>(comma-separated)</i>
<br>
<b>allowed values:</b><ul><li>cancelled</li><li>failure</li><li>success</li><li>skipped</li><li>startup_failure</li><li>timed_out</li><li>all</li></ul></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>delay</code></h4></td>
    <td rowspan="2"><p>Job delay</p>
<p>This can be used to avoid triggering GitHub abuse mechanics on large workflows</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>number</code>
<i>(0 ≤
𝑥
≤ 3600)</i>
<br>
<b>default:</b> 0<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>quota_required_rest</code></h4></td>
    <td rowspan="2"><p>Minimum GitHub REST API requests quota required to run</p>
<p>Action will cancel itself without any errors if requirements are not met</p>
<p>This option has no effect when <code>token</code> is set to <code>NOT_NEEDED</code></p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>number</code>
<i>(0 ≤
𝑥
≤ 5000)</i>
<br>
<b>default:</b> 200<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>quota_required_graphql</code></h4></td>
    <td rowspan="2"><p>Minimum GitHub GraphQL API requests quota required to run</p>
<p>Action will cancel itself without any errors if requirements are not met</p>
<p>This option has no effect when <code>token</code> is set to <code>NOT_NEEDED</code></p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>number</code>
<i>(0 ≤
𝑥
≤ 5000)</i>
<br>
<b>default:</b> 200<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>quota_required_search</code></h4></td>
    <td rowspan="2"><p>Minimum GitHub Search API requests quota required to run</p>
<p>Action will cancel itself without any errors if requirements are not met</p>
<p>This option has no effect when <code>token</code> is set to <code>NOT_NEEDED</code></p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>number</code>
<i>(0 ≤
𝑥
≤ 30)</i>
<br>
<b>default:</b> 0<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>notice_releases</code></h4></td>
    <td rowspan="2"><p>Notice about new releases of metrics</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> yes<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>use_prebuilt_image</code></h4></td>
    <td rowspan="2"><p>Use pre-built docker image from <a href="https://github.com/lowlighter/metrics/pkgs/container/metrics">GitHub container registry</a></p>
<p>It allows to save build time and make job significantly faster, and there is almost no reason to disable this settings.
This option has no effects on forks (images will always be rebuilt from Dockerfile)</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">⏯️ Cannot be preset<br>
🔧 For development<br>
<b>type:</b> <code>boolean</code>
<br>
<b>default:</b> yes<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>plugins_errors_fatal</code></h4></td>
    <td rowspan="2"><p>Fatal plugin errors</p>
<p>When enabled, the job will fail in case of plugin errors, else it will be handled gracefully in output with an error message</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">⏯️ Cannot be preset<br>
🔧 For development<br>
<b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>debug</code></h4></td>
    <td rowspan="2"><p>Debug mode</p>
<p>This setting is automatically enable if a job fail (useful with <code>plugins_errors_fatal: yes</code>)</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">⏯️ Cannot be preset<br>
🔧 For development<br>
<b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>verify</code></h4></td>
    <td rowspan="2"><p>SVG validity check</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">⏯️ Cannot be preset<br>
🔧 For development<br>
🌐 Web instances must configure <code>settings.json</code>:
<ul>
<li><i>metrics.npm.optional.libxml2</i></li>
</ul>
<b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>debug_flags</code></h4></td>
    <td rowspan="2"><p>Debug flags</p>
<ul>
<li><code>--cakeday</code>: simulate registration anniversary</li>
<li><code>--halloween</code>: enable halloween colors</li>
<li><code>--error</code>: force render error</li>
</ul>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">⏯️ Cannot be preset<br>
🔧 For development<br>
<b>type:</b> <code>array</code>
<i>(space-separated)</i>
<br>
<b>allowed values:</b><ul><li>--cakeday</li><li>--halloween</li><li>--error</li></ul></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>debug_print</code></h4></td>
    <td rowspan="2"><p>Print output in console</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">⏯️ Cannot be preset<br>
🔧 For development<br>
<b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>dryrun</code></h4></td>
    <td rowspan="2"><p>Dry-run</p>
<p>Contrary to <code>output_action: none</code>, output file won&#39;t be available in <code>/metrics_renders</code> directory</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">⏯️ Cannot be preset<br>
🔧 For development<br>
<b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>experimental_features</code></h4></td>
    <td rowspan="2"><p>Experimental features</p>
<p>No backward compatibility is guaranteed for these features</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">⏯️ Cannot be preset<br>
🔧 For development<br>
<b>type:</b> <code>array</code>
<i>(space-separated)</i>
<br>
<b>allowed values:</b><ul><li>--optimize-svg</li></ul></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><h4><code>use_mocked_data</code></h4></td>
    <td rowspan="2"><p>Use mocked data instead of live APIs</p>
<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">⏯️ Cannot be preset<br>
🔧 For development<br>
<b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
</table>
<!--/options-->
