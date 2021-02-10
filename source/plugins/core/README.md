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
