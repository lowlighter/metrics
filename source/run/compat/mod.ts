// Imports
//import { env } from "@engine/utils/io.ts"
import { Config } from "@run/compat/config.ts"
import { yaml } from "@run/compat/report.ts"
import { parse } from "@run/compat/parse.ts"

/** Compatibility type */
// deno-lint-ignore no-explicit-any
type compat = any

/** Compatibility layer */
export async function compat(_inputs: Record<PropertyKey, unknown>) {
  const config = new Config()
  const inputs = await parse(_inputs, config.report)
  config.report.console({flush:true})

  const { Requests } = await import("@engine/components/requests.ts")
  const requests = new Requests(import.meta, { logs: "none", mock: false, api: "https://api.github.com", timezone: "Europe/Paris", token: inputs.token } as compat)
  /*
    TODO(@lowlighter): use api endpoint, handle dynamic values:
    switch (value) {
      case ".user.login":
      case ".user.twitter":
      case ".user.website":
    }
  */

  // 🗝️ Token ===========================================================================================
  if (inputs.token) {
    const snippet = { config: { presets: { default: { plugins: { token: inputs.token } } } } }
    config.patch("token", snippet)
    config.report.info("Token should now be set at preset or plugin level")
    if (!await inputs.token.read().startsWith("github_pat_")) {
      config.report.info("Fine-grained personal access tokens are now supported by metrics and it is advised to use them to reduce security risks")
    }
  }

  // ⚙️ General config ==================================================================================

  // Target entity
  if (inputs.user) {
    const options = ["user"]
    const snippet = { config: { presets: { default: { plugins: { handle: inputs.user, entity: "user" } } } } }
    if (inputs.repo) {
      snippet.config.presets.default.plugins.handle = `${inputs.user}/${inputs.repo}`
      snippet.config.presets.default.plugins.entity = "repository"
      options.push("repo")
    } else {
      try {
        const { data: { type: entity } } = await requests.rest(requests.api.users.getByUsername, { username: inputs.user })
        snippet.config.presets.default.plugins.entity = entity.toLocaleLowerCase()
      } catch {
        // Ignore
      }
    }
    config.patch(options, snippet)
    config.report.info("User, organization and repository handles should now be set at preset or plugin level")
    config.report.warning("Entity type is not inferred anymore and should now be set manually at preset or plugin level")
  }

  // GitHub API endpoints
  if ((inputs.github_api_rest) || (inputs.github_api_graphql)) {
    if (inputs.github_api_rest !== inputs.github_api_graphql) {
      config.report.error("GitHub API REST and GraphQL endpoints cannot be different anymore")
    }
    const snippet = { config: { presets: { default: { plugins: { api: inputs.github_api_rest || inputs.github_api_graphql } } } } }
    config.patch(["github_api_rest", "github_api_graphql"], snippet)
    config.report.info("GitHub API endpoints should now be set at preset or plugin level")
  }

  // Presets
  if (inputs.config_presets) {
    config.patch("config_presets", null)
    config.report.info("Presets are now handled directly at configuration level")
    // TODO(@lowlighter): Should it be backwards compatible?
  }

  // Timezone
  if (inputs.config_timezone) {
    const snippet = { config: { presets: { default: { plugins: { timezone: inputs.config_timezone } } } } }
    config.patch("config_timezone", snippet)
    config.report.info("Timezone should now be set at preset or plugin level")
  }

  // Retries
  if ((inputs.retries)||(inputs.retries_delay)) {
    const retries = {attempts:inputs.retries, delay:inputs.retries_delay}
    const snippet = { config: { presets: { default: { plugins: { retries}, procesors:{retries} } } } }
    config.patch(["retries", "retries_delay"], snippet)
    config.report.info("Retry configuration can now be set at preset, plugin or processor level")
  }

  // Debug logs
  if (inputs.debug) {
    const snippet = { config: { presets: { default: { plugins: { logs: "debug" }, processors: { logs: "debug" } } } } }
    config.patch("debug", snippet)
    config.report.info("Logs level can now be set at preset, plugin or processor level, and supports different levels of logging")
  }

  // Fatal errors
  if (inputs.plugins_errors_fatal) {
    const snippet = { config: { presets: { default: { plugins: { fatal: true }, procesors:{fatal:true} } } } }
    config.patch("plugins_errors_fatal", snippet)
    config.report.info("Errors status can now be set at preset, plugin or processor level")
  }

  // Mocked data
  if (inputs.use_mocked_data) {
    const snippet = { config: { presets: { default: { plugins: { mock: true } } } } }
    config.patch("use_mocked_data", snippet)
    config.report.info("Mock status can now be set at preset or plugin level")
  }

  // Dry-run
  if (inputs.dryrun) {
    config.patch("dryrun", null)
    config.report.warning("While dryrun mode has been removed, the same behavior can be achieved by not using the `render` processor")
  }

  // Display options
  if ((inputs.config_display) || (inputs.config_animations === false) || (inputs.config_padding)) {
    const options = []
    for (const key of ["config_display", "config_animations", "config_padding"]) {
      if (inputs[key]) {
        options.push(key)
      }
    }
    config.patch(options, null)
    config.report.info(`Display, animations and padding should now be handled manually using \`processors/inject.style\``)
  }

  // Removed options
  if ((inputs.verify)|| (inputs.debug_flags) || (inputs.experimental_features) || (inputs.clean_workflows)) {
    const options = []
    for (const key of ["verify", "debug_flags", "experimental_features"]) {
      if (inputs[key]) {
        options.push(key)
      }
    }
    config.patch(options, null)
  }

  // 📕 Templates =======================================================================================

  // Community templates
  if (inputs.setup_community_templates) {
    config.patch("setup_community_templates", null)
    config.report.info("Community templates are now directly fetched remotely upon usage")
  }
  if ((typeof inputs.query === "object")&&(Object.keys(inputs.query).length)) {
    config.patch("query", null)
    config.report.info(`Query parameters for templates should now be handled through url parameters:\n${yaml({template: "https://example.test/template?param1=value1&param2=value2&..."})}`)
  }

  // Templates
  if (inputs.template) {
    const snippet = { config: { presets: { default: { plugins: { template: inputs.template } } } } }
    config.patch("template", snippet)
  }

  // Markdown
  if (inputs.markdown) {
    //markdown
    //markdown_cache
    //TODO(@lowlighter): implement
    config.report.unimplemented("`markdown` render has not been migrated to v4 yet")
  }

  // 🧩 Plugins =========================================================================================

  // 🗃️ Base content
  if (inputs.base) {
    //base
    //base_indepth
    //base_hireable
    //base_skip
    //repositories
    //repositories_batch
    //repositories_forks
    //repositories_affiliations
    //repositories_skipped
    //users_ignored
    //commits_authoring
    //TODO(@lowlighter): implement
    config.report.unimplemented("`base` plugin has not been migrated to v4 yet")
  }

  // 🙋 Introduction
  if (inputs.plugin_introduction) {
    const options = ["plugin_introduction"]
    const snippet = { config: { plugins: [{ introduction: {} }] } } as compat
    if (inputs.plugin_introduction_title === false) {
      snippet.config.plugins[0].processors = [{ "inject.style": { style: ".introduction .title { display: none }" } }]
      options.push("plugin_introduction_title")
    }
    config.patch(options, snippet)
  }

  // 📅 Isometric commit calendar
  if (inputs.plugin_isocalendar) {
    const options = ["plugin_isocalendar"]
    const snippet = { config: { plugins: [{ calendar: { view: "isometric", range: "last-180-days" } }] } } as compat
    if (inputs.plugin_isocalendar_duration) {
      snippet.config.plugins[0].calendar.range = { "half-year": "last-180-days", "full-year": "last-365-days" }[inputs.plugin_isocalendar_duration as string]
      options.push("plugin_isocalendar_duration")
    }
    if (inputs.debug_flags.find((f: string) => ["--halloween", "--winter"].includes(f))) {
      snippet.config.plugins[0].calendar.colors = inputs.debug_flags.find((f: string) => ["--halloween", "--winter"].includes(f)).replace("--", "")
      options.push("debug_flags")
    }
    config.patch(options, snippet)
  }

  // 📅 Commit calendar
  if (inputs.plugin_calendar) {
    const options = ["plugin_calendar", "plugin_calendar_limit"]
    const snippet = { config: { plugins: [{ calendar: { view: "top-down" } }] } } as compat
    switch (true) {
      case inputs.plugin_calendar_limit === 0:
        snippet.config.plugins[0].calendar.range = { from: "registration", to: "current-year" }
        break
      case inputs.plugin_calendar_limit > 0:
        snippet.config.plugins[0].calendar.range = { from: -inputs.plugin_calendar_limit, to: "current-year" }
        break
      case inputs.plugin_calendar_limit < 0: {
        let from = -inputs.plugin_calendar_limit
        try {
          const { data: { created_at: timestamp } } = await requests.rest(requests.api.users.getByUsername, { username: inputs.user })
          from = new Date(timestamp).getFullYear() - inputs.plugin_calendar_limit
        } catch {
          // Ignore
        }
        snippet.config.plugins[0].calendar.range = { from, to: "current-year" }
        config.report.warning("`plugin_calendar_limit` for negative values behavior has changed and may need to be adjusted manually")
        break
      }
    }
    if (inputs.debug_flags.find((f: string) => ["--halloween", "--winter"].includes(f))) {
      snippet.config.plugins[0].calendar.colors = inputs.debug_flags.find((f: string) => ["--halloween", "--winter"].includes(f)).replace("--", "")
      options.push("debug_flags")
    }
    config.patch(options, snippet)
  }

  // 🎫 Gists
  if (inputs.plugin_gists) {
    const options = ["plugin_gists"]
    const snippet = { config: { plugins: [{ gists: {} }] } } as compat
    config.patch(options, snippet)
  }

  // 👨‍💻 Lines of code changed lines


  // 🗼 Rss feed
  if (inputs.plugin_rss) {
    const options = ["plugin_rss", "plugin_rss_source"]
    const snippet = { config: { plugins: [{ rss: {} }] } } as compat
    snippet.config.plugins[0].rss.feed = inputs.plugin_rss_source
    if (typeof inputs.plugin_rss_limit === "number") {
      snippet.config.plugins[0].rss.limit = (inputs.plugin_rss_limit > 0) ? inputs.plugin_rss_limit : null
      options.push("plugin_rss_limit")
    }
    config.patch(options, snippet)
  }

  // 📸 Website screenshot
  if (inputs.plugin_screenshot) {
    const options = ["plugin_screenshot", "plugin_screenshot_url"]
    const snippet = { config: { plugins: [{ webscraping: {} }] } } as compat
    snippet.config.plugins[0].webscraping.url = inputs.plugin_screenshot_url
    if (inputs.plugin_screenshot_selector) {
      snippet.config.plugins[0].webscraping.select = inputs.plugin_screenshot_selector
      options.push("plugin_screenshot_selector")
    }
    if (inputs.plugin_screenshot_mode) {
      snippet.config.plugins[0].webscraping.mode = inputs.plugin_screenshot_mode
      options.push("plugin_screenshot_mode")
    }
    if (inputs.plugin_screenshot_viewport) {
      snippet.config.plugins[0].webscraping.viewport = inputs.plugin_screenshot_viewport
      options.push("plugin_screenshot_viewport_width", "plugin_screenshot_viewport_height")
    }
    if (inputs.plugin_screenshot_wait) {
      snippet.config.plugins[0].webscraping.wait = inputs.plugin_screenshot_wait
      options.push("plugin_screenshot_wait")
    }
    if (inputs.plugin_screenshot_background === false) {
      snippet.config.plugins[0].webscraping.background = inputs.plugin_screenshot_background
      options.push("plugin_screenshot_background")
    }
    config.patch(options, snippet)
  }

  // -------------------------------------------------------------------------------------

  // 🈷️ Languages activity
  if (inputs.plugin_languages) {
    config.report.unimplemented("`languages` plugin has not been migrated to v4 yet")
    /*
      plugin_languages:
      plugin_languages_ignored:
      plugin_languages_skipped:
      plugin_languages_limit:
      plugin_languages_threshold:
      plugin_languages_other:
      plugin_languages_colors:
      plugin_languages_aliases:
      plugin_languages_sections:
      plugin_languages_details:
      plugin_languages_indepth:
      plugin_languages_indepth_custom:
      plugin_languages_analysis_timeout:
      plugin_languages_analysis_timeout_repositories:
      plugin_languages_categories:
      plugin_languages_recent_categories:
      plugin_languages_recent_load:
      plugin_languages_recent_days:
    */
  }

  // ✨ Stargazers
  if (inputs.plugin_stargazers) {
    config.report.unimplemented("`stargazers` plugin has not been migrated to v4 yet")
    /*
      plugin_stargazers:
      plugin_stargazers_days:
      plugin_stargazers_charts:
      plugin_stargazers_charts_type:
      plugin_stargazers_worldmap:
      plugin_stargazers_worldmap_token:
      plugin_stargazers_worldmap_sample:
    */
  }

  // 📌 Starred topics
  if (inputs.plugin_topics) {
    config.report.unimplemented("`topics` plugin has not been migrated to v4 yet")
    /*
      plugin_topics:
      plugin_topics_mode:
      plugin_topics_sort:
      plugin_topics_limit:
    */
  }

  // 🌟 Recently starred repositories
  if (inputs.plugin_stars) {
    config.report.unimplemented("`stars` plugin has not been migrated to v4 yet")
    /*
      plugin_stars:
      plugin_stars_limit:
    */
  }

  // 📜 Repository licenses
  if (inputs.plugin_licenses) {
    config.report.unimplemented("`licenses` plugin has not been migrated to v4 yet")
    /*
      plugin_licenses:
      plugin_licenses_setup:
      plugin_licenses_ratio:
      plugin_licenses_legal:
    */
  }

  // 💡 Coding habits and activity
  if (inputs.plugin_habits) {
    config.report.unimplemented("`habits` plugin has not been migrated to v4 yet")
    /*
      plugin_habits:
      plugin_habits_from:
      plugin_habits_skipped:
      plugin_habits_days:
      plugin_habits_facts:
      plugin_habits_charts:
      plugin_habits_charts_type:
      plugin_habits_trim:
      plugin_habits_languages_limit:
      plugin_habits_languages_threshold:
    */
  }

  // 🏅 Repository contributors
  if (inputs.plugin_contributors) {
    config.report.unimplemented("`contributors` plugin has not been migrated to v4 yet")
    /*
      plugin_contributors:
      plugin_contributors_base:
      plugin_contributors_head:
      plugin_contributors_ignored:
      plugin_contributors_contributions:
      plugin_contributors_sections:
      plugin_contributors_categories:
    */
  }

  // 🎟️ Follow-up of issues and pull requests
  if (inputs.plugin_followup) {
    config.report.unimplemented("`followup` plugin has not been migrated to v4 yet")
    /*
      plugin_followup:
      plugin_followup_sections:
      plugin_followup_indepth:
      plugin_followup_archived:
    */
  }

  // 🎭 Comment reactions
  if (inputs.plugin_reactions) {
    config.report.unimplemented("`reactions` plugin has not been migrated to v4 yet")
    /*
      plugin_reactions:
      plugin_reactions_limit:
      plugin_reactions_limit_issues:
      plugin_reactions_limit_discussions:
      plugin_reactions_limit_discussions_comments:
      plugin_reactions_days:
      plugin_reactions_display:
      plugin_reactions_details:
      plugin_reactions_ignored:
    */
  }

  // 🧑‍🤝‍🧑 People
  if (inputs.plugin_people) {
    config.report.unimplemented("`people` plugin has not been migrated to v4 yet")
    /*
      plugin_people:
      plugin_people_limit:
      plugin_people_identicons:
      plugin_people_identicons_hide:
      plugin_people_size:
      plugin_people_types:
      plugin_people_thanks:
      plugin_people_sponsors_custom:
      plugin_people_shuffle:
    */
  }

  // 💝 GitHub Sponsorships
  if (inputs.plugin_sponsorships) {
    config.report.unimplemented("`sponsorships` plugin has not been migrated to v4 yet")
    /*
      plugin_sponsorships:
      plugin_sponsorships_sections:
      plugin_sponsorships_size:
    */
  }

  // 💕 GitHub Sponsors
  if (inputs.plugin_sponsors) {
    config.report.unimplemented("`sponsors` plugin has not been migrated to v4 yet")
    /*
      plugin_sponsors:
      plugin_sponsors_sections:
      plugin_sponsors_past:
      plugin_sponsors_size:
      plugin_sponsors_title:
    */
  }

  // 📓 Featured repositories
  if (inputs.plugin_repositories) {
    config.report.unimplemented("`repositories` plugin has not been migrated to v4 yet")
    /*
      plugin_repositories:
      plugin_repositories_featured:
      plugin_repositories_pinned:
      plugin_repositories_starred:
      plugin_repositories_random:
      plugin_repositories_order:
      plugin_repositories_forks:
      plugin_repositories_affiliations:
    */
  }

  // 💬 Discussions
  if (inputs.plugin_discussions) {
    config.report.unimplemented("`discussions` plugin has not been migrated to v4 yet")
    /*
      plugin_discussions:
      plugin_discussions_categories:
      plugin_discussions_categories_limit:
    */
  }

  // 💫 Star lists
  if (inputs.plugin_starlists) {
    config.report.unimplemented("`starlists` plugin has not been migrated to v4 yet")
    /*
      plugin_starlists:
      plugin_starlists_limit:
      plugin_starlists_limit_repositories:
      plugin_starlists_languages:
      plugin_starlists_limit_languages:
      plugin_starlists_languages_ignored:
      plugin_starlists_languages_aliases:
      plugin_starlists_shuffle_repositories:
      plugin_starlists_ignored:
      plugin_starlists_only:
    */
  }

  // 🏆 Achievements achievements
  if (inputs.plugin_achievements) {
    config.report.unimplemented("`achievements` plugin has not been migrated to v4 yet")
    /*
      plugin_achievements:
      plugin_achievements_threshold:
      plugin_achievements_secrets:
      plugin_achievements_display:
      plugin_achievements_limit:
      plugin_achievements_ignored:
      plugin_achievements_only:
    */
  }

  // 🎩 Notable contributions notable
  if (inputs.plugin_notable) {
    config.report.unimplemented("`notable` plugin has not been migrated to v4 yet")
    /*
      plugin_notable:
      plugin_notable_filter:
      plugin_notable_skipped:
      plugin_notable_from:
      plugin_notable_repositories:
      plugin_notable_indepth:
      plugin_notable_types:
      plugin_notable_self:
    */
  }

  // 📰 Recent activity
  if (inputs.plugin_activity) {
    config.report.unimplemented("`activity` plugin has not been migrated to v4 yet")
    /*
      plugin_activity:
      plugin_activity_limit:
      plugin_activity_load:
      plugin_activity_days:
      plugin_activity_visibility:
      plugin_activity_timestamps:
      plugin_activity_skipped:
      plugin_activity_ignored:
      plugin_activity_filter:
    */
  }

  // 🧮 Repositories traffic
  if (inputs.plugin_traffic) {
    config.report.unimplemented("`traffic` plugin has not been migrated to v4 yet")
    /*
      plugin_traffic:
      plugin_traffic_skipped:
    */
  }

  // ♐ Random code snippet
  if (inputs.plugin_code) {
    config.report.unimplemented("`code` plugin has not been migrated to v4 yet")
    /*
      plugin_code:
      plugin_code_lines:
      plugin_code_load:
      plugin_code_days:
      plugin_code_visibility:
      plugin_code_skipped:
      plugin_code_languages:
    */
  }

  // 🗂️ GitHub projects
  if (inputs.plugin_projects) {
    config.report.unimplemented("`projects` plugin has not been migrated to v4 yet")
    /*
      plugin_projects:
      plugin_projects_limit:
      plugin_projects_repositories:
      plugin_projects_descriptions:
    */
  }

  // 🌇 GitHub Skyline
  if (inputs.plugin_skyline) {
    config.report.unimplemented("`skyline` plugin has not been migrated to v4 yet")
    /*
      plugin_skyline:
      plugin_skyline_year:
      plugin_skyline_frames:
      plugin_skyline_quality:
      plugin_skyline_compatibility:
      plugin_skyline_settings:
    */
  }

  // ⏱️ Google PageSpeed
  if (inputs.plugin_pagespeed) {
    config.report.unimplemented("`pagespeed` plugin has not been migrated to v4 yet")
    /*
      plugin_pagespeed:
      plugin_pagespeed_token:
      plugin_pagespeed_url:
      plugin_pagespeed_detailed:
      plugin_pagespeed_screenshot:
      plugin_pagespeed_pwa:
    */
  }

  // 🌸 Anilist watch list and reading list
  if (inputs.plugin_anilist) {
    config.report.unimplemented("`anilist` plugin has not been migrated to v4 yet")
    /*
      plugin_anilist:
      plugin_anilist_user:
      plugin_anilist_medias:
      plugin_anilist_sections:
      plugin_anilist_limit:
      plugin_anilist_limit_characters:
      plugin_anilist_shuffle:
    */
  }

  // 🗨️ Stack Overflow
  if (inputs.plugin_stackoverflow) {
    config.report.unimplemented("`stackoverflow` plugin has not been migrated to v4 yet")
    /*
      plugin_stackoverflow:
      plugin_stackoverflow_user:
      plugin_stackoverflow_sections:
      plugin_stackoverflow_limit:
      plugin_stackoverflow_lines:
      plugin_stackoverflow_lines_snippet:
    */
  }

  // 🎼 Music activity and suggestions
  if (inputs.plugin_music) {
    config.report.unimplemented("`music` plugin has not been migrated to v4 yet")
    /*
      plugin_music:
      plugin_music_provider:
      plugin_music_token:
      plugin_music_user:
      plugin_music_mode:
      plugin_music_playlist:
      plugin_music_limit:
      plugin_music_played_at:
      plugin_music_time_range:
      plugin_music_top_type:
    */
  }

  // ✒️ Recent posts
  if (inputs.plugin_posts) {
    config.report.unimplemented("`posts` plugin has not been migrated to v4 yet")
    /*
      plugin_posts:
      plugin_posts_source:
      plugin_posts_user:
      plugin_posts_descriptions:
      plugin_posts_covers:
      plugin_posts_limit:
    */
  }

  // ⏰ WakaTime
  if (inputs.plugin_wakatime) {
    config.report.unimplemented("`wakatime` plugin has not been migrated to v4 yet")
    /*
      plugin_wakatime:
      plugin_wakatime_token:
      plugin_wakatime_url:
      plugin_wakatime_user:
      plugin_wakatime_sections:
      plugin_wakatime_days:
      plugin_wakatime_limit:
      plugin_wakatime_languages_other:
      plugin_wakatime_languages_ignored:
      plugin_wakatime_repositories_visibility:
    */
  }

  // 🗳️ Leetcode
  if (inputs.plugin_leetcode) {
    config.report.unimplemented("`leetcode` plugin has not been migrated to v4 yet")
    /*
      plugin_leetcode:
      plugin_leetcode_user:
      plugin_leetcode_sections:
      plugin_leetcode_limit_skills:
      plugin_leetcode_ignored_skills:
      plugin_leetcode_limit_recent:
    */
  }

  // 🕹️ Steam
  if (inputs.plugin_steam) {
    config.report.unimplemented("`steam` plugin has not been migrated to v4 yet")
    /*
      plugin_steam:
      plugin_steam_token:
      plugin_steam_sections:
      plugin_steam_user:
      plugin_steam_games_ignored:
      plugin_steam_games_limit:
      plugin_steam_recent_games_limit:
      plugin_steam_achievements_limit:
      plugin_steam_playtime_threshold:
    */
  }

  // 🧠 16personalities
  if (inputs.plugin_16personalities) {
    config.report.unimplemented("`16personalities` plugin has not been migrated to v4 yet")
    /*
      plugin_16personalities:
      plugin_16personalities_url:
      plugin_16personalities_sections:
      plugin_16personalities_scores:
    */
  }

  // ♟️ Chess
  if (inputs.plugin_chess) {
    config.report.unimplemented("`chess` plugin has not been migrated to v4 yet")
    /*
      plugin_chess:
      plugin_chess_token:
      plugin_chess_user:
      plugin_chess_platform:
      plugin_chess_animation:
    */
  }

  // 🥠 Fortune
  if (inputs.plugin_fortune) {
    config.report.unimplemented("`fortune` plugin has not been migrated to v4 yet")
    /*
      plugin_fortune:
      plugin_fortune_url:
      plugin_fortune_sections:
    */
  }

  // 🦑 Splatoon splatoon
  if (inputs.plugin_splatoon) {
    config.report.unimplemented("`splatoon` plugin has not been migrated to v4 yet")
    /*
      plugin_splatoon:
      plugin_splatoon_token:
      plugin_splatoon_sections:
      plugin_splatoon_versus_limit:
      plugin_splatoon_salmon_limit:
      plugin_splatoon_statink:
      plugin_splatoon_statink_token:
      plugin_splatoon_source:
    */
  }

  // 💹 Stock prices stock
  if (inputs.plugin_stock) {
    config.report.unimplemented("`stock` plugin has not been migrated to v4 yet")
    /*
      plugin_stock:
      plugin_stock_token:
      plugin_stock_symbol:
      plugin_stock_duration:
      plugin_stock_interval:
    */
  }

  // 🎲 Community plugins
  // TODO(@lowlighter): use @legacy for community plugins

  // 🐤 Latest tweets
  if (inputs.plugin_tweets) {
    config.patch("plugin_tweets", null)
  }

  // 💭 GitHub Community Support
  if (inputs.plugin_support) {
    config.patch("plugin_support", null)
  }

  // 🎁 Extras ==========================================================================================

  // Plugins order
  if (inputs.config_order) {
    // TODO(@lowlighter): fetch order from partial
    config.patch("config_order", null)
    config.report.info("Plugins order are now handled directly at configuration level")
  }

  // Extras css and js
  if ((inputs.extras_css) || (inputs.extras_js)) {
    const options = []
    const snippet = { config: { plugins: [{ processors: [] }] } } as compat
    for (const { type, arg } of [{ type: "css", arg: "style" }, { type: "js", arg: "script" }]) {
      snippet.config.plugins[0].processors.push({ [`inject.${arg}`]: { [arg]: inputs[`extras_${type}`] } })
      options.push(`extras_${type}`)
    }
    config.patch(options, snippet)
  }

  // Emojis and icons
  if ((inputs.config_twemoji) || (inputs.config_gemoji) || (inputs.config_octicon)) {
    const options = []
    const snippet = { config: { plugins: [{ processors: [] }] } } as compat
    for (const type of ["twemoji", "gemoji", "octicon"]) {
      snippet.config.plugins[0].processors.push({ [`render.${type}s`]: {} })
      options.push(`config_${type}`)
    }
    config.patch(options, snippet)
  }

  // Base64 images
  if (inputs.config_base64) {
    const snippet = { config: { plugins: [{ processors: [{ "transform.base64": { } }] }] } }
    config.patch("config_base64", snippet)
  }

  // Optimizations
  if (inputs.optimize?.length) {
    const snippet = { config: { plugins: [{ processors: [] }] } } as compat
    for (const type of ["css", "svg", 'xml']) {
      if (inputs.optimize.includes(type)) {
        snippet.config.plugins[0].processors.push({ [`optimize.${type}`]: {} })
      }
    }
    config.patch("optimize", snippet)
  }

  // 🧶 Output ==========================================================================================

  // Output format
  if (inputs.config_output) {
    const snippet =  {config:{plugins:[{processors:[{render:{format:inputs.config_output}}]}]}}
    if (inputs.config_output === "auto") {
      snippet.config.plugins[0].processors[0].render.format = "svg"
      config.report.warning("Output format `auto` has been removed. Render format has been set to `svg` for compatibility")
    }
    if (["markdown", "markdown-pdf", "insights"].includes(inputs.config_output)) {
      //TODO(@lowlighter): implement
      config.report.unimplemented(`Rendering to \`${inputs.config_output}\` has not been migrated to v4 yet`)
    }
    config.patch("config_output", snippet)
  }

  // Output action
  if (inputs.output_action) {
    const options = ["output_action"]
    let snippet = {} as compat
    const filepath = inputs.filename
    switch (true) {
      // Commit
      case inputs.output_action === "commit":{
        snippet = { config: { plugins: [{ processors: [{ "publish.git": { commit:{filepath} } }] }] } }
        if (inputs.committer_message) {
          let message = inputs.committer_message
          if (message.includes("${filename}")) {
            message = message.replace("${filename}", "${file}")
            config.report.warning("The use of `${filename}` in `committer_message` has been changed to `${file}`")
          }
          snippet.config.plugins[0].processors[0]["publish.git"].commit.message = message
          options.push("committer_message")
        }
        if (inputs.committer_branch) {
          snippet.config.plugins[0].processors[0]["publish.git"].commit.branch = inputs.committer_branch
          options.push("committer_branch")
        }
        break
      }
      // Gist
      case inputs.output_action === "gist":{
        snippet = { config: { plugins: [{ processors: [{ "publish.gist": {gist: inputs.committer_gist, filepath} }] }] } }
        options.push("committer_gist")
        break
      }
      // Pull request
      case inputs.output_action.startsWith("pull-request"):{
        let github = {} as compat
        await import("y/@actions/github@6.0.0?pin=v133").then(imported => github = imported.default).catch(() => null)
        snippet = { config: { plugins: [{ processors: [{ "publish.git": { pullrequest: {
          title :"Auto-generated metrics for run #${run}" ,
          message: " ",
          checks :{attempts:240, delay:15},
          from:`metrics-run-${github.context?.runId}`,
          filepath} } }] }] } }
        if (inputs.committer_branch) {
          snippet.config.plugins[0].processors[0]["publish.git"].pullrequest.to = inputs.committer_branch
          options.push("committer_branch")
        }
        else {
          snippet.config.plugins[0].processors[0]["publish.git"].pullrequest.to = github.context?.ref.replace(/^refs[/]heads[/]/, "")
          config.report.warning("Pull request target branch is not inferred anymore and should now be set manually")
        }
        const merge = inputs.output_action.replace("pull-request-", "")
        if (merge) {
          snippet.config.plugins[0].processors[0]["publish.git"].pullrequest.merge = {merge:"commit"}[merge as string] ?? merge
        }
        break
      }
      // None
      case inputs.output_action === "none":{
        snippet = {config:{plugins:[{processors:[{"publish.file":{filepath:`/metrics_renders/${filepath}`}}]}]}}
        config.report.warning("Generated renders are not saved to `/metrics_renders` by default anymore (use `processors/publish.file` instead)")
        break
      }
    }

    // Committer token
    if (inputs.committer_token) {
      snippet.config.plugins[0].token = inputs.committer_token
      options.push("committer_token")
    }

    // Retries configuration
    if ((inputs.retries_output_action)||(inputs.retries_delay_output_action)) {
      snippet.config.plugins[0].retries = {attempts:inputs.retries_output_action, delay:inputs.retries_delay_output_action}
      options.push("retries_output_action", "retries_delay_output_action")
    }

    config.patch("output_action", snippet)
    config.report.info("Output action should now be set at preset or plugin level")
  }

  // Print to console
  if (inputs.debug_print) {
    const snippet = { config: { plugins: [{ processors: [{ "publish.console": { } }] }] } }
    config.patch("debug_print", snippet)
  }

  // Delay
  if (inputs.delay) {
    const snippet = { config: { plugins: [{ processors: [{ "control.delay": { duration: inputs.delay } }] }] } }
    config.patch("delay", snippet)
  }

  // ❔ Conditionals =====================================================================================

  // Run conditions
  if ((inputs.quota_required_rest) || (inputs.quota_required_graphql) || (inputs.quota_required_search)) {
    config.report.unimplemented("`quota_required_*` has not been migrated to v4 yet")
  }

  // Output condition
  if (inputs.output_condition) {
    //output_condition
    config.report.unimplemented("`output_condition` has not been migrated to v4 yet")
  }

  // ☁️ GitHub action level options ======================================================================

  // Updates
  if (inputs.notice_releases) {
    config.patch("notice_releases", {check_updates:true})
  }

  // Docker image
  if (inputs.use_prebuilt_image === false) {
    config.patch("use_prebuilt_image", null)
    config.report.info("To use a prebuilt image, pass a remote url to `docker_image`. To build and use a local image, pass a local path to `docker_image` instead")
  }

  // Print report and config
  if (config.patched) {
    config.report.warning("Your configuration has been patched to be compatible with v4. Note however that the final result may differ from previous versions, please review the following changes:")
  }
  config.report.console()
  console.log(yaml(config.content))
  return config
}

