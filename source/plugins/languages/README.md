<!--header-->
<!--/header-->

## ➡️ Available options

<!--options-->
<!--/options-->

## 🔎 `indepth` mode

The default algorithm use the top languages provided of each repository you contributed to.
When working in collaborative projects with a lot of people, these numbers may be less representative of your actual work.

The `plugin_languages_indepth` option lets you use a more advanced algorithm for more accurates statistics.
Under the hood, it will clone your repositories, run [linguist-js](https://github.com/Nixinova/Linguist) (a JavaScript port of [GitHub linguist](https://github.com/github/linguist)) and iterate over patches matching your `commits_authoring` setting.

Since git lets you use any email and username for commits, *metrics* may not be able to detect a commit ownership if it isn't the same as your GitHub personal data. By default, it will use your GitHub username, but you can configure additional matching usernames and email addresses using `commits_authoring` option.

*Example: configuring `indepth` mode*
```yml
- uses: lowlighter/metrics@latest
  with:
    plugin_languages: yes
    plugin_languages_indepth: yes
    commits_authoring: firstname lastname, username, username@users.noreply.github.com
```

> 💡 This feature unlocks the `lines` option in `plugin_languages_details`

> ⚠️ This feature significantly increase workflow time

> ⚠️ Since this mode iterates over **each commit of each repository**, it is not suited for large code base, especially those with a large amount of commits and the ones containing binaries. While `plugin_languages_analysis_timeout` can be used to increase the default timeout for analysis, please be responsible and keep this feature disabled if it cannot work on your account to save GitHub resources and our planet 🌏

> ⚠️ Although *metrics* does not send any code to external sources, repositories are temporarily cloned on the GitHub Action runner. It is advised to keep this option disabled when working with sensitive data or company code. Use at your own risk, *metrics* and its authors **cannot** be held responsible for any resulting code leaks. Source code is available for auditing at [analyzers.mjs](/source/plugins/languages/analyzers.mjs).

> 🌐 Web instances must enable this feature in `settings.json`

## 📅 Recently used languages

This feature uses a similar algorithm as `indepth` mode, but uses patches from your events feed instead.
It will fetch a specified amount of recent push events and perform linguistic analysis on it.

> ⚠️ Note that *metrics* won't be able to use more events than GitHub API is able to provide

*Example: display recently used languages from 400 GitHub events from last 2 weeks*
```yml
- uses: lowlighter/metrics@latest
  with:
    plugin_languages: yes
    plugin_languages_sections: recently-used
    plugin_languages_recent_load: 400
    plugin_languages_recent_days: 14
```

> 🌐 Web instances must enable this feature in `settings.json`

## 🥽 Controling which languages are displayed

Several options lets you customize which languages should be displayed.
It is possible to ignore completely languages or those lower than a given threshold, skip repositories, and filter by language categories.

*Example: hide HTML and CSS languages, skip lowlighter/metrics repository*
```yml
- uses: lowlighter/metrics@latest
  with:
    plugin_languages: yes
    plugin_languages_ignored: html, css
    plugin_languages_skipped: lowlighter/metrics
```

*Example: hide languages with less than 2% usage*
```yml
- uses: lowlighter/metrics@latest
  with:
    plugin_languages: yes
    plugin_languages_threshold: 2%
```

> 💡 The threshold feature will automatically scale remaining languages so the total percentage is always 100%. However, other stats like bytes count and lines are not affected.

When using `indepth` mode, it is possible to hide languages per category.
Supported categories are `data`, `markup`, `programming` and `prose`.

*Example: hide data and prose languages from stats*
```yml
- uses: lowlighter/metrics@latest
  with:
    plugin_languages: yes
    plugin_languages_categories: data, prose
    plugin_languages_recent_categories: data, prose
```

## 🎨 Using custom colors

The plugin uses GitHub language colors, but it may be hard to distinguish them depending on which languages you use.
It is possible to use custom colors using `plugin_languages_colors` option.

The following syntaxes are supported:
- A predefined set from [colorsets.json](colorsets.json) *(support limited to 8 languages max)*
- `${language}:${color}` to change the color of a language *(case insensitive)*
- `${n}:${color}` to change the color of the the n-th language

Both hexadecimal and [named color](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value) are supported.

*Example: using a predefined color set*
```yml
- uses: lowlighter/metrics@latest
  with:
    plugin_languages: yes
    plugin_languages_colors: rainbow
    plugin_languages_limit: 8
```

*Example: setting JavaScript to red, the first language to blue and the second one to `#ff00aa`*
```yml
- uses: lowlighter/metrics@latest
  with:
    plugin_languages: yes
    plugin_languages_colors: javascript:red, 0:blue, 1:#ff00aa
```

## ✍️ Using custom languages name

This plugin is limited by [GitHub linguist](https://github.com/github/linguist) capabilities, meaning that some languages may be mislabeled in some cases.

To mitigate this, it is possible to use `plugin_languages_aliases` option and provide a list of overrides using the following syntax: `${language}:${alias}` *(case insensitive)*.

*Example: display JavaScript as JS and TypeScript as TS*
```yml
- uses: lowlighter/metrics@latest
  with:
    plugin_languages: yes
    plugin_languages_aliases: javascript:JS typescript:TS
```

## ℹ️ Examples workflows

<!--examples-->
<!--/examples-->
