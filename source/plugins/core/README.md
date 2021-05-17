### 🧱 Core

Metrics also have general options that impact global metrics rendering.

[➡️ Available options](metadata.yml)

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
    query: '{"custom_colo r":"#FF0000"}'
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
    config_padding: 16, 32 + 8% # 16px width padding, 32px + 8% height padding
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

### ♻️ Retrying automatically failed rendering

Rendering is subject to external factors and can fail from time to time.
It is possible to mitigate this issue using `retries` and `retries_delay` options to automatically retry later metrics rendering and avoid workflow fails.

#### ℹ️ Examples workflows

```yaml
- uses: lowlighter/metrics@latest
  with:
    # ... other options
    retries: 3
    retries_delay: 300
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

#### ℹ️ Examples workflows

```yaml
- uses: lowlighter/metrics@latest
  with:
    # ... other options
    markdown: template.md
    markdown_cache: .cache
    config_output: markdown-pdf
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