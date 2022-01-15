### 🧱 Core

Metrics also have general options that impact global metrics rendering.

#### ➡️ Available options

<!--options-->
<table>
  <tr>
    <td align="center" nowrap="nowrap">Type</i></td><td align="center" nowrap="nowrap">Description</td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>token</code></td>
    <td rowspan="2">GitHub Personal Token<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">✔️ Required<br>
🔐 Token<br>
<b>type:</b> <code>token</code>
<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>user</code></td>
    <td rowspan="2">GitHub username<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>string</code>
<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>repo</code></td>
    <td rowspan="2">GitHub repository<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>string</code>
<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>committer_token</code></td>
    <td rowspan="2">GitHub Token used to commit metrics<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">🔐 Token<br>
<b>type:</b> <code>token</code>
<br>
<b>default:</b> ${{ github.token }}<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>committer_branch</code></td>
    <td rowspan="2">Branch used to commit rendered metrics<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>string</code>
<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>committer_message</code></td>
    <td rowspan="2">Commit message<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>string</code>
<br>
<b>default:</b> Update ${filename} - [Skip GitHub Action]<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>committer_gist</code></td>
    <td rowspan="2">Gist used to store metrics<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>string</code>
<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>filename</code></td>
    <td rowspan="2">Rendered metrics output path<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>string</code>
<br>
<b>default:</b> github-metrics.*<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>markdown</code></td>
    <td rowspan="2">Rendered markdown output path<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>string</code>
<br>
<b>default:</b> TEMPLATE.md<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>markdown_cache</code></td>
    <td rowspan="2">Rendered markdown file cache<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>string</code>
<br>
<b>default:</b> .cache<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>output_action</code></td>
    <td rowspan="2">Output action<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>string</code>
<br>
<b>default:</b> commit<br>
<b>allowed values:</b><ul><li>none</li><li>commit</li><li>pull-request</li><li>pull-request-merge</li><li>pull-request-squash</li><li>pull-request-rebase</li><li>gist</li></ul></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>output_condition</code></td>
    <td rowspan="2">Output condition<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>string</code>
<br>
<b>default:</b> always<br>
<b>allowed values:</b><ul><li>always</li><li>data-changed</li></ul></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>optimize</code></td>
    <td rowspan="2">SVG optimization<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>array</code>
<i>(comma-separated)</i>
<br>
<b>default:</b> css, xml<br>
<b>allowed values:</b><ul><li>css</li><li>xml</li><li>svg</li></ul></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>setup_community_templates</code></td>
    <td rowspan="2">Additional community templates to setup<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">🌐 Web instances must configure <code>settings.json</code><br>
<b>type:</b> <code>array</code>
<i>(comma-separated)</i>
<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>template</code></td>
    <td rowspan="2">Template to use<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>string</code>
<br>
<b>default:</b> classic<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>query</code></td>
    <td rowspan="2">Additional query parameters<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>json</code>
<br>
<b>default:</b> {}<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>extras_css</code></td>
    <td rowspan="2">Extra CSS<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">🌐 Web instances must configure <code>settings.json</code><br>
<b>type:</b> <code>string</code>
<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>config_timezone</code></td>
    <td rowspan="2">Timezone used<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">⏭️ Global option<br>
<b>type:</b> <code>string</code>
<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>config_order</code></td>
    <td rowspan="2">Configure content order<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">⏭️ Global option<br>
<b>type:</b> <code>array</code>
<i>(comma-separated)</i>
<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>config_twemoji</code></td>
    <td rowspan="2">Use twemojis instead of emojis<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">⏭️ Global option<br>
<b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>config_gemoji</code></td>
    <td rowspan="2">Use GitHub custom emojis<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">⏭️ Global option<br>
<b>type:</b> <code>boolean</code>
<br>
<b>default:</b> yes<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>config_display</code></td>
    <td rowspan="2">Render display width<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">⏭️ Global option<br>
<b>type:</b> <code>string</code>
<br>
<b>default:</b> regular<br>
<b>allowed values:</b><ul><li>regular</li><li>large</li><li>columns</li></ul></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>config_animations</code></td>
    <td rowspan="2">SVG CSS animations<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">⏭️ Global option<br>
<b>type:</b> <code>boolean</code>
<br>
<b>default:</b> yes<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>config_base64</code></td>
    <td rowspan="2">Encode images links into base64 data<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">⏭️ Global option<br>
<b>type:</b> <code>boolean</code>
<br>
<b>default:</b> yes<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>config_padding</code></td>
    <td rowspan="2">Image padding<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>string</code>
