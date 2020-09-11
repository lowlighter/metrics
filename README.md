# 📊 GitHub metrics

Generates your own GitHub metrics as an SVG image to put them on your profile page or elsewhere !

Below is what it looks like :

![GitHub metrics](https://github.com/lowlighter/lowlighter/blob/master/github-metrics.svg)

## 📜 How to use ?

### ⚙️ Using GitHub Action on your profile repo (~5 min setup)

A GitHub Action which is run periodically at your convenience which generates and push an SVG image on your personal repository.

Assuming your username is `my-github-user`, you can embed your metrics in your personal repository's readme like below :
```markdown
![GitHub metrics](https://github.com/my-github-user/my-github-user/blob/master/github-metrics.svg)
# Or with a redirection :  
[![GitHub metrics](https://github.com/my-github-user/my-github-user/blob/master/github-metrics.svg)](https://github.com/my-github-user/my-github-user)
```
```html
<img src="github-metrics.svg" alt="My GitHub metrics">
```

<details>
<summary>💬 How to setup ?</summary>

### 1. Create a GitHub token

In your account settings, go to `Developer settings` and select `Personal access tokens` to create a new token.

You'll need to create a token with the `public_repo` right so this GitHub Action has enough permissions to push the updated SVG metrics on your personal repository.

![Create a GitHub token](https://github.com/lowlighter/metrics/blob/master/docs/imgs/personal_token.png)

### 2. Put your GitHub token in your personal repository secrets

Go to the `Settings` of your personal repository to create a new secret and paste your GitHub token here with the name `METRICS_TOKEN`.

![Setup secret](https://github.com/lowlighter/metrics/blob/master/docs/imgs/repo_secrets.png)

### 3. Create a new GitHub Action workflow on your personal repo

Go to the `Actions` of your personal repository and create a new workflow.

Paste the following and don't forget to put your GitHub username.
```yaml
name: GitHub metrics as SVG image
on:
  # Update metrics each 15 minutes. Edit this if you want to increase/decrease frequency
  # Note that GitHub image cache (5-15 minutes) still apply so it is useless to set less than this, you're image won't be refreshed
  schedule: [{cron: "*/15 * * * *"}]
  # Add this if you want to force update each time you commit on master branch
  push: {branches: "master"}
jobs:
  github-metrics:
    runs-on: ubuntu-latest
    steps:
      - uses: lowlighter/metrics@latest
        # This line will prevent this GitHub action from running when it is updated by itself if you enabled trigger on master branch
        if: "!contains(github.event.head_commit.message, '[Skip GitHub Action]')"
        with:
          # Your GitHub token ("public_repo" is required to allow this action to update the metrics SVG image)
          token: ${{ secrets.METRICS_TOKEN }}
          # Your GitHub user name
          user: my-github-user
```

On each run, a new SVG image will be generated and committed to your repository.
Note that this will virtually increase your commits stats, so you could use a bot account instead.

![Action update](https://github.com/lowlighter/metrics/blob/master/docs/imgs/action_update.png)

# 4. Embed the link into your README.md

Edit your README.md on your repository and link it your image :

```markdown
![GitHub metrics](https://github.com/my-github-user/my-github-user/blob/master/github-metrics.svg)
```

</details>

### 💕 Using the shared instance (~2 min setup, but with limitations)

For conveniency, you can use the shared instance available at [metrics.lecoq.io](https://metrics.lecoq.io).

Assuming your username is `my-github-user`, you can embed your metrics in your personal repository's readme like below :
```markdown
![GitHub metrics](https://metrics.lecoq.io/my-github-user)
# Or with a redirection :  
[![GitHub metrics](https://metrics.lecoq.io/my-github-user)](https://github.com/my-github-user/my-github-user)
```

<details>
<summary>💬 Restrictions and fair use</summary>

Since GitHub API has rate limitations and to avoid abuse, the shared instance has the following limitations :
  * Images are cached for 1 day (meaning that your metrics won't be updated until the next day)
  * A maximum of 1000 users can use this service
  * You're limited to 3 requests per hour (cached metrics are not counted)

You should consider deploying your own instance or use GitHub Action if you're planning using this service.

</details>

### 🏗️ Deploying your own instance (~15 min setup, depending on your sysadmin knowledge)

Using your own instance is useful if you do not want to use GitHub Action or allow others users to use your instance.

A GitHub token is required to setup your instance, however since metrics images are not stored on your repositories you do not need to grant any additional permissions to your token, which reduce security issues.

You can restrict which users can generate metrics on your server and apply rate limiting (which is advised or else you'll hit the GitHub API rate limiter).

It is also easier to change `query.graphql`, `style.css` and `template.svg` if you want to gather additional stats, perform esthetical changes or edit the structure of the SVG image.


<details>
<summary>💬 How to setup in 5 steps</summary>

### 0. Prepare your server

You'll need to have a server at your disposal where you can install and configure stuff.

### 1. Create a GitHub token

In your account settings, go to `Developer settings` and select `Personal access tokens` to create a new token.

As explained above, you do not need to grant additional permissions to the token.

![Create a GitHub token](https://github.com/lowlighter/metrics/blob/master/docs/imgs/personal_token_alt.png)

### 2. Install the dependancies

Connect to your server.

You'll need [NodeJS](https://nodejs.org/en/) (the latter version is better, for reference this was tested on v14.9.0).

Clone the repository

```shell
git clone https://github.com/lowlighter/metrics.git
```

Go inside project and install dependancies :
```shell
cd metrics/
npm install
```

Copy `settings.example.json` to `settings.json`
```shell
cp settings.example.json settings.json
```

### 3. Configure your instance

Open and edit `settings.json` to configure your instance.

```javascript
{
  //Your GitHub API token
    "token":"****************************************",

  //The optionals parameters below allows you to avoid reaching the GitHub API rate limitation

    //A set of whitelisted users which can generate metrics on your instance
    //Leave empty or undefined to disable
    //Defaults to unrestricted
      "restricted":["my-github-user"],

    //Lifetime of each generated metrics
    //If an user's metrics are requested while lifetime is still up, a cached version will be served
    //Defaults to 60 minutes
      "cached":3600000,

    //Maximum simultaneous number of user which can be cached
    //When this limit is reached, new users will receive a 503 error
    //Defaults to 0 (unlimited)
      "maxusers":0,

    //Rate limiter
    //See https://www.npmjs.com/package/express-rate-limit
    //Disabled by default
      "ratelimiter":{
        "windowMs":60000,
        "max":100
      },

  //Port on which your instance listen
  //Defaults to 3000
    "port":3000,

  //Debug mode
  //When enabled, "query.graphql", "style.css" and "template.svg" will be reloaded at each request
  //Cache will be disabled
  //This is intendend for easier development which allows to see your changes quickly
  //Defaults to false
    "debug":false,
}
```

### 4. Start your instance

Run the following command to start your instance :
```shell
npm start
```

Open your browser and test your instance :
```shell
http://localhost:3000/my-github-user
```

### 5. Setup as service on your instance (optional)

You should consider using a service to run your instance.
It will allow to restart automatically on crash and on boot.

Create a new file in `/etc/systemd/system` :
```shell
vi /etc/systemd/system/github_metrics.service
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

Reload services, enable it and start it :
```shell
systemctl daemon-reload
systemctl enable github_metrics
systemctl start github_metrics
```

Check if your service is up and running :
```shell
systemctl status github_metrics
```

# 6. Embed the link into your README.md

Edit your README.md on your repository and link it your image :

```markdown
![GitHub metrics](https://my-personal-domain.com/my-github-user)
```

</details>

## 🗂️ Project structure

* `index.mjs` contains the entry points and the settings instance
* `src/app.mjs` contains the server code which serves renders and apply rate limiting, restrictions, etc.
* `src/metrics.mjs` contains metrics renderer
* `src/query.graphql` is the GraphQL query which is sent to GitHub API
* `src/style.css` contains the style for the generated svg image metrics
* `src/template.svg` contains the structure of the generated svg image metrics
* `action/index.mjs` contains the GitHub action code
* `action/dist/index.js` contains compiled the GitHub action code
* `utils/*` contains various utilitaries for build

## ⚠️ HTTP errors code

The following errors code can be encountered if your using a server instance :

* 403 Forbidden : User is not whitelisted in `restricted` users list
* 404 Not found : GitHub API did not found the requested user
* 429 Too many requests : Thrown when rate limiter is trigerred
* 500 Internal error : An error ocurred while generating metrics images (logs can be seen if you're the owner of the instance)
* 503 Service unavailable : Maximum user capacity reached, only already cached images can be accessed for now

## 📚 Documentations

Below is a list of useful documentations links :

* [GitHub GraphQL API](https://docs.github.com/en/graphql)
* [GitHub GraphQL Explorer](https://developer.github.com/v4/explorer/)

## 📦 Used packages

Below is a list of primary dependencies :

* [express/express.js](https://github.com/expressjs/express)
  * To serve, compute and render a GitHub user's metrics
* [nfriedly/express-rate-limit](https://github.com/nfriedly/express-rate-limit)
  * To apply rate limiting on server and avoid spams and hitting GitHub API's own rate limit
* [octokit/graphql.js](https://github.com/octokit/graphql.js/)
  * To perform request to GitHub GraphQL API
* [ptarjan/node-cache](https://github.com/ptarjan/node-cache)
  * To cache generated content and reduce
* [renanbastos93/image-to-base64](https://github.com/renanbastos93/image-to-base64)
  * To generate base64 representation of users' avatars

All icons were ripped across GitHub's site, but still remains the intellectual property of GitHub.
See [GitHub Logos and Usage](https://github.com/logos) for more information.

## ✨ Inspirations

This project was inspired by the following projects :

* [anuraghazra/github-readme-stats](https://github.com/anuraghazra/github-readme-stats)
* [jstrieb/github-stats](https://github.com/jstrieb/github-stats)
