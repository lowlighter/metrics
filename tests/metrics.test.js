//Imports
  const processes = require("child_process")
  const yaml = require("js-yaml")
  const fs = require("fs")

//Github action
  const action = yaml.safeLoad(fs.readFileSync("action.yml", "utf8"))
  action.defaults = Object.fromEntries(Object.entries(action.inputs).map(([key, {default:value}]) => [key, /^(yes|no)$/.test(value) ? value === "yes" : value]))
  action.input = vars => Object.fromEntries([...Object.entries(action.defaults), ...Object.entries(vars)].map(([key, value]) => [`INPUT_${key.toLocaleUpperCase()}`, value]))
  action.run =  async (vars) => await new Promise((solve, reject) => {
    let [stdout, stderr] = ["", ""]
    const env = {...process.env, ...action.input(vars), GITHUB_REPOSITORY:"lowlighter/metrics"}
    const child = processes.spawn("node", ["action/index.mjs"], {env})
    child.stdout.on("data", data => stdout += data)
    child.stderr.on("data", data => stderr += data)
    child.on("close", code => {
      if (code === 0)
        return solve(true)
      console.log(stdout, stderr)
      reject(stdout)
    })
  })

//Tests run
  describe.each([
    ["classic", {}],
    ["terminal", {}],
    ["repository", {repo:"metrics"}],
  ])("Template : %s", (template, query) => {
    for (const [name, input, {skip = []} = {}] of [
      ["Base (header)", {
        base:"header"
      }],
      ["Base (activity", {
        base:"activity"
      }],
      ["Base (community)", {
        base:"community"
      }],
      ["Base (repositories)", {
        base:"repositories"
      }],
      ["Base (metadata)", {
        base:"metadata"
      }],
      ["Base (complete)", {
        base:"header, activity, community, repositories, metadata"
      }],
      ["PageSpeed plugin (default)", {
        plugin_pagespeed:true,
      }, {skip:["repository"]}],
      ["PageSpeed plugin (detailed)", {
        plugin_pagespeed:true,
        plugin_pagespeed_detailed:true,
      }, {skip:["repository"]}],
      ["PageSpeed plugin (screenshot)", {
        plugin_pagespeed:true,
        plugin_pagespeed_screenshot:true,
      }, {skip:["repository"]}],
      ["PageSpeed plugin (complete)", {
        plugin_pagespeed:true,
        plugin_pagespeed_detailed:true,
        plugin_pagespeed_screenshot:true,
      }, {skip:["repository"]}],
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
      ["Language plugin (default)", {
        plugin_languages:true,
      }, {skip:["repository"]}],
      ["Language plugin (ignored languages)", {
        plugin_languages:true,
        plugin_languages_ignored:"html, css, dockerfile",
      }, {skip:["repository"]}],
      ["Language plugin (skipped repositories)", {
        plugin_languages:true,
        plugin_languages_skipped:"metrics",
      }, {skip:["repository"]}],
      ["Language plugin (complete)", {
        plugin_languages:true,
        plugin_languages_ignored:"html, css, dockerfile",
        plugin_languages_skipped:"metrics",
      }, {skip:["repository"]}],
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
        plugin_habits_charts:true,
      }, {skip:["terminal", "repository"]}],
      ["Gists plugin (default)", {
        plugin_gists:true,
      }, {skip:["terminal"]}],
    ])
      if (skip.includes(template))
        test.skip(name, () => null)
      else
        test(name, async () => expect(await action.run({
          token:"MOCKED_TOKEN",
          plugin_pagespeed_token:"MOCKED_TOKEN",
          plugin_tweets_token:"MOCKED_TOKEN",
          plugin_music_token:"MOCKED_CLIENT_ID, MOCKED_CLIENT_SECRET, MOCKED_REFRESH_TOKEN",
          template, base:"", query:JSON.stringify(query),
          config_timezone:"Europe/Paris",
          plugins_errors_fatal:true, dryrun:true, use_mocked_data:true, verify:true,
          ...input
        })).toBe(true), 60*1e3)
  })