<br>
<b>default:</b> 0, 8 + 11%<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>config_output</code></td>
    <td rowspan="2">Output image format<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>string</code>
<br>
<b>default:</b> auto<br>
<b>allowed values:</b><ul><li>auto</li><li>svg</li><li>png</li><li>jpeg</li><li>json</li><li>markdown</li><li>markdown-pdf</li><li>insights</li></ul></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>retries</code></td>
    <td rowspan="2">Number of retries<img width="900" height="1" alt=""></td>
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
    <td nowrap="nowrap"><code>retries_delay</code></td>
    <td rowspan="2">Time to wait (in seconds) before each retry<img width="900" height="1" alt=""></td>
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
    <td nowrap="nowrap"><code>retries_output_action</code></td>
    <td rowspan="2">Number of retries (output action)<img width="900" height="1" alt=""></td>
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
    <td nowrap="nowrap"><code>retries_delay_output_action</code></td>
    <td rowspan="2">Time to wait (in seconds) before each retry (output action)<img width="900" height="1" alt=""></td>
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
    <td nowrap="nowrap"><code>delay</code></td>
    <td rowspan="2">Use this to avoid triggering abuse mechanics on large workflows<img width="900" height="1" alt=""></td>
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
    <td nowrap="nowrap"><code>use_prebuilt_image</code></td>
    <td rowspan="2">Use pre-built image from GitHub registry<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><b>type:</b> <code>boolean</code>
<br>
<b>default:</b> yes<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>plugins_errors_fatal</code></td>
    <td rowspan="2">Die on plugins errors<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">🔧 For development<br>
<b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>debug</code></td>
    <td rowspan="2">Debug logs<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">🔧 For development<br>
<b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>verify</code></td>
    <td rowspan="2">Verify SVG<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">🔧 For development<br>
<b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>debug_flags</code></td>
    <td rowspan="2">Debug flags<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">🔧 For development<br>
<b>type:</b> <code>array</code>
<i>(space-separated)</i>
<br>
<b>allowed values:</b><ul><li>--cakeday</li><li>--hireable</li><li>--halloween</li><li>--error</li></ul></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>dryrun</code></td>
    <td rowspan="2">Enable dry-run<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">🔧 For development<br>
<b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>experimental_features</code></td>
    <td rowspan="2">Experimental features<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">🔧 For development<br>
<b>type:</b> <code>array</code>
<i>(space-separated)</i>
<br>
<b>allowed values:</b><ul><li>--optimize-svg</li></ul></td>
  </tr>
  <tr>
    <td nowrap="nowrap"><code>use_mocked_data</code></td>
    <td rowspan="2">Use mocked data instead of live APIs<img width="900" height="1" alt=""></td>
  </tr>
  <tr>
    <td nowrap="nowrap">🔧 For development<br>
<b>type:</b> <code>boolean</code>
<br>
<b>default:</b> no<br></td>
  </tr>
</table>
<!--/options-->

*[→ Full specification](metadata.yml)*

### 🛠️ General configuration

A GitHub personal access token is required in `token` option.
It cannot be `${{ github.token }}` or `${{ secrets.GITHUB_TOKEN }}` as these are special tokens scoped to a single repository, so metrics would not be able to fetch any user related data or external repositories informations.

By default, metrics will be generated for the user who owns the `token`, but it is possible to generate them for another user or an organization using `user` option. Additional scopes may be required to do so.

To generate metrics for a repository, use `user` option to specify the repository owner, and `repo` option to specify its name.

Committer options lets you specify how to rendered metrics should be pushed.
Usually leaving default values is fine, but you have the possibility to change which user will commit to repository using `committer_token`, on which branch using `committer_branch` and with a specific commit message using `committer_message`.

