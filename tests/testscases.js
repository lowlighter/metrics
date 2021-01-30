/** Test cases */
  module.exports = function () {
    return [
      ["Base (header)", {
        base:"header",
        base_header:true,
      }],
      ["Base (activity", {
        base:"activity",
        base_activity:true,
      }],
      ["Base (community)", {
        base:"community",
        base_community:true,
      }],
      ["Base (repositories)", {
        base:"repositories",
        base_repositories:true,
      }],
      ["Base (metadata)", {
        base:"metadata",
        base_metadata:true,
      }],
      ["Base (complete)", {
        base:"header, activity, community, repositories, metadata",
        base_header:true,
        base_activity:true,
        base_community:true,
        base_repositories:true,
        base_metadata:true,
      }],
      ["Image output (jpeg)", {
        config_output:"jpeg",
      }],
      ["Image output (png)", {
        config_output:"png",
      }],
      ["Disable animations", {
        config_animations:"no",
      }],
      ["PageSpeed plugin (default)", {
        plugin_pagespeed:true,
      }],
      ["PageSpeed plugin (different url)", {
        plugin_pagespeed:true,
        plugin_pagespeed_url:"github.com",
      }],
      ["PageSpeed plugin (detailed)", {
        plugin_pagespeed:true,
        plugin_pagespeed_detailed:true,
      }],
      ["PageSpeed plugin (screenshot)", {
        plugin_pagespeed:true,
        plugin_pagespeed_screenshot:true,
      }],
      ["PageSpeed plugin (complete)", {
        plugin_pagespeed:true,
        plugin_pagespeed_detailed:true,
        plugin_pagespeed_screenshot:true,
      }],
      ["Isocalendar plugin (default)", {
        plugin_isocalendar: true,
      }, {skip:["terminal", "repository"]}],
      ["Isocalendar plugin (half-year)", {
        plugin_isocalendar: true,
        plugin_isocalendar_duration: "half-year",
      }, {skip:["terminal", "repository"]}],
      ["Isocalendar plugin (full-year)", {
        plugin_isocalendar: true,
        plugin_isocalendar_duration: "full-year",
      }, {skip:["terminal", "repository"]}],
      ["Music plugin (playlist - apple)", {
        plugin_music:true,
        plugin_music_playlist:"https://embed.music.apple.com/fr/playlist/usr-share/pl.u-V9D7m8Etjmjd0D",
      }, {skip:["terminal", "repository"]}],
      ["Music plugin (playlist - spotify)", {
        plugin_music:true,
        plugin_music_playlist:"https://open.spotify.com/embed/playlist/3nfA87oeJw4LFVcUDjRcqi",
      }, {skip:["terminal", "repository"]}],
      ["Music plugin (recent - spotify)", {
        plugin_music:true,
        plugin_music_provider: "spotify",
      }, {skip:["terminal", "repository"]}],
      ["Music plugin (recent - lastfm)", {
        plugin_music:true,
        plugin_music_provider: "lastfm",
        plugin_music_user: "RJ",
      }, {skip:["terminal", "repository"]}],
      ["Language plugin (default)", {
        plugin_languages:true,
      }],
      ["Language plugin (ignored languages)", {
        plugin_languages:true,
        plugin_languages_ignored:"html, css, dockerfile",
      }],
      ["Language plugin (skipped repositories)", {
        plugin_languages:true,
        plugin_languages_skipped:"metrics",
      }],
      ["Language plugin (custom color set)", {
        plugin_languages:true,
        plugin_languages_colors:"0:ff0000,1:red",
      }],
      ["Language plugin (custom color set)", {
        plugin_languages:true,
        plugin_languages_colors:"complementary",
      }],
      ["Language plugin (complete)", {
        plugin_languages:true,
        plugin_languages_ignored:"html, css, dockerfile",
        plugin_languages_skipped:"metrics",
        plugin_languages_colors:"rainbow",
      }],
      ["Follow-up plugin (default)", {
        plugin_followup:true,
      }],
      ["Topics plugin (default)", {
        plugin_topics:true,
      }, {skip:["terminal", "repository"]}],
      ["Topics plugin (starred - starred sort)", {
        plugin_topics:true,
        plugin_topics_mode:"starred",
        plugin_topics_sort:"starred",
      }, {skip:["terminal", "repository"]}],
      ["Topics plugin (starred - activity sort)", {
        plugin_topics:true,
        plugin_topics_mode:"starred",
        plugin_topics_sort:"activity",
      }, {skip:["terminal", "repository"]}],
      ["Topics plugin (starred - stars sort)", {
        plugin_topics:true,
        plugin_topics_mode:"starred",
        plugin_topics_sort:"stars",
      }, {skip:["terminal", "repository"]}],
      ["Topics plugin (starred - random sort)", {
        plugin_topics:true,
        plugin_topics_mode:"starred",
        plugin_topics_sort:"random",
      }, {skip:["terminal", "repository"]}],
      ["Topics plugin (mastered - starred sort)", {
        plugin_topics:true,
        plugin_topics_mode:"mastered",
        plugin_topics_sort:"starred",
      }, {skip:["terminal", "repository"]}],
      ["Topics plugin (mastered - activity sort)", {
        plugin_topics:true,
        plugin_topics_mode:"mastered",
        plugin_topics_sort:"activity",
      }, {skip:["terminal", "repository"]}],
      ["Topics plugin (mastered - stars sort)", {
        plugin_topics:true,
        plugin_topics_mode:"mastered",
        plugin_topics_sort:"stars",
      }, {skip:["terminal", "repository"]}],
      ["Topics plugin (mastered - random sort)", {
        plugin_topics:true,
        plugin_topics_mode:"mastered",
        plugin_topics_sort:"random",
      }, {skip:["terminal", "repository"]}],
      ["Projects plugin (default)", {
        plugin_projects:true,
      }, {skip:["terminal"]}],
      ["Projects plugin (repositories)", {
        plugin_projects:true,
        plugin_projects_repositories:"lowlighter/metrics/projects/1",
        plugin_projects_limit:0,
      }, {skip:["terminal"]}],
      ["Projects plugin (descriptions)", {
        plugin_projects:true,
        plugin_projects_repositories:"lowlighter/metrics/projects/1",
        plugin_projects_limit:0,
        plugin_projects_descriptions:true,
      }, {skip:["terminal"]}],
      ["Lines plugin (default)", {
        base:"repositories",
        plugin_lines:true,
      }],
      ["Traffic plugin (default)", {
        base:"repositories",
        plugin_traffic:true,
      }],
      ["Tweets plugin (default)", {
        plugin_tweets:true,
      }, {skip:["terminal", "repository"]}],
      ["Tweets plugin (different user)", {
        plugin_tweets:true,
        plugin_tweets_user:"twitterdev",
      }, {skip:["terminal", "repository"]}],
      ["Posts plugin (dev.to)", {
        user:"lowlighter",
        plugin_posts:true,
        plugin_posts_source:"dev.to",
      }, {skip:["terminal", "repository"]}],
      ["Habits plugin (default)", {
        plugin_habits:true,
        plugin_habits_from:5,
      }, {skip:["terminal", "repository"]}],
      ["Habits plugin (charts)", {
        plugin_habits:true,
        plugin_habits_from:5,
        plugin_habits_charts:true,
      }, {skip:["terminal", "repository"]}],
      ["Habits plugin (facts)", {
        plugin_habits:true,
        plugin_habits_from:5,
        plugin_habits_facts:true,
      }, {skip:["terminal", "repository"]}],
      ["Habits plugin (complete)", {
        plugin_habits:true,
        plugin_habits_from:5,
        plugin_habits_charts:true,
      }, {skip:["terminal", "repository"]}],
      ["Activity  plugin (default)", {
        plugin_activity:true,
        plugin_activity_limit:100,
        plugin_activity_days:14,
        plugin_activity_filter:"all",
      }, {skip:["terminal", "repository"]}],
      ["Activity  plugin (filtered)", {
        plugin_activity:true,
        plugin_activity_filter:"pr, issue",
      }, {skip:["terminal", "repository"]}],
      ["Stars plugin (default)", {
        plugin_stars:true,
      }, {skip:["terminal", "repository"]}],
      ["Stargazers plugin (default)", {
        plugin_stargazers:true,
      }, {skip:["terminal"]}],
      ["Gists plugin (default)", {
        plugin_gists:true,
      }, {skip:["terminal", "repository"]}],
      ["People plugin (default)", {
        plugin_people:true,
      }, {skip:["terminal", "repository"]}],
      ["People plugin (followers)", {
        plugin_people:true,
        plugin_people_types:"followers",
      }, {skip:["terminal", "repository"]}],
      ["People plugin (following)", {
        plugin_people:true,
        plugin_people_types:"following",
      }, {skip:["terminal", "repository"]}],
      ["People plugin (sponsoring)", {
        plugin_people:true,
        plugin_people_types:"sponsoring",
      }, {skip:["terminal", "repository"]}],
      ["People plugin (sponsors)", {
        plugin_people:true,
        plugin_people_types:"sponsors",
      }, {skip:["terminal"]}],
      ["People plugin (stargazers)", {
        plugin_people:true,
        plugin_people_types:"stargazers",
      }, {skip:["classic", "terminal"]}],
      ["People plugin (watchers)", {
        plugin_people:true,
        plugin_people_types:"watchers",
      }, {skip:["classic", "terminal"]}],
      ["People plugin (thanks)", {
        plugin_people:true,
        plugin_people_types:"thanks",
        plugin_people_thanks:"lowlighter",
      }, {skip:["classic", "terminal"]}],
      ["People plugin (identicons)", {
        plugin_people:true,
        plugin_people_identicons:true,
      }, {skip:["terminal", "repository"]}],
      ["Anilist plugin (default)", {
        plugin_anilist:true,
      }, {skip:["terminal", "repository"]}],
      ["Anilist plugin (manga only)", {
        plugin_anilist:true,
        plugin_anilist_medias:"manga",
      }, {skip:["terminal", "repository"]}],
      ["Anilist plugin (anime only)", {
        plugin_anilist:true,
        plugin_anilist_medias:"anime",
      }, {skip:["terminal", "repository"]}],
      ["Anilist plugin (favorites section)", {
        plugin_anilist:true,
        plugin_anilist_sections:"favorites",
      }, {skip:["terminal", "repository"]}],
      ["Anilist plugin (watching/reading section)", {
        plugin_anilist:true,
        plugin_anilist_sections:"watching, reading",
      }, {skip:["terminal", "repository"]}],
      ["Anilist plugin (characters section)", {
        plugin_anilist:true,
        plugin_anilist_sections:"characters",
      }, {skip:["terminal", "repository"]}],
      ["Anilist plugin (additional options)", {
        plugin_anilist:true,
        plugin_anilist_limit:0,
        plugin_anilist_shuffle:false,
        plugin_anilist_user:"anilist",
      }, {skip:["terminal", "repository"]}],
      ["Anilist plugin (complete)", {
        plugin_anilist:true,
        plugin_anilist_medias:"manga, anime",
        plugin_anilist_sections:"favorites, watching, reading, characters",
        plugin_anilist_limit:0,
        plugin_anilist_shuffle:false,
      }, {skip:["terminal", "repository"]}],
      ["Community templates", {
        template:"@classic",
        setup_community_templates:"lowlighter/metrics@master:classic",
      }, {skip:["terminal", "repository"], modes:["action"]}]
    ]
  }