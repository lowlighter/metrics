### 🧱 Core

Metrics also have general options that impact global metrics rendering.

[➡️ Available options](metadata.yml)

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

Specify a single value to apply it to both height and with, and two values to use the first one for width and the second for height. Both positive and negative values are accepted, but you must specify a percentage.

#### ℹ️ Examples workflows

```yaml
- uses: lowlighter/metrics@latest
  with:
    # ... other options
    config_padding: 6%, 10% # 6% width padding, 10% height padding
```

### 🧶 Using commits, pull requests or manual review to handle metrics output

It is possible to configure output behaviour using `output_action` option, which can be set to:
- `none`, where output will be generated in `/rendered/${filename}` without being pushed
  - You can then manually post-process it
- `commit` (default), where output will directly be committed and pushed to `committer_branch` 
- `pull-request`, where output will be committed to a new branch with current run id waiting for to be merged in `committer_branch`
  - By appending either `-merge`, `-squash` or `-rebase`, pull request will be automatically merged with given method
  - This method is useful to combine all editions of a single run with multiples metrics steps into a single commit on targetted branch
  - If you choose to manually merge pull requests, be sure to disable `push:` triggers on your workflow, as it'll count as your own commit

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

### 💱 Convert output to PNG/JPEG

It is possible to convert output from SVG to PNG or JPEG images by using `config_output` option.

Note that `png` does not support animations while `jpeg` does not support both animations and transparency.

#### ℹ️ Examples workflows

```yaml
- uses: lowlighter/metrics@latest
  with:
    # ... other options
    config_output: png
```
