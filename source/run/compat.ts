// Imports
//import { env } from "@engine/utils/io.ts"
import * as YAML from "std/yaml/mod.ts"
import { bgWhite, black, brightGreen, brightRed, brightYellow, cyan, gray, white, yellow } from "std/fmt/colors.ts"
import { deepMerge } from "std/collections/deep_merge.ts"

/** Compatibility type */
// deno-lint-ignore no-explicit-any
type compat = any

/** Compatibility report */
class Report {
  /** Messages */
  readonly messages = [] as Array<{ type: string; message: string }>

  /** Register error message */
  error(message: string) {
    this.messages.push({ type: "error", message })
  }

  /** Register warning message */
  warning(message: string) {
    this.messages.push({ type: "warning", message })
  }

  /** Register info message */
  info(message: string) {
    this.messages.push({ type: "info", message })
  }

  /** Print messages to console */
  console() {
    for (const { type, message } of this.messages) {
      const icon = { error: "❌", warning: "⚠️", info: "💡" }[type]
      const text = `${icon} ${message}`
        .replaceAll(/^```\w*([\s\S]+?)```/gm, (_, text: string) => text.split("\n").map((line) => `   ${line}`).join("\n"))
        .replaceAll(/`([\s\S]+?)`/g, (_, text) => bgWhite(` ${black(text)} `))
        .split("\n").map((line) => `▓ ${line}`).join("\n")
      const color = { error: brightRed, warning: brightYellow, info: brightGreen }[type]!
      console.log(color(text))
    }
  }

  /** Print messages to markdown */
  markdown() {
    return ""
  }
}

/** Compatibility config */
class Config {
  /** Config content */
  readonly content = {} as Record<PropertyKey, unknown>

  /** Report */
  readonly report = new Report()