You may also be interested in using [pull requests](/source/plugins/core#-using-commits-pull-requests-or-manual-review-to-handle-metrics-output) instead of commits.

When generating multiple metrics, you'll need to save them under different `filename`s to avoid them being overwritten at each step.

#### ℹ️ Examples workflows

```yaml
- uses: lowlighter/metrics@latest
  with:
    token: ${{ secrets.METRICS_TOKEN }}
    user: lowlighter
    repo: metrics
    committer_token: ${{ github.token }}
    committer_branch: my-branch
    committer_message: Update metrics
    filename: metrics.svg
    # ... other options
```

### 🖼️ Templates configuration

To use a different template, pass its identifier to `template` option.
See the [list of supported templates](/source/templates/README.md).

It is possible to use templates from any forked repositories (not necessarly your own) while using official releases  using [community templates](/source/templates/community/README.md).

Some templates may accept additional custom options that you can pass through the `query` option, using a JSON formatted string.

#### ℹ️ Examples workflows

```yaml
- uses: lowlighter/metrics@latest
  with:
    # ... other options
    template: "@super-metrics"
    setup_community_templates: octocat/metrics@master:super-metrics, octocat/metrics@master:trusted-metrics+trust
    query: '{"custom_color":"#FF0000"}'
```

### 🎨 Custom CSS styling

You can inject CSS rules using `extras_css` option.

If you make heavy use of this option, consider using [community templates](/source/templates/community/README.md) instead.

#### ℹ️ Examples workflows

```yaml
- uses: lowlighter/metrics@latest
  with:
    # ... other options
    base: header
    extras_css: |
      h2 {
        color: red;
      }
```

### 🌐 Set timezone

By default, dates are based on Greenwich meridian (GMT/UTC).

Set your timezone (see [here](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) for a list of supported timezones) using `config_timezone` option.

#### ℹ️ Examples workflows

```yaml
- uses: lowlighter/metrics@latest
  with:
    # ... other options
    config_timezone: Europe/Paris
```

### 📦 Ordering content

You can order metrics content by using `config_order` option.

It is not mandatory to specify all partials of used templates.
Omitted one will be appended using default order.

#### ℹ️ Examples workflows

```yaml
- uses: lowlighter/metrics@latest
  with:
    # ... other options
    base: header
    plugin_isocalendar: yes
    plugin_languages: yes
    plugin_stars: yes
    config_order: base.header, isocalendar, languages, stars
```

### 🥳 Render GitHub custom emojis

GitHub provide additional emojis which are not registered in Unicode standard (:octocat:, :shipit:, :trollface:, ...).
You can choose to render (or not) [GitHub emojis](https://github.com/github/gemoji).

It may increase filesize since it replace special strings by base64 images.

#### ℹ️ Examples workflows

```yaml
- uses: lowlighter/metrics@latest
  with:
    # ... other options
    config_gemoji: yes
```

### 🙂 Using twemojis instead of emojis

You can choose to use [twemojis](https://github.com/twitter/twemoji) instead of regular emojis so rendered metrics are more consistent across all platforms.

It may increase filesize since it replace unicode characters by SVG images.

#### ℹ️ Examples workflows

```yaml
- uses: lowlighter/metrics@latest
  with:
    # ... other options
    config_twemoji: yes
```

### ↔️ Controlling display size

Some templates like `classic` and `repositories` support different output display size:
- `regular` (default) will render a medium-sized image, which is suitable for both desktop and mobile displays and is preferable when using data-intensive metrics (since text may be scaled down on small devices)
- `large` will render a large-sized image, which may be more suitable for some plugins (like displaying topics icons,  repository contributors, etc.)
- `columns` will render a full-width image, with two columns on desktop / one column on mobile

#### ℹ️ Examples workflows

```yaml
- uses: lowlighter/metrics@latest
  with:
    # ... other options
    config_display: large
```

### 🎞️ SVG CSS Animations

As rendered metrics use HTML and CSS, some templates have animations.
You can choose to disable them by using `config_animations` option.

#### ℹ️ Examples workflows

```yaml
- uses: lowlighter/metrics@latest
  with:
    # ... other options
    committer_branch: my-branch
```

### 🔲 Adjust padding

Height of rendered metrics is computed after being rendered through an headless browser.
As it can depend on fonts and operating system, it is possible that final result is cropped or has blank space at the bottom.

You can adjust padding by using `config_padding` option.

Specify a single value to apply it to both height and with, and two values to use the first one for width and the second for height. Both positive and negative values are accepted.

The allowed format is `(absolute padding) + (relative padding)%` (each operand is optional).

#### ℹ️ Examples workflows

```yaml
- uses: lowlighter/metrics@latest
  with:
    # ... other options
    config_padding: 0, 8 + 11% # 0px width padding, 8px + 11% height padding
```

### 🧶 Using commits, pull requests, manual reviews or gists to handle metrics output

It is possible to configure output behaviour using `output_action` option, which can be set to:
- `none`, where output will be generated in `/rendered/${filename}` without being pushed
  - You can then manually post-process it
- `commit` (default), where output will directly be committed and pushed to `committer_branch`
- `pull-request`, where output will be committed to a new branch with current run id waiting for to be merged in `committer_branch`
  - By appending either `-merge`, `-squash` or `-rebase`, pull request will be automatically merged with given method
  - This method is useful to combine all editions of a single run with multiples metrics steps into a single commit on targetted branch
  - If you choose to manually merge pull requests, be sure to disable `push:` triggers on your workflow, as it'll count as your own commit
- `gist`, where output will be stored an already existing gist
  - To use this feature, a `gists` scope must be granted to your `token` and `committer_gist` identifier must be provided

It also possible to alter output condition using `output_condition` option, which can be set to:
- `always`, to always push changes (provided that git sha changed)
- `data-changed`, to skip changes if no actual data changed (e.g. when only render timestamp changed)

#### ℹ️ Examples workflows

```yaml
# The following will:
#   - open a pull request with "my-metrics-0.svg" as first commit
#   - append "my-metrics-1.svg" as second commit
#   - merge pull request (as second step is set to "pull-request-merge")

- uses: lowlighter/metrics@latest
  with:
    # ... other options
    filename: my-metrics-0.svg
    output_action: pull-request

- uses: lowlighter/metrics@latest
  with:
    # ... other options
    filename: my-metrics-1.svg
    output_action: pull-request-merge
```

### ♻️ Retrying automatically failed rendering and output action

Rendering is subject to external factors and can fail from time to time.
It is possible to mitigate this issue using `retries` and `retries_delay` options to automatically retry later metrics rendering and avoid workflow fails.

Output action is also subject to GitHub API rate-limiting and status and can fail from time to time.
It is possible to mitigate this issue using `retries_output_action` and `retries_delay_output_action` options to automatically retry later metrics output action and avoid workflow fails. As this is a separate step from rendering, metrics rendering won't be computed again during this phase.

#### ℹ️ Examples workflows

```yaml
- uses: lowlighter/metrics@latest
  with:
    # ... other options
    retries: 3
    retries_delay: 300
    retries_output_action: 5
    retries_delay_output_action: 120
```

### 💱 Convert output to PNG/JPEG or JSON

It is possible to convert output from SVG to PNG or JPEG images and even to JSON by using `config_output` option.

Note that `png` does not support animations while `jpeg` does not support both animations and transparency.

Using `json` output can be useful if you want to retrieve all data computed by metrics without rendering it.
It could then be processed for other usages.

#### ℹ️ Examples workflows

```yaml
- uses: lowlighter/metrics@latest
  with:
    # ... other options
    config_output: png
```

### 🖨️ Convert output to PDF

It is possible to convert output to PDF when using a markdown template by setting `config_output` to `markdown-pdf`.

It is advised to keep `config_base64: yes` to encode embed images in base64 and make self-contained documents.

#### ℹ️ Examples workflows

```yaml
- uses: lowlighter/metrics@latest
  with:
    # ... other options
    markdown: template.md
    markdown_cache: .cache
    config_output: markdown-pdf
    config_base64: yes
```

### 🗜️ Optimize SVG output

It is possible to optimize SVG output and reducing its filesize to improve loading times and reduce storage.

The following optimizations are supported:
- `css`, which purge unused CSS and minify remaining styles
- `xml`, which pretty-print XML (it also helps reducing diffs between commits)
- `svg`, which optimize SVG with SVGO (experimental)

#### ℹ️ Examples workflows

```yaml
- uses: lowlighter/metrics@latest
  with:
    # ... other options
    optimize: css, xml

- uses: lowlighter/metrics@latest
  with:
    # ... other options
    optimize: css, xml, svg
    experimental_features: --optimize-svg
```

### ✨ Render `Metrics insights` statically

It is possible to generate an HTML file containing `✨ Metrics insights` output by setting `config_output` to `insights`. Resulting output will already be pre-rendered and not contain any external sources (i.e. no JavaScript and style sheets).

> Note that like `✨ Metrics insights` content is not configurable.

#### ℹ️ Examples workflows

```yaml
- uses: lowlighter/metrics@latest
  with:
    # ... other options
    config_output: insights
```

### 🐳 Faster execution with prebuilt docker images

If you're using the official release `lowlighter/metrics` as a GitHub Action (either a specific version, `@latest` or `@master`), it'll pull a prebuilt docker container image from [GitHub Container Registry](https://github.com/users/lowlighter/packages/container/package/metrics) which contains already installed dependencies which will cut execution time from ~5 minutes to ~1 minute.

These are published through this automated [workflow](/.github/workflows/workflow.yml).

As code is frozen on docker container images, this feature is disabled on forks to take into account any changes you've made on it. In case you wish to use official releases along with a custom template present on your fork, check out [community templates](/source/templates/community/README.md).

#### ℹ️ Examples workflows

```yaml
- uses: lowlighter/metrics@latest
  with:
    # ... other options
    use_prebuilt_image: yes
```