if (import.meta.main) {
  await compat({
    token: "github_pat_xxxx",
    user: "lowlighter",
    repo: "metrics",
    github_api_rest: "https://api.github.com",
    plugin_introduction: "yes",
    plugin_introduction_title: "no",
    plugin_isocalendar: "yes",
    plugin_isocalendar_duration: "full-year",
    debug_flags: "--halloween",
    plugin_calendar: "yes",
    plugin_calendar_limit: "-1",
    plugin_gists: "yes",
    plugin_rss: "yes",
    plugin_rss_source: "https://news.ycombinator.com/rss",
    plugin_rss_limit: "0",
    plugin_screenshot: "yes",
    plugin_screenshot_url: "https://example.com",
    plugin_screenshot_selector: "body",
    plugin_screenshot_mode: "image",
    plugin_screenshot_viewport: '{ "width": 1280, "height": 1280 }',
    plugin_screenshot_wait: "100",
    plugin_screenshot_background: "no",
    plugin_support: "yes",
    extras_css: "body { background: red }",
    extras_js: "console.log('hello world')",
    debug: "yes",
    verify: "yes",
    dryrun: "yes",
    experimental_features: "test",
    config_timezone: "Europe/Paris",
    config_twemoji: "yes",
    config_gemoji: "yes",
    config_octicon: "yes",
    config_presets: "@lunar-red",
    config_order: "introduction, isocalendar, calendar, gists, rss, webscraping, support",
    config_display: "large",
    config_animations: "yes",
    config_padding: "5%, 10%",
    delay: "5",
    plugin_languages_ignored:""
  })
}

/*
  TO MIGRATE:


  plugin_lines:
  plugin_lines_skipped:
  plugin_lines_sections:
  plugin_lines_repositories_limit:
  plugin_lines_history_limit:
  plugin_lines_delay:

*/


