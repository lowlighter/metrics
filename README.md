# 🏗️ We're working on it !

<!-- TODO(@lowlighter): write contributing guide -->

logs: none => false

See [#1533](https://github.com/lowlighter/metrics/discussions/1533)

## ✈️ Migration guide

For convenience, _metrics_ offers a [v3 to v4 migration script](/source/run/cli/compat.ts).

### Migration and progression

- 📝 **Todo-list before pre-release**
  - [ ] Engine
    - [x] Rendering
    - [x] Inputs parsing
    - [x] Outputs parsing
    - [x] Plugin framework
    - [x] Processor framework
    - [ ] Docs auto-generation
    - [ ] Code coverage and unit test (not too bad currently !)
  - [ ] GitHub Action
    - [x] Implement `publish.gist`
    - [x] Implement `publish.file`
    - [x] Implement `publish.git`
    - [x] Docker image
  - [ ] Web server
    - [ ] Config crafter (kind of ok, needs some polishing)
    - [x] OAuth support
    - [ ] Deno deployment (partial support)
    - [ ] Vercel deployment (next priority)
  - [ ] Plugins (will add lines, languages and activity as part of pre-release)
    - [x] A simple plugin
    - [x] A plugin that requires puppeteer
    - [x] A plugin that requires an external library
    - [x] A plugin that requires GraphQL API
      - [x] A plugin that requires paginated GraphQL queries
    - [x] A plugin that requires REST API
      - [ ] A plugin that requires paginated REST API
    - [ ] A plugin that requires executing a raw command <!-- ==> languages -->
    - [ ] A plugin that requires rendering markdown
    - [ ] A plugin that requires rendering d3 graphs <!-- ==> languages -->
    - [ ] A plugin that requires rendering gif <!-- ==> skyline -->
- 📦 **Interfaces**
  - 🌐 **Web server**
    - ☣️ _(Working proof of concept)_
    - ❗ Syntax was unified with the _GitHub Action_ one
      - ✨ YAML syntax is "lax" and does not require spaces after each colon (e.g. `plugins:[{id:introduction}]` and `plugins: [{id: introduction}]` are both supported)
    - ✨ Append `.svg`, `.png`, `.jpg`/`.jpeg`, `.webp`, `.json`, `.html`, `.pdf`, `.txt` or `.text` for implicit conversion (e.g. `metrics.test/octocat.json`)
    - ❓ _Metrics Insights_ will probably be "removed", and maybe converted to a preset/template instead, which will make it on-par with all plugins, as `.html` format will be directly supported
      (basically since the SVG is already HTML, it'll just change the MIME type)
  - ⚙️ **GitHub Action**
    - ☣️ _(Not yet started)_
  - ⌨️ **CLI**
    - ☣️ _(Not yet started)_
- 🧩 **Plugins**
  - 📆 **Commit calendar**
    - ✨ Merged `isocalendar` and `calendar` plugins, which means that both plugins now have same level of features
      - ✨ `isocalendar` can now display multiple years or a specific year rather than just last 180 or 365 days
      - ✨ `calendar` can now display additional stats (such as commits per day, streaks, etc.)
    - ✨ `calendar.args.view` can now be set to `isometric` or `top-down`
    - ✨ `calendar.args.range` can now be set to `last-180-days`, `last-365-days`, a specific year or a custom range
      - ✨ `calendar.args.range.from` can now be set to `registration`, `-n` years relative to `calendar.args.range.to` or a specific year
      - ✨ `calendar.args.range.to` can now be set to `current-year` or a specific year
    - ✨ `calendar.args.colors` can now be set to `auto`, `halloween` or `winter`
  - 🎫 **Gists**
    - 🐞 Fine-grained tokens always returns `null` data
    - ✨ `gists.args.forks` can now be configured
    - ✨ `gists.args.visibility` can now be set to `public` or `all`
  - 🗼 **Rss feed**
    - ✨ `rss.args.limit` no longer has an upper limit (lower limit was changed to `1`)
  - 📸 **Webscraping**
    - ✨ Added `screenshot` as part of official plugins
  - 💭 **GitHub Community Support**
    - ❌ Removed as it was already deprecated
  - 🧱 **Core**
    - ☣️ _(Will be more detailed once API is finalized)_
    - ✨ Context
      - ❗ `token` ➡️ `plugins[].token`
      - ❗ `user` ➡️ `plugins[].handle` with `plugins[].entity: user` or `plugins[].entity: organization`
      - ❗ `repo` ➡️ `plugins[].handle` with `plugins[].entity: repository`
      - ❗ `template` ➡️ `plugins[].template`
      - ❗ `retries` ➡️ `plugins[].retries.attempts`
      - ❗ `retries_delay` ➡️ `plugins[].retries.delay`
      - ❗ `github_api_rest` ➡️ `plugins[].api`
      - ❗ `github_api_graphql` ➡️ `plugins[].api`
      - ❗ `plugins_errors_fatal` ➡️ `plugins[].fatal`
      - ❗ `config_timezone` ➡️ `plugins[].timezone`
      - ❗ `debug` ➡️ `plugins[].logs`
        - ✨ Configure verbosity with `none`, `error`, `warn`, `info`, `message`, `debug`, `trace`
    - ❗ `committer_gist` ➡️ `processors: [{id: publish.gist}}]` with `args.gist` and `args.filename`
    - ❌ `committer_token` ➡️ `plugins[].token` (publish transforms inherits the plugin context)
    - ❗ `committer_branch` ➡️ `processors: [{id: publish.git}}]` with `args.commit.branch`, `args.commit.base`, `args.pullrequest.branch` and `args.pullrequest.base`
    - ❗ `committer_message` ➡️ `processors: [{id: publish.git}}]` with `args.commit.message` or `args.pullrequest.message`
    - ❗ `filename` ➡️ `processors[]` with `args.filepath`
    - ❗ `config_twemoji` ➡️ `processors: [{id: render.twemojis}]`
    - ❗ `config_gemoji` ➡️ `processors: [{id: render.gemojis}]`
    - ❗ `config_octicon` ➡️ `processors: [{id: render.octicons}]`
    - ❗ `extras_js` ➡️ `processors: [{id: inject.script}]` with `args.script`
    - ❗ `extras_css` ➡️ `processors: [{id: inject.style}]` with `args.style`
    - ❗ `optimize` ➡️ `processors: [{id: optimize.svg}]`, `processors: [{id: optimize.xml}]`, `processors: [{id: optimize.css}]`
    - ❗ `config_output` ➡️ `processors: [{id: render}]` with `args.format`
    - ❗ `config_order` ➡️ Plugins order is honored from `plugins[]`
    - ❌ `config_display` ➡️ `processors: [{id: inject.style}]` with `args.style`, or a custom template
    - ❌ `config_animations` ➡️ `processors: [{id: inject.style}]` with `args.style`, or a custom template
    - ❌ `config_padding` ➡️
    - ❗ `delay` ➡️ `processors: [{id: control.delay}]`
    - ❗ `output_action`
      - ❗ `output_action: commit` ➡️ `processors: [{id: publish.git, args:{commit: {}}]`
      - ❗ `output_action: pull-request` ➡️ `processors: [{id: publish.git, args:{pullrequest: {}}]`
      - ❗ `output_action: pull-request-squash` ➡️ `processors: [{id: publish.git, args:{pullrequest: {merge: "squash"}}}]`
      - ❗ `output_action: pull-request-commit` ➡️ `processors: [{id: publish.git, args:{pullrequest: {merge: "commit"}}}]`
      - ❗ `output_action: pull-request-rebase` ➡️ `processors: [{id: publish.git, args:{pullrequest: {merge: "rebase"}}}]`
      - ❗ `output_action: gist` ➡️ `processors: [{id: publish.gist}]`
      - ❌ Files are not stored automatically in `/metrics_renders`, it is required to call manually the `publish.file` processor
        - ❗ `output_action: none` ➡️ `processors: [{id: publish.file}]`
    - ❗ `debug_print` ➡️ `processors: [{id: publish.console}]`
    - ❌ `setup_community_templates` ➡️ `plugins[].template: https://...`
    - ❌ `query` ➡️ `plugins[].template: https://...?params`
    - ❌ `verify`
- 🪄 **Processors**
  - 🧪 **Assertions**
    - ✨ Added processor to test assertions
  - ⏱️ **Delay**
    - ✨ Added processor to delay execution
  - 🔩 **Inject raw content**
    - ✨ Added processor to inject raw HTML content
  - 🔩 **Inject JavaScript**
    - ✨ Added processor to inject and execute JS
  - 🔩 **Inject CSS**
    - ✨ Added processor to inject CSS
  - 🧹 **Optimize CSS**
    - ✨ Added processor to optimize CSS
  - 🧹 **Optimize SVG**
    - ✨ Added processor to optimize SVG
  - 🧹 **Optimize XML**
    - ✨ Added processor to optimize XML
  - 📮 **Publish to console**
    - ✨ Added processor to publish content to console
  - 📮 **Publish to local file**
    - ✨ Added processor to publish content to local file
  - 📮 **Publish to GitHub Gist**
    - ✨ Added processor to publish content to GitHub Gist
  - 📮 **Publish to GitHub repository**
    - ✨ Added processor to publish content to GitHub repositories
    - ✨ `args.commit.branch`, `args.commit.base`, `args.pullrequest.base`, `args.pullrequest.base` can now be configured with more granularity
    - ✨ `args.pullrequest.title` and `args.pullrequest.message` can now be configured
  - 🎨 **Render image**
    - ✨ Added processor to render image
    - ✨ Can output to `svg`, `png`, `jpeg`, `webp`, `json`, `html`, `markdown` or `pdf`
  - 🖌️ **Render Twemojis**
    - ✨ Added processor to render [Twemojis](https://twemoji.twitter.com)
  - 🖌️ **Render GitHub emojis**
    - ✨ Added processor to render GitHub emojis
  - 🖌️ **Render GitHub octicons**
    - ✨ Added processor to render [GitHub Octicons](https://primer.style/design/foundations/icons)
- 💻 **Repository and maintenance**
  - ➕ Migration to [deno](https://deno.com) and TypeScript
    - ➕ Unified linting and formatting
    - ➕ Minimal execution flags for more security and data leaking prevention
  - ➕ Extended unit testing with coverage
    - ➕ Improved data mocking which does not requiring directly editing prototypes
    - ➕ Testing EYOF using the engine itself

### Legend

- ☣️ Experimental feature
- ✨ New feature
- ❌ Removed feature
- ❗ Edited feature
- ❓ Unsure feature
- ➡️ Migration path
- 🐞 Known issue that will be fixed before release

<!--

  quota_required_rest: Minimum GitHub REST API requests quota required to run
  quota_required_graphql: Minimum GitHub GraphQL API requests quota required to run
  quota_required_search: Minimum GitHub Search API requests quota required to run

  output_condition: Output condition
  config_base64: Base64-encoded images

  markdown: Markdown template path
  markdown_cache: Markdown file cache

  config_padding: Output padding
  config_presets: Configuration presets
  retries_output_action: Retries in case of failures (for output action)
  retries_delay_output_action: Delay between each retry (in seconds, for output action)
  clean_workflows: Clean previous workflows jobs
  notice_releases: Notice about new releases of metrics
  repositories: Fetched repositories
  repositories_batch: Fetched repositories per query
  repositories_forks: Include forks
  repositories_affiliations: Repositories affiliations
  repositories_skipped: Default skipped repositories
  users_ignored: Default ignored users
  commits_authoring: Identifiers that has been used for authoring commits

  base: Base content
  base_indepth: Indepth mode
  base_hireable: Show `Available for hire!` in header section
  base_skip: Skip base content
  plugin_languages: Enable languages plugin
  plugin_languages_ignored: Ignored languages
  plugin_languages_skipped: Skipped repositories
  plugin_languages_limit: Display limit
  plugin_languages_threshold: Display threshold (percentage)
  plugin_languages_other: Group unknown, ignored and over-limit languages into "Other" category
  plugin_languages_colors: Custom languages colors
  plugin_languages_aliases: Custom languages names
  plugin_languages_sections: Displayed sections
  plugin_languages_details: Additional details
  plugin_languages_indepth: Indepth mode
  plugin_languages_indepth_custom: Indepth mode - Custom repositories
  plugin_languages_analysis_timeout: Indepth mode - Analysis timeout
  plugin_languages_analysis_timeout_repositories: Indepth mode - Analysis timeout (repositories)
  plugin_languages_categories: Indepth mode - Displayed categories (most-used section)
  plugin_languages_recent_categories: Indepth mode - Displayed categories (recently-used section)
  plugin_languages_recent_load: Indepth mode - Events to load (recently-used section)
  plugin_languages_recent_days: Indepth mode - Events maximum age (day, recently-used section)
  plugin_stargazers: Enable stargazers plugin
  plugin_stargazers_days: Time range
  plugin_stargazers_charts: Charts
  plugin_stargazers_charts_type: Charts display type
  plugin_stargazers_worldmap: Stargazers worldmap
  plugin_stargazers_worldmap_token: Stargazers worldmap token
  plugin_stargazers_worldmap_sample: Stargazers worldmap sample
  plugin_lines: Enable lines plugin
  plugin_lines_skipped: Skipped repositories
  plugin_lines_sections: Displayed sections
  plugin_lines_repositories_limit: Display limit
  plugin_lines_history_limit: Years to display
  plugin_lines_delay: Delay before performing a second query
  plugin_topics: Enable topics plugin
  plugin_topics_mode: Display mode
  plugin_topics_sort: Sorting method
  plugin_topics_limit: Display limit
  plugin_stars: Enable stars plugin
  plugin_stars_limit: Display limit
  plugin_licenses: Enable licenses plugin
  plugin_licenses_setup: Setup command
  plugin_licenses_ratio: Used licenses ratio
  plugin_licenses_legal: Permissions, limitations and conditions about used licenses
  plugin_habits: Enable habits plugin
  plugin_habits_from: Events to use
  plugin_habits_skipped: Skipped repositories
  plugin_habits_days: Event maximum age
  plugin_habits_facts: Mildly interesting facts
  plugin_habits_charts: Charts
  plugin_habits_charts_type: Charts display type
  plugin_habits_trim: Trim unused hours on charts
  plugin_habits_languages_limit: Display limit (languages)
  plugin_habits_languages_threshold: Display threshold (percentage)
  plugin_contributors: Enable contributors plugin
  plugin_contributors_base: Base reference
  plugin_contributors_head: Head reference
  plugin_contributors_ignored: Ignored users
  plugin_contributors_contributions: Contributions count
  plugin_contributors_sections: Displayed sections
  plugin_contributors_categories: Contribution categories
  plugin_followup: Enable followup plugin
  plugin_followup_sections: Displayed sections
  plugin_followup_indepth: Indepth analysis
  plugin_followup_archived: Include archived repositories
  plugin_reactions: Enable reactions plugin
  plugin_reactions_limit: Display limit (issues and pull requests comments)
  plugin_reactions_limit_issues: Display limit (issues and pull requests, first comment)
  plugin_reactions_limit_discussions: Display limit (discussions, first comment)
  plugin_reactions_limit_discussions_comments: Display limit (discussions comments)
  plugin_reactions_days: Comments maximum age
  plugin_reactions_display: Display mode
  plugin_reactions_details: Additional details
  plugin_reactions_ignored: Ignored users
  plugin_people: Enable people plugin
  plugin_people_limit: Display limit
  plugin_people_identicons: Force identicons pictures
  plugin_people_identicons_hide: Hide identicons pictures
  plugin_people_size: Profile picture display size
  plugin_people_types: Displayed sections
  plugin_people_thanks: Special thanks
  plugin_people_sponsors_custom: Custom sponsors
  plugin_people_shuffle: Shuffle data
  plugin_sponsorships: Enable sponsorships plugin
  plugin_sponsorships_sections: Displayed sections
  plugin_sponsorships_size: Profile picture display size
  plugin_sponsors: Enable sponsors plugin
  plugin_sponsors_sections: Displayed sections
  plugin_sponsors_past: Past sponsorships
  plugin_sponsors_size: Profile picture display size
  plugin_sponsors_title: Title caption
  plugin_repositories: Enable repositories plugin
  plugin_repositories_featured: Featured repositories
  plugin_repositories_pinned: Pinned repositories
  plugin_repositories_starred: Featured most starred repositories
  plugin_repositories_random: Featured random repositories
  plugin_repositories_order: Featured repositories display order
  plugin_repositories_forks: Include repositories forks
  plugin_repositories_affiliations: Repositories affiliations
  plugin_discussions: Enable discussions plugin
  plugin_discussions_categories: Discussion categories
  plugin_discussions_categories_limit: Display limit (categories)
  plugin_starlists: Enable starlists plugin
  plugin_starlists_limit: Display limit (star lists)
  plugin_starlists_limit_repositories: Display limit (repositories per star list)
  plugin_starlists_languages: Star lists languages statistics
  plugin_starlists_limit_languages: Display limit (languages per star list)
  plugin_starlists_languages_ignored: Ignored languages in star lists
  plugin_starlists_languages_aliases: Custom languages names in star lists
  plugin_starlists_shuffle_repositories: Shuffle data
  plugin_starlists_ignored: Skipped star lists
  plugin_starlists_only: Showcased star lists
  plugin_achievements: Enable achievements plugin
  plugin_achievements_threshold: Rank threshold filter
  plugin_achievements_secrets: Secrets achievements
  plugin_achievements_display: Display style
  plugin_achievements_limit: Display limit
  plugin_achievements_ignored: Ignored achievements
  plugin_achievements_only: Showcased achievements
  plugin_notable: Enable notable plugin
  plugin_notable_filter: Query filter
  plugin_notable_skipped: Skipped repositories
  plugin_notable_from: Repository owner account type filter
  plugin_notable_repositories: Repository name
  plugin_notable_indepth: Indepth mode
  plugin_notable_types: Contribution types filter
  plugin_notable_self: Include own repositories
  plugin_activity: Enable activity plugin
  plugin_activity_limit: Display limit
  plugin_activity_load: Events to load
  plugin_activity_days: Events maximum age
  plugin_activity_visibility: Events visibility
  plugin_activity_timestamps: Events timestamps
  plugin_activity_skipped: Skipped repositories
  plugin_activity_ignored: Ignored users
  plugin_activity_filter: Events types
  plugin_traffic: Enable traffic plugin
  plugin_traffic_skipped: Skipped repositories
  plugin_code: Enable code plugin
  plugin_code_lines: Display limit (lines per code snippets)
  plugin_code_load: Events to load
  plugin_code_days: Events maximum age
  plugin_code_visibility: Events visibility
  plugin_code_skipped: Skipped repositories
  plugin_code_languages: Showcased languages
  plugin_projects: Enable projects plugin
  plugin_projects_limit: Display limit
  plugin_projects_repositories: Featured repositories projects
  plugin_projects_descriptions: Projects descriptions
  plugin_skyline: Enable skyline plugin
  plugin_skyline_year: Displayed year
  plugin_skyline_frames: Frames count
  plugin_skyline_quality: Image quality
  plugin_skyline_compatibility: Compatibility mode
  plugin_skyline_settings: Advanced settings
  plugin_pagespeed: Enable pagespeed plugin
  plugin_pagespeed_token: PageSpeed token
  plugin_pagespeed_url: Audited website
  plugin_pagespeed_detailed: Detailed results
  plugin_pagespeed_screenshot: Website screenshot
  plugin_pagespeed_pwa: PWA Status
  plugin_tweets: Enable tweets plugin
  plugin_tweets_token: Twitter API token
  plugin_tweets_user: Twitter username
  plugin_tweets_attachments: Tweets attachments
  plugin_tweets_limit: Display limit
  plugin_stackoverflow: Enable stackoverflow plugin
  plugin_stackoverflow_user: Stackoverflow user id
  plugin_stackoverflow_sections: Displayed sections
  plugin_stackoverflow_limit: Display limit (entries per section)
  plugin_stackoverflow_lines: Display limit (lines per questions and answers)
  plugin_stackoverflow_lines_snippet: Display limit (lines per code snippets)
  plugin_anilist: Enable aniList plugin
  plugin_anilist_user: AniList login
  plugin_anilist_medias: Medias types
  plugin_anilist_sections: Displayed sections
  plugin_anilist_limit: Display limit (medias)
  plugin_anilist_limit_characters: Display limit (characters)
  plugin_anilist_shuffle: Shuffle data
  plugin_music: Enable music plugin
  plugin_music_provider: Music provider
  plugin_music_token: Music provider token
  plugin_music_user: Music provider username
  plugin_music_mode: Display mode
  plugin_music_playlist: Playlist URL
  plugin_music_limit: Display limit
  plugin_music_played_at: Recently played - Last played timestamp
  plugin_music_time_range: Top tracks - Time range
  plugin_music_top_type: Top tracks - Display type
  plugin_posts: Enable posts plugin
  plugin_posts_source: External source
  plugin_posts_user: External source username
  plugin_posts_descriptions: Posts descriptions
  plugin_posts_covers: Posts cover images
  plugin_posts_limit: Display limit
  plugin_wakatime: Enable wakatime plugin
  plugin_wakatime_token: WakaTime API token
  plugin_wakatime_url: WakaTime URL
  plugin_wakatime_user: WakaTime username
  plugin_wakatime_sections: Displayed sections
  plugin_wakatime_days: Time range
  plugin_wakatime_limit: Display limit (entries per graph)
  plugin_wakatime_languages_other: Other languages
  plugin_wakatime_languages_ignored: Ignored languages
  plugin_wakatime_repositories_visibility: Repositories visibility
  plugin_leetcode: Enable leetcode plug
  plugin_leetcode_user: LeetCode logi
  plugin_leetcode_sections: Displayed sections
  plugin_leetcode_limit_skills: Display limit (skills)
  plugin_leetcode_ignored_skills: Ignored skills
  plugin_leetcode_limit_recent: Display limit (recent)
  plugin_steam: Enable steam plugin
  plugin_steam_token: Steam token
  plugin_steam_sections: Displayed sections
  plugin_steam_user: Steam user id
  plugin_steam_games_ignored: Ignored games
  plugin_steam_games_limit: Display limit (Most played games)
  plugin_steam_recent_games_limit: Display limit (Recently played games)
  plugin_steam_achievements_limit: Display limit (Games achievements)
  plugin_steam_playtime_threshold: Display threshold (Game playtime in hours)
  plugin_16personalities: Enable 16personalities plugin
  plugin_16personalities_url: Profile URL
  plugin_16personalities_sections: Displayed sections
  plugin_16personalities_scores: Display traits scores
  plugin_chess: Enable chess plugin
  plugin_chess_token: Chess platform token
  plugin_chess_user: Chess platform login
  plugin_chess_platform: Chess platform
  plugin_chess_animation: Animation settings
  plugin_fortune: Enable fortune plugin
  plugin_nightscout: Enable nightscout plugin
  plugin_nightscout_url: Nightscout URL
  plugin_nightscout_datapoints: Number of datapoints shown the graph
  plugin_nightscout_lowalert: Threshold for low blood sugar
  plugin_nightscout_highalert: Threshold for high blood sugar
  plugin_nightscout_urgentlowalert: Threshold for urgently low blood sugar
  plugin_nightscout_urgenthighalert: Threshold for urgently high blood sugar
  plugin_poopmap: Enable poopmap plugin
  plugin_poopmap_token: PoopMap API token
  plugin_poopmap_days: Time range
  plugin_splatoon: Enable splatoon plugin
  plugin_splatoon_token: Splatnet token
  plugin_splatoon_sections: Displayed sections
  plugin_splatoon_versus_limit: Display limit (Versus)
  plugin_splatoon_salmon_limit: Display limit (Salmon run)
  plugin_splatoon_statink: stat.ink integration
  plugin_splatoon_statink_token: stat.ink token
  plugin_splatoon_source: Source
  plugin_stock: Enable stock plugin
  plugin_stock_token: Yahoo Finance token
  plugin_stock_symbol: Company stock symbol
  plugin_stock_duration: Time range
  plugin_stock_interval: Time interval between points
-->
