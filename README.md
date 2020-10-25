# 📊 GitHub metrics

![Build](https://github.com/lowlighter/metrics/workflows/Build/badge.svg) ![Analysis](https://github.com/lowlighter/metrics/workflows/Analysis/badge.svg)

Generates your own GitHub metrics as an SVG image to put them on your profile page or elsewhere !

[![GitHub metrics](https://github.com/lowlighter/lowlighter/blob/master/metrics.svg)](https://metrics.lecoq.io)

But there's more with [plugins](https://github.com/lowlighter/metrics/tree/master/src/plugins) and [templates](https://github.com/lowlighter/metrics/tree/master/src/templates) !

| Additional plugins | Terminal template |
| :----------------: | :---------------: |
|[<img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.demo.svg" alt="" height="220">](https://metrics.lecoq.io?template=classic)|[<img src="https://github.com/lowlighter/lowlighter/blob/master/metrics.terminal.demo.svg" alt="" height="220">](https://metrics.lecoq.io?template=terminal)|

### 🦑 Interested to get your own ?

Try it now at [metrics.lecoq.io](https://metrics.lecoq.io/) with your GitHub username !

For a fully-featured experience, setup this as a [GitHub Action](https://github.com/marketplace/actions/github-metrics-as-svg-image) !

## 📜 How to use ?

### ⚙️ Using GitHub Action on your profile repo (~5 min setup)

Setup a GitHub Action which is run periodically and push a generated SVG image on your repository.

Assuming your username is `my-github-user`, you can embed your metrics in your personal repository's readme like below :

```markdown
![GitHub metrics](https://github.com/my-github-user/my-github-user/blob/master/github-metrics.svg)
```

<details>
<summary>💬 How to setup ?</summary>

#### 0. Prepare your personal repository

If you don't know yet or haven't done it yet, create a repository with the same name as your GitHub username.

![Personal repository](https://github.com/lowlighter/metrics/blob/master/.github/readme/imgs/personal_repo.png)

The `README.md` of this repository will be displayed on your GitHub user profile like below :

![GitHub Profile](https://github.com/lowlighter/metrics/blob/master/.github/readme/imgs/github_profile.png)

#### 1. Setup a GitHub token

Go to `Developer settings` from your GitHub account settings and select `Personal access tokens` to create a new token.

You'll need to create a token with the `public_repo` right so this GitHub Action has enough permissions to push the updated SVG metrics on your personal repository.

![Create a GitHub token](https://github.com/lowlighter/metrics/blob/master/.github/readme/imgs/personal_token.png)

If you choose to use a bot account, you can put `public_repo` rights to the bot token and invite it as a collaborator on your personal profile repository so it has push access. This way, you can use a personnal token with no rights instead and reduce security issues.

#### 2. Put your GitHub token in your personal repository secrets

Go to the `Settings` of your personal repository to create a new secret and paste your GitHub token here.

![Setup secret](https://github.com/lowlighter/metrics/blob/master/.github/readme/imgs/repo_secrets.png)

#### 3. Create a new GitHub Action workflow on your personal repo

Create a new workflow from the `Actions` tab of your personal repository and paste the following.
Don't forget to put your GitHub username !

```yaml
name: GitHub metrics as SVG image
on:
  # Schedule the metrics update
  schedule: [{cron: "0 * * * *"}]
  # (optional) Force update a commit occurs on master branch
  # All commits tagged with [Skip GitHub Action] will be ignored by this GitHub action
  push: {branches: "master"}
jobs:
  github-metrics:
    runs-on: ubuntu-latest
    steps:
      - uses: lowlighter/metrics@latest
        with:

          # Your GitHub token
          token: ${{ secrets.METRICS_TOKEN }}

          # Additional options
          # ==========================================

          # GitHub username (defaults to "token" user)
          user: my-github-user

          # If provided, this token will be used instead of "token" for commit operations
          # You can specify a bot account to avoid virtually increasing your stats due to this action commits
          committer_token: ${{ secrets.METRICS_BOT_TOKEN }}

          # Name of SVG image output
          filename: github-metrics.svg

          # Template to use (see src/templates to get a list of supported templates)
          template: classic

          # Base content to include in metrics (list of comma-separated sections name as string)
          base: "header, activity, community, repositories, metadata"

          # Enable Google PageSpeed metrics for account attached website
          # See https://developers.google.com/speed/docs/insights/v5/get-started for more informations
          plugin_pagespeed: no
          pagespeed_token: ${{ secrets.PAGESPEED_TOKEN }}

          # Enable lines of code metrics
          plugin_lines: no

          # Enable repositories traffic metrics
          # *Provided GitHub token require full "repo" permissions
          plugin_traffic: no

          # Enable coding habits metrics
          # You can also configure the number of activity events to base habits on (up to 100)
          plugin_habits: no
          plugin_habits_from: 100

          # Skip commits flagged with [Skip GitHub Action] from commits count
          plugin_selfskip: no

          # Enable music plugin (checkout documentation for option list)
          plugin_music: no

          # Optimize SVG image
          optimize: yes

          # Number of repositories to use to compute metrics
          repositories: 100

          # Enable debug logs
          debug: no
```

A new SVG image will be generated and committed to your repository on each run.
Because of this, the amount of your commits could be virtually increased which is probably unwanted.

To avoid this, you can use a bot token instead, which will still be able to track metrics of all your public repositories.
If you want to also track your private repositories metrics, you'll need to pass a personal token with full `repo` permissions to your personal `token`, and use the `committer_token` parameter to pass the bot account token.

If you don't want to use a bot token, you can use the `plugin_selfskip` which will count out all your commits from your personal repository tagged with `[Skip GitHub Action]` made with your account, but these commits will still be linked to your account.

![Action update](https://github.com/lowlighter/metrics/blob/master/.github/readme/imgs/action_update.png)

#### 4. Embed the link into your README.md

Edit your README.md on your repository and link it your image :

```markdown
![GitHub metrics](https://github.com/my-github-user/my-github-user/blob/master/github-metrics.svg)
```

</details>

### 💕 Using the shared instance (~1 min setup, but with limitations)

For conveniency, you can use the shared instance available at [metrics.lecoq.io](https://metrics.lecoq.io) without any additional setup.

Assuming your username is `my-github-user`, you can embed your metrics in your personal repository's readme like below :

```markdown
![GitHub metrics](https://metrics.lecoq.io/my-github-user)
```

Visit [metrics.lecoq.io](https://metrics.lecoq.io) for more informations.

<details>
<summary>💬 Restrictions and fair use</summary>

Since GitHub API has rate limitations, the shared instance has a few limitations :
  * Images are cached for 1 hour
    * Your generated metrics won't be updated during this amount of time when queried
  * The rate limiter is enabled, although it won't affect already cached users metrics
  * Plugins which consume additional requests or require elevated token rights are disabled.

To ensure maximum availability, consider deploying your own instance or use the GitHub Action.

</details>

### 🏗️ Deploying your own instance (~15 min setup, depending on your sysadmin knowledge)

You can setup your own instance if you choose to not use the GitHub Action or you want to allow others users to use your instance.

You'll need to create a GitHub token to setup it, however you do not need to grant any additional permissions to your token since it won't push images to any of your repositories. You may still require additional rights for some plugins if you decide to enable them though.

If you intend to share your instance, it is advised to setup either an access list to restrict which users can use it, or to configure the rate limiter to avoid reaching the requests limit of GitHub API.

<details>
<summary>💬 How to setup ?</summary>

#### 0. Prepare your server

You'll need a server where you can install and configure apps.

#### 1. Create a GitHub token

In your account settings, go to `Developer settings` and select `Personal access tokens` to create a new token.
As explained above, you do not need to grant additional permissions to the token unless you want to enable additional plugins.

![Create a GitHub token](https://github.com/lowlighter/metrics/blob/master/.github/readme/imgs/personal_token_alt.png)

#### 2. Install the dependancies

Connect to your server and ensure [NodeJS](https://nodejs.org/en/) is installed (see tested versions in the [build workflows](https://github.com/lowlighter/metrics/blob/master/.github/workflows/build.yml)).

Then run the following commands :

```shell
# Clone this repository (or your fork)
git clone https://github.com/lowlighter/metrics.git
# Install dependancies
cd metrics/
npm install --only=prod
# Copy the settings exemple
cp settings.example.json settings.json
```

#### 3. Configure your instance

Open and edit `settings.json` to configure your instance using a text editor of your choice.

```javascript
{
  //GitHub API token
    "token":"****************************************",

  //Users who are authorized to generate metrics on your instance
  //An empty list or an undefined value will be treated as "unrestricted"
    "restricted":["my-github-user"],

  //Lifetime of generated metrics (cached version will be served instead during this time window)
    "cached":3600000,

  //Number of simultaneous users who can use your instance before sending a "503 error"
  //A zero or an undefined value will be treated as "unlimited"
    "maxusers":0,

  //Rate limiter (see https://www.npmjs.com/package/express-rate-limit)
  //A null or undefined value will be treated as "disabled"
    "ratelimiter":{
      "windowMs":60000,
      "max":100
    },

  //Listening port used by your instance
    "port":3000,

  //Optimize SVG image
    "optimize":true,

  //Debug mode
  //When enabled, templates will be reloaded at each request and cache will be disabled
  //Intended for easier development and disabled by default
    "debug":false,

  //Template configuration
    "templates":{
      //Default template
        "default":"classic",
      //Enabled template. Leave empty to enable all defined templates
        "enabled":[],
    },

  //Plugins configuration
    "plugins":{
      //Google PageSpeed plugin
        "pagespeed":{
          //Enable or disable this plugin. Pass "?pagespeed=1" in url to generate website's performances
            "enabled":false,
          //Pagespeed token (see https://developers.google.com/speed/docs/insights/v5/get-started)
            "token":"****************************************"
        },
      //Lines plugin
        "lines":{
          //Enable or disable this plugin. Pass "?lines=1" in url to compute total lines you added/removed on your repositories
            "enabled":true
        },
      //Traffic plugin
        "traffic":{
          //Enable or disable this plugin. Pass "?traffic=1" in url to compute page views on your repositories in last two weeks
          //*This requires a GitHub API token with push access
            "enabled":true
        },
      //Habits plugin
        "habits":{
          //Enable or disable this plugin. Pass "?habits=1" in url to generate coding habits based on your recent activity
            "enabled":true,
          //Number of events used to compute coding habits (capped at 100 by GitHub API)
            "from":100,
        },
      //Music plugin
        "music":{
          //Enable or disable this plugin. Pass "?music=1" in url to generate music metrics
            "enabled":true,
          //Music provider token, optionally required depending on provider
            "token":"****************************************"
        }
    }
}
```

#### 4. Start your instance

Start your instance once you've finished configuring it :

```shell
npm start
```

And you should be able to access it on the port you provided !

#### 5. Embed the link into your README.md

Edit your `README.md` on your repository and include your metrics from your server domain :

```markdown
![GitHub metrics](https://my-personal-domain.com/my-github-user)
```

#### 6. (optional) Setup as service on your instance

If you want to ensure that your instance will be restarted after reboots or crashes, you should setup it as a service.
This is described below for linux-like systems with *systemd*.

Create a new service file in `/etc/systemd/system` :

```shell
nano /etc/systemd/system/github_metrics.service
```

Paste the following and edit it with the correct paths :

```
[Unit]
Description=GitHub metrics
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
WorkingDirectory=/path/to/metrics
ExecStart=/usr/bin/node /path/to/metrics/index.mjs

[Install]
WantedBy=multi-user.target
```

Reload services, enable it, start it and check it is up and running :

```shell
systemctl daemon-reload
systemctl enable github_metrics
systemctl start github_metrics
systemctl status github_metrics
```

</details>

<details>
<summary>⚠️ HTTP errors code</summary>

The following errors code can be encountered if on a server instance :
* `400 Bad request` : Query is invalid (e.g. unsupported template)
* `403 Forbidden` : User is not allowed in `restricted` users list
* `404 Not found` : GitHub API did not found the requested user
* `429 Too many requests` : Thrown when rate limiter is trigerred
* `500 Internal error` : An error ocurred while generating metrics images (logs can be seen if you're the owner of the instance)
* `503 Service unavailable` : Maximum user capacity reached, only already cached images can be accessed for now

</details>

## 📚 Documentations

### 🖼️ Templates

Templates allows you to style your metrics.
The default is the classic one, but you can change it for something more stylish.

Some metrics may be displayed differently, and it is possible that not all plugins are supported or behave the same from one template to another.

Consider trying them at [metrics.lecoq.io](https://metrics.lecoq.io) !

### 🧩 Plugins

Plugins are features which are disabled by default but they can provide additional metrics.
In return they may require additional configuration and tend to consume additional API requests.

#### 🗃️ Base content

Generated metrics contains a few sections that are enabled by default, such as recent activity, community stats and repositories stats.
This can be configured by explicitely opt-out from them.

<details>
<summary>💬 About</summary>

By default, generated metrics contains the following sections :
* `header`, which usually contains your username, your two-week commits calendars and a few additional data
* `activity`, which contains your recent activity (commits, pull requests, issues, etc.)
* `community`, which contains your community stats (following, sponsors, organizations, etc.)
* `repositories`, which contains your repositories stats (license, forks, stars, etc.)
* `metadata`, which contains informations about generated metrics

You can explicitely opt-out from them, if you want to keep only a few sections or if you want to use a plugin as standalone.

##### Setup with GitHub actions

Choose the parts you want to keep and update your workflow. For exemple, to keep only `header` and `repositories` sections, add the following to your workflow :
```yaml
- uses: lowlighter/metrics@latest
  with:
    # ... other options
    base: "header, repositories" # opt-out from "activity", "community" and "metadata"
```

##### Setup in your own instance

Choose the parts you want to keep and update your url query. For exemple, to keep only `header` and `repositories` sections, pass `?base.activity=0&base.community=0&base.metadata=0` to your url query.

</details>

#### ⏱️ PageSpeed

The *pagespeed* plugin allows you to add the performances of the website attached to the GitHub user account :

![Pagespeed plugin](https://github.com/lowlighter/metrics/blob/master/.github/readme/imgs/plugin_pagespeed.png)

These are computed through [Google's PageSpeed API](https://developers.google.com/speed/docs/insights/v5/get-started), which returns the same results as [web.dev](https://web.dev).

<details>
<summary>💬 About</summary>

This plugin may require an API key that you can generate [here](https://developers.google.com/speed/docs/insights/v5/get-started) although it does not seem mandatory. It is still advised to provide it to avoid 429 HTTP errors.

The website attached to the GitHub profile will be the one to be audited.
Expect 10 to 30 seconds to generate the results.

##### Setup with GitHub actions

Add the following to your workflow :
```yaml
- uses: lowlighter/metrics@latest
  with:
    # ... other options
    plugin_pagespeed: yes
    pagespeed_token: ${{ secrets.PAGESPEED_TOKEN }}
```

##### Setup in your own instance

Add the following to your `settings.json` and pass `?pagespeed=1` in url when generating metrics.
```json
  "plugins":{
    "pagespeed":{
      "enabled":true,
      "token":"****************************************"
    }
  }
```

</details>

#### 🎼 Music

The *music* plugin can work in the following modes :

##### Playlist mode

Select randomly a few tracks from a given playlist so you can suggest your favorite tracks to your visitors.

![Playlist mode](https://github.com/lowlighter/metrics/blob/master/.github/readme/imgs/plugin_music_playlist.png)

<details>
<summary>💬 About</summary>

Select a music provider below for instructions.

<details>
<summary>Apple Music</summary>

You will need to extract the *embed* url of the playlist you want to share.

Connect to [music.apple.com](https://music.apple.com/) and select the playlist you want to share.
From the `...` menu, select `Share` and `Copy embed code`.

![Image](https://github.com/lowlighter/metrics/blob/master/.github/readme/imgs/plugin_music_playlist_apple.png)

Paste the code in your clipboard and extract the source link from it :
```html
<iframe allow="" frameborder="" height="" style="" sandbox="" src="https://embed.music.apple.com/**/playlist/********"></iframe>
```

Once you've extracted the embed url you can finish the setup :

##### Setup with GitHub actions

Add the following to your workflow :
```yaml
- uses: lowlighter/metrics@latest
  with:
    # ... other options
    plugin_music: yes
    plugin_music_provider: apple
    plugin_music_mode: playlist
    plugin_music_playlist: https://********
    plugin_music_limit: 4 # Set the number of tracks you want to display
```

##### Setup in your own instance

Add the following to your `settings.json`.
```json
  "plugins":{
    "music":{
      "enabled":true
    }
  }
```

Pass `?music=1&music.provider=apple&music.mode=playlist&music.playlist=https%3A%2F%2F********` in url when generating metrics.
Note that given url must be escaped (you can use `encodeURIComponent` from your browser console if needed).

You can optionally pass `?music.limit=` parameter to configure the number of tracks to display.

</details>

<details>
<summary>Spotify</summary>

You will need to extract the *embed* url of the playlist you want to share.

Open Spotify and select the playlist you want to share.
From the `...` menu, select `Share` and `Copy embed code`.

![Image](https://github.com/lowlighter/metrics/blob/master/.github/readme/imgs/plugin_music_playlist_spotify.png)

Paste the code in your clipboard and extract the source link from it :
```html
<iframe src="https://open.spotify.com/embed/playlist/********" width="" height="" frameborder="0" allowtransparency="" allow=""></iframe>
```
Once you've extracted the embed url you can finish the setup :

##### Setup with GitHub actions

Add the following to your workflow :
```yaml
- uses: lowlighter/metrics@latest
  with:
    # ... other options
    plugin_music: yes
    plugin_music_provider: spotify
    plugin_music_mode: playlist
    plugin_music_playlist: https://********
    plugin_music_limit: 4 # Set the number of tracks you want to display
```

##### Setup in your own instance

Add the following to your `settings.json`.
```json
  "plugins":{
    "music":{
      "enabled":true
    }
  }
```

Pass `?music=1&music.provider=spotify&music.mode=playlist&music.playlist=https%3A%2F%2F********` in url when generating metrics.
Note that given url must be escaped (you can use `encodeURIComponent` from your browser console if needed).

You can optionally pass `?music.limit=` parameter to configure the number of tracks to display.

</details>

</details>

##### Recently played mode

Display the track you played recently.

![Recently played mode](https://github.com/lowlighter/metrics/blob/master/.github/readme/imgs/plugin_music_recent.png)

<details>
<summary>💬 About</summary>

Select a music provider below for additional instructions.

<details>
<summary>Apple Music</summary>

This mode is not supported for now.

I tried to find a way with *smart playlists*, *shortcuts* and other stuff but could not figure a workaround to do it without paying the 99$ fee for developper program.

So unfortunately this isn't available for now.

</details>

<details>
<summary>Spotify</summary>

Spotify does not have *personal tokens*, so it makes the processus a bit longer because you're required to follow the [authorization workflow](https://developer.spotify.com/documentation/general/guides/authorization-guide/)... Follow the instructions below for *TL;DR* and obtain the `refresh_token`.

Sign-in to the [developer dashboard](https://developer.spotify.com/dashboard/) and create a new app.
Keep your `client_id` and `client_secret` and keep this tab open for now.

![Image](https://github.com/lowlighter/metrics/blob/master/.github/readme/imgs/plugin_music_recent_spotify_token_0.png)

Then open the settings and add a new *Redirect url*. Normally you use it to setup callbacks for your apps, but since we don't have one and it is mandatory as per the [authorization guide](https://developer.spotify.com/documentation/general/guides/authorization-guide/), just put `https://localhost`.

Next forge the url for authorization with your `client_id` and the encoded `redirect_uri` you whitelisted, and access it from your browser.

```
https://accounts.spotify.com/authorize?client_id=********&response_type=code&scope=user-read-recently-played&redirect_uri=https%3A%2F%2Flocalhost
```
When prompted, authorize your application.

![Image](https://github.com/lowlighter/metrics/blob/master/.github/readme/imgs/plugin_music_recent_spotify_token_1.png)

Next you'll be redirected to `redirect_uri`. Extract the generated authorization `code` from your url bar.

![Image](https://github.com/lowlighter/metrics/blob/master/.github/readme/imgs/plugin_music_recent_spotify_token_2.png)

Then go back to the developer dashboard tab, open the web console of your browser and paste the following JavaScript code, with your own `client_id`, `client_secret`, authorization `code` and `redirect_uri`.

```js
(async () => {
  console.log(await (await fetch("https://accounts.spotify.com/api/token", {
    method:"POST",
    headers:{"Content-Type":"application/x-www-form-urlencoded"},
    body:new URLSearchParams({
      grant_type:"authorization_code",
      redirect_uri:"https://localhost",
      client_id:"********",
      client_secret:"********",
      code:"********",
    })
  })).json())
})()
```

It should return a JSON response with the following content :
```json
{
  "access_token":"********",
  "expires_in": 3600,
  "scope":"user-read-recently-played",
  "token_type":"Bearer",
  "refresh_token":"********"
}
```

Now that you've got your `client_id`, `client_secret` and `refresh_token` you can finish the setup :
​
##### Setup with GitHub actions

Add the following to your workflow :
```yaml
- uses: lowlighter/metrics@latest
  with:
    # ... other options
    plugin_music: yes
    plugin_music_provider: spotify
    plugin_music_token: "${{ secrets.SPOTIFY_CLIENT_ID }}, ${{ secrets.SPOTIFY_CLIENT_SECRET }}, ${{ secrets.SPOTIFY_REFRESH_TOKEN }}"
    plugin_music_mode: recent
    plugin_music_limit: 4 # Set the number of tracks you want to display
```

##### Setup in your own instance

Add the following to your `settings.json`.
```json
  "plugins":{
    "music":{
      "enabled":true,
      "token":"****************************************"
    }
  }
```

Pass `?music=1&music.provider=spotify&music.mode=recent` in url when generating metrics.
Note that given url must be escaped (you can use `encodeURIComponent` from your browser console if needed).

You can optionally pass `?music.limit=` parameter to configure the number of tracks to display.

*Note : As you can see, currently this plugin is only designed for a single user, as you can only put one token. But a feature release may allow multiple users.*

</details>

</details>

#### 👨‍💻 Lines

The *lines* of code plugin allows you to compute the number of lines of code you added and removed across all of your repositories.

![Lines plugin](https://github.com/lowlighter/metrics/blob/master/.github/readme/imgs/plugin_lines.png)

<details>
<summary>💬 About</summary>

It will consume an additional GitHub request per repository.

##### Setup with GitHub actions

Add the following to your workflow :
```yaml
- uses: lowlighter/metrics@latest
  with:
    # ... other options
    plugin_lines: yes
```

##### Setup in your own instance

Add the following to your `settings.json` and pass `?lines=1` in url when generating metrics.
```json
  "plugins":{
    "lines":{
      "enabled":true,
    }
  }
```

</details>

#### 🧮 Traffic

The repositories *traffic* plugin allows you to compute the number of pages views across your repositories.

![Traffic plugin](https://github.com/lowlighter/metrics/blob/master/.github/readme/imgs/plugin_traffic.png)

<details>
<summary>💬 About</summary>

It will consume an additional GitHub request per repository.

Because of GitHub REST API limitation, the provided token will require full `repo` permissions to access traffic informations.

![Token with repo permissions](https://github.com/lowlighter/metrics/blob/master/.github/readme/imgs/token_repo_rights.png)

##### Setup with GitHub actions

Add the following to your workflow :
```yaml
- uses: lowlighter/metrics@latest
  with:
    # ... other options
    token: ${{ secrets.METRICS_TOKEN }}
    plugin_traffic: yes
```

##### Setup in your own instance

Add the following to your `settings.json` and pass `?traffic=1` in url when generating metrics.
```json
  "token":"****************************************",
  "plugins":{
    "traffic":{
      "enabled":true,
    }
  }
```

</details>

#### 💡 Habits

The coding *habits* plugin allows you to add deduced coding about based on your recent activity, from up to 100 events.

![Habits plugin](https://github.com/lowlighter/metrics/blob/master/.github/readme/imgs/plugin_habits.png)

<details>
<summary>💬 About</summary>

It will consume an additional GitHub request per event fetched.

Because of GitHub REST API limitation, the provided token will require full `repo` permissions to access **private** events.
By default, events that cannot be fetched will be ignored so you can still use this plugin with a public token.

##### Setup with GitHub actions

Add the following to your workflow :
```yaml
- uses: lowlighter/metrics@latest
  with:
    # ... other options
    plugin_habits: yes
```

##### Setup in your own instance

Add the following to your `settings.json` and pass `?habits=1` in url when generating metrics.
```json
  "plugins":{
    "habits":{
      "enabled":true
    }
  }
```

</details>

#### ✒️ Follow-up

The *follow-up* plugin allows you to compute the ratio of opened/closed issues and the ratio of opened/merged pull requests on your repositories, which shows whether most of them are maintened or not.

![Follow-up plugin](https://github.com/lowlighter/metrics/blob/master/.github/readme/imgs/plugin_followup.png)

<details>
<summary>💬 About</summary>

##### Setup with GitHub actions

Add the following to your workflow :
```yaml
- uses: lowlighter/metrics@latest
  with:
    # ... other options
    plugin_followup: yes
```

##### Setup in your own instance

Add the following to your `settings.json` and pass `?followup=1` in url when generating metrics.
```json
  "plugins":{
    "followup":{
      "enabled":true,
    }
  }
```

</details>

#### 🈷️ Languages

The *languages* plugin allows you to compute which languages you use the most in your repositories.

![Languages plugin](https://github.com/lowlighter/metrics/blob/master/.github/readme/imgs/plugin_languages.png)

<details>
<summary>💬 About</summary>

##### Setup with GitHub actions

Add the following to your workflow :
```yaml
- uses: lowlighter/metrics@latest
  with:
    # ... other options
    plugin_languages: yes
```

##### Setup in your own instance

Add the following to your `settings.json` and pass `?languages=1` in url when generating metrics.
```json
  "plugins":{
    "languages":{
      "enabled":true,
    }
  }
```

</details>

#### ⏭️ Selfskip

The *selfskip* plugin allows you to count out all commits tagged with `[Skip GitHub Action]` you authored on your personal repository from your reported commit counts.

<details>
<summary>💬 About</summary>

It will consume an additional GitHub request per page fetched of your commit activity from your personal repository.

##### Setup with GitHub actions

Add the following to your workflow :
```yaml
- uses: lowlighter/metrics@latest
  with:
    # ... other options
    plugin_selfskip: yes
```

</details>

### 💪 Contributing and customizing

If you would like to suggest a new feature, find a bug or need help, you can fill an [issue](https://github.com/lowlighter/metrics/issues) describing your problem.

If you're motivated enough, you can submit a [pull request](https://github.com/lowlighter/metrics/pulls) to integrate new features or to solve open issues.

Read [contributing.md](https://github.com/lowlighter/metrics/blob/master/CONTRIBUTING.md) for more information about this.

### 📖 Useful references

* [GitHub GraphQL API](https://docs.github.com/en/graphql)
* [GitHub GraphQL Explorer](https://developer.github.com/v4/explorer/)
* [GitHub Rest API](https://docs.github.com/en/rest)

All icons were ripped across GitHub's site, but still remains the intellectual property of GitHub.
See [GitHub Logos and Usage](https://github.com/logos) for more information.

### ✨ Inspirations

* [anuraghazra/github-readme-stats](https://github.com/anuraghazra/github-readme-stats)
* [jstrieb/github-stats](https://github.com/jstrieb/github-stats)
* [ankurparihar/readme-pagespeed-insights](https://github.com/ankurparihar/readme-pagespeed-insights)
