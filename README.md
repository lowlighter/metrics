# 📊 GitHub metrics

![Build](https://github.com/lowlighter/metrics/workflows/Build/badge.svg) ![Analysis](https://github.com/lowlighter/metrics/workflows/Analysis/badge.svg)

Generates your own GitHub metrics as an SVG image to put them on your profile page or elsewhere !

![GitHub metrics](https://github.com/lowlighter/lowlighter/blob/master/github-metrics-alt.svg)

Still not enough data for you ? You can enable additional plugins for even more metrics !

![GitHub metrics](https://github.com/lowlighter/lowlighter/blob/master/github-metrics.svg)

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
          plugin_habits: no

          # Skip commits flagged with [Skip GitHub Action] from commits count
          plugin_selfskip: no

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

<details>
<summary>💬 Restrictions and fair use</summary>

Since GitHub API has rate limitations, the shared instance has a few limitations :
  * Images are cached for 1 hour
    * Your generated metrics won't be updated during this amount of time
    * If you enable or disable plugins in url parameters, you'll need to wait for cache expiration before these changes are applied
  * The rate limiter is enabled, although it won't affect already cached users metrics
  * Plugins which consume additional requests or require elevated token rights are disabled. The following plugins are available :
    * PageSpeed plugin can be enabled by passing `?pagespeed=1`, but metrics generation can take up some time when it has not been cached yet
    * Languages plugin can be enabled by passing `?languages=1`
    * Follow-up plugin can be enabled by passing `?followup=1`

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

### 🧩 Plugins

Plugins are features which are disabled by default but they can provide additional metrics.
In return they may require additional configuration and tend to consume additional API requests.

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