  /** Patch config */
  patch(inputs: string | string[], snippet: Record<PropertyKey, unknown> | null) {
    if (snippet) {
      this.report.warning(
        `${
          Array.isArray(inputs) ? `\`${[inputs.slice(0, -1).join(", "), inputs.slice(-1)].join(" and ")}\` are` : `\`${inputs}\` is`
        } deprecated, use the following configuration snippet instead:\n\`\`\`yaml\n${yaml(snippet)}\`\`\``,
      )
      Object.assign(this.content, deepMerge(this.content, snippet, { arrays: "merge" }))
    } else {
      this.report.error(`${Array.isArray(inputs) ? `\`${[inputs.slice(0, -1).join(", "), inputs.slice(-1)].join(" and ")}\` have` : `\`${inputs}\` has`} been removed`)
    }
  }

  /** Print config */
  print() {
    console.log(yaml(this.content))
  }
}

/** Compatibility layer */
export async function compat(inputs: compat) {
  const config = new Config()

  const { Requests } = await import("@engine/components/requests.ts")
  const requests = new Requests(import.meta, { logs: "none", mock: false, api: "https://api.github.com", timezone: "Europe/Paris", token: { read: () => inputs.token } } as compat)
  //api

  // 🗝️ Token
  if (inputs.token) {
    const snippet = { config: { presets: { default: { plugins: { token: inputs.token } } } } }
    config.patch("token", snippet)
    config.report.info("Token should now be set at preset or plugin level")
    if (!inputs.token.startsWith("github_pat_")) {
      config.report.info("Metrics now supports supports fine-grained personal access tokens and recommends to use them")
    }
  }

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

  if ((inputs.github_api_rest) || (inputs.github_api_graphql)) {
    if (inputs.github_api_rest !== inputs.github_api_graphql) {
      config.report.error("GitHub API REST and GraphQL endpoints cannot be different anymore")
    }
    const snippet = { config: { presets: { default: { plugins: { api: inputs.github_api_rest || inputs.github_api_graphql } } } } }
    config.patch(["github_api_rest", "github_api_graphql"], snippet)
    config.report.info("GitHub API endpoints should now be set at preset or plugin level")
  }

  // 🧩 Plugins =========================================================================================

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

  // 💭 GitHub Community Support
  if (inputs.plugin_support) {
    config.patch("plugin_support", null)
  }

  // ⚙️ Config ==========================================================================================

  if (inputs.config_timezone) {
    const snippet = { config: { presets: { default: { plugins: { timezone: inputs.config_timezone } } } } }
    config.patch("config_timezone", snippet)
    config.report.info("Timezone should now be set at preset or plugin level")
  }

  if ((inputs.config_twemoji) || (inputs.config_gemoji) || (inputs.config_octicon)) {
    const options = []
    const snippet = { config: { plugins: [{ processors: [] }] } } as compat
    for (const type of ["twemoji", "gemoji", "octicon"]) {
      snippet.config.plugins[0].processors.push({ [`render.${type}s`]: {} })
      options.push(`config_${type}`)
    }
    config.patch(options, snippet)
  }

  if (inputs.config_presets) {
    config.patch("config_presets", null)
    config.report.info("Presets are now handled directly at configuration level")
    // TODO(@lowlighter): Should it be backwards compatible?
  }

  if (inputs.config_order) {
    // TODO(@lowlighter): fetch order from partial
    config.patch("config_order", null)
    config.report.info("Plugins order are now handled directly at configuration level")
  }

  if ((inputs.config_display) || (inputs.config_animations === false) || (inputs.config_padding)) {
    const options = []
    for (const key of ["config_display", "config_animations", "config_padding"]) {
      if (inputs[key]) {
        options.push(key)
      }
    }
    config.patch(options, null)
    config.report.warning("")
  }

  //config_output
  //config_base64

  // 🎁 Extras ==========================================================================================

  if ((inputs.extras_css) || (inputs.extras_js)) {
    const options = []
    const snippet = { config: { plugins: [{ processors: [] }] } } as compat
    for (const { type, arg } of [{ type: "css", arg: "style" }, { type: "js", arg: "script" }]) {
      snippet.config.plugins[0].processors.push({ [`inject.${arg}`]: { [arg]: inputs[`extras_${type}`] } })
      options.push(`extras_${type}`)
    }
    config.patch(options, snippet)
  }

  if (inputs.delay) {
    const snippet = { config: { plugins: [{ processors: [{ "control.delay": { duration: inputs.delay } }] }] } }
    config.patch("delay", snippet)
  }

  if (inputs.debug) {
    const snippet = { config: { presets: { default: { plugins: { logs: "debug" }, processors: { logs: "debug" } } } } }
    config.patch("debug", snippet)
    config.report.info("Logs level can now be set at preset or plugin level, and supports different levels of logging")
  }

  if (inputs.verify) {
    config.patch("verify", null)
  }
  if (inputs.debug_flags) {
    config.patch("debug_flags", null)
  }
  if (inputs.dryrun) {
    config.patch("dryrun", null)
    config.report.warning("While dryrun mode has been removed, the same behavior can be achieved by not using the `render` processor")
  }
  if (inputs.experimental_features) {
    config.patch("experimental_features", null)
  }

  /*
  committer_token:
  committer_branch:
  committer_message:
  committer_gist:
  filename:
  markdown:
  markdown_cache:
  output_action:
  output_condition:
  optimize:
  setup_community_templates:
  template:
  query:
  retries:
  retries_delay:
  retries_output_action:
  retries_delay_output_action:
  clean_workflows:
  quota_required_rest:
  quota_required_graphql:
  quota_required_search:
  notice_releases:
  use_prebuilt_image:
  plugins_errors_fatal:
  debug_print:
  use_mocked_data:
  */

  config.report.console()
  config.print()

  return config
}

if (import.meta.main) {
  await compat({
    token: "github_pat_xxxx",
    user: "lowlighter",
    repo: "metrics",
    github_api_rest: "https://api.github.com",
    plugin_introduction: true,
    plugin_introduction_title: false,
    plugin_isocalendar: true,
    plugin_isocalendar_duration: "full-year",
    debug_flags: ["--halloween"],
    plugin_calendar: true,
    plugin_calendar_limit: -1,
    plugin_gists: true,
    plugin_rss: true,
    plugin_rss_source: "https://news.ycombinator.com/rss",
    plugin_rss_limit: 0,
    plugin_screenshot: true,
    plugin_screenshot_url: "https://example.com",
    plugin_screenshot_selector: "body",
    plugin_screenshot_mode: "image",
    plugin_screenshot_viewport: { width: 1280, height: 1280 },
    plugin_screenshot_wait: 100,
    plugin_screenshot_background: false,
    plugin_support: true,
    extras_css: "body { background: red }",
    extras_js: "console.log('hello world')",
    debug: true,
    verify: true,
    dryrun: true,
    experimental_features: ["test"],
    config_timezone: "Europe/Paris",
    config_twemoji: true,
    config_gemoji: true,
    config_octicon: true,
    config_presets: "@lunar-red",
    config_order: ["introduction", "isocalendar", "calendar", "gists", "rss", "webscraping", "support"],
    config_display: "large",
    config_animations: true,
    config_padding: ["5%", "10%"],
    delay: 5,
  })
}

/*
  base:
  base_indepth:
  base_hireable:
  base_skip:
  repositories:
  repositories_batch:
  repositories_forks:
  repositories_affiliations:
  repositories_skipped:
  users_ignored:
  commits_authoring:
  plugin_isocalendar:
  plugin_isocalendar_duration:
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
  plugin_stargazers:
  plugin_stargazers_days:
  plugin_stargazers_charts:
  plugin_stargazers_charts_type:
  plugin_stargazers_worldmap:
  plugin_stargazers_worldmap_token:
  plugin_stargazers_worldmap_sample:
  plugin_lines:
  plugin_lines_skipped:
  plugin_lines_sections:
  plugin_lines_repositories_limit:
  plugin_lines_history_limit:
  plugin_lines_delay:
  plugin_topics:
  plugin_topics_mode:
  plugin_topics_sort:
  plugin_topics_limit:
  plugin_stars:
  plugin_stars_limit:
  plugin_licenses:
  plugin_licenses_setup:
  plugin_licenses_ratio:
  plugin_licenses_legal:
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
  plugin_contributors:
  plugin_contributors_base:
  plugin_contributors_head:
  plugin_contributors_ignored:
  plugin_contributors_contributions:
  plugin_contributors_sections:
  plugin_contributors_categories:
  plugin_followup:
  plugin_followup_sections:
  plugin_followup_indepth:
  plugin_followup_archived:
  plugin_reactions:
  plugin_reactions_limit:
  plugin_reactions_limit_issues:
  plugin_reactions_limit_discussions:
  plugin_reactions_limit_discussions_comments:
  plugin_reactions_days:
  plugin_reactions_display:
  plugin_reactions_details:
  plugin_reactions_ignored:
  plugin_people:
  plugin_people_limit:
  plugin_people_identicons:
  plugin_people_identicons_hide:
  plugin_people_size:
  plugin_people_types:
  plugin_people_thanks:
  plugin_people_sponsors_custom:
  plugin_people_shuffle:
  plugin_sponsorships:
  plugin_sponsorships_sections:
  plugin_sponsorships_size:
  plugin_sponsors:
  plugin_sponsors_sections:
  plugin_sponsors_past:
  plugin_sponsors_size:
  plugin_sponsors_title:
  plugin_repositories:
  plugin_repositories_featured:
  plugin_repositories_pinned:
  plugin_repositories_starred:
  plugin_repositories_random:
  plugin_repositories_order:
  plugin_repositories_forks:
  plugin_repositories_affiliations:
  plugin_discussions:
  plugin_discussions_categories:
  plugin_discussions_categories_limit:
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
  plugin_calendar:
  plugin_calendar_limit:
  plugin_achievements:
  plugin_achievements_threshold:
  plugin_achievements_secrets:
  plugin_achievements_display:
  plugin_achievements_limit:
  plugin_achievements_ignored:
  plugin_achievements_only:
  plugin_notable:
  plugin_notable_filter:
  plugin_notable_skipped:
  plugin_notable_from:
  plugin_notable_repositories:
  plugin_notable_indepth:
  plugin_notable_types:
  plugin_notable_self:
  plugin_activity:
  plugin_activity_limit:
  plugin_activity_load:
  plugin_activity_days:
  plugin_activity_visibility:
  plugin_activity_timestamps:
  plugin_activity_skipped:
  plugin_activity_ignored:
  plugin_activity_filter:
  plugin_traffic:
  plugin_traffic_skipped:
  plugin_code:
  plugin_code_lines:
  plugin_code_load:
  plugin_code_days:
  plugin_code_visibility:
  plugin_code_skipped:
  plugin_code_languages:
  plugin_gists:
  plugin_projects:
  plugin_projects_limit:
  plugin_projects_repositories:
  plugin_projects_descriptions:
  plugin_introduction:
  plugin_introduction_title:
  plugin_skyline:
  plugin_skyline_year:
  plugin_skyline_frames:
  plugin_skyline_quality:
  plugin_skyline_compatibility:
  plugin_skyline_settings:
  plugin_support:
  plugin_pagespeed:
  plugin_pagespeed_token:
  plugin_pagespeed_url:
  plugin_pagespeed_detailed:
  plugin_pagespeed_screenshot:
  plugin_pagespeed_pwa:
  plugin_tweets:
  plugin_tweets_token:
  plugin_tweets_user:
  plugin_tweets_attachments:
  plugin_tweets_limit:
  plugin_stackoverflow:
  plugin_stackoverflow_user:
  plugin_stackoverflow_sections:
  plugin_stackoverflow_limit:
  plugin_stackoverflow_lines:
  plugin_stackoverflow_lines_snippet:
  plugin_anilist:
  plugin_anilist_user:
  plugin_anilist_medias:
  plugin_anilist_sections:
  plugin_anilist_limit:
  plugin_anilist_limit_characters:
  plugin_anilist_shuffle:
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
  plugin_posts:
  plugin_posts_source:
  plugin_posts_user:
  plugin_posts_descriptions:
  plugin_posts_covers:
  plugin_posts_limit:
  plugin_rss:
  plugin_rss_source:
  plugin_rss_limit:
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
  plugin_leetcode:
  plugin_leetcode_user:
  plugin_leetcode_sections:
  plugin_leetcode_limit_skills:
  plugin_leetcode_ignored_skills:
  plugin_leetcode_limit_recent:
  plugin_steam:
  plugin_steam_token:
  plugin_steam_sections:
  plugin_steam_user:
  plugin_steam_games_ignored:
  plugin_steam_games_limit:
  plugin_steam_recent_games_limit:
  plugin_steam_achievements_limit:
  plugin_steam_playtime_threshold:
  plugin_16personalities:
  plugin_16personalities_url:
  plugin_16personalities_sections:
  plugin_16personalities_scores:
  plugin_chess:
  plugin_chess_token:
  plugin_chess_user:
  plugin_chess_platform:
  plugin_chess_animation:
  plugin_fortune:
  plugin_nightscout:
  plugin_nightscout_url:
  plugin_nightscout_datapoints:
  plugin_nightscout_lowalert:
  plugin_nightscout_highalert:
  plugin_nightscout_urgentlowalert:
  plugin_nightscout_urgenthighalert:
  plugin_poopmap:
  plugin_poopmap_token:
  plugin_poopmap_days:
  plugin_screenshot:
  plugin_screenshot_title:
  plugin_screenshot_url:
  plugin_screenshot_selector:
  plugin_screenshot_mode:
  plugin_screenshot_viewport:
  plugin_screenshot_wait:
  plugin_screenshot_background:
  plugin_splatoon:
  plugin_splatoon_token:
  plugin_splatoon_sections:
  plugin_splatoon_versus_limit:
  plugin_splatoon_salmon_limit:
  plugin_splatoon_statink:
  plugin_splatoon_statink_token:
  plugin_splatoon_source:
  plugin_stock:
  plugin_stock_token:
  plugin_stock_symbol:
  plugin_stock_duration:
  plugin_stock_interval:
*/

/** YAML formatter for console */
function yaml(content: Record<string, unknown>) {
  const regex = {
    kv: /^(?<indent>\s*)(?<array>\-\s+)?'?(?<key>\w[.\w-]*)'?(?:(?<kv>:)(?<value>\s.+)?)?$/,
  }
  const lines = []
  for (const line of YAML.stringify(content).split("\n")) {
    if (regex.kv.test(line)) {
      let { indent, array = "", kv, key, value } = line.match(regex.kv)!.groups!
      let color = white
      if (!kv) {
        value = key
      }
      value = value?.trim()
      switch (true) {
        case ["null"].includes(value):
          color = gray
          break
        case ["{}", "[]", "true", "false"].includes(value):
          color = yellow
          break
        case !Number.isNaN(Number(value)):
          color = yellow
          break
        case /^'.+'$/.test(value):
          value = value.replace(/^'|'$/g, "")
          color = yellow
          break
      }
      lines.push(`${indent}${array}${kv ? `${cyan(key)}: ${color(value ?? "")}` : color(value ?? "")}`)
      continue
    }
    lines.push(line)
  }
  return lines.join("\n")
}
